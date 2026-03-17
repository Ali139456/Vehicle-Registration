import { NextRequest, NextResponse } from 'next/server';
import { extractRegistrationData, extractIdentityData } from '@/lib/ocr';
import { checkDocumentAuthenticity } from '@/lib/authenticity/document-authenticity';
import { matchOwnerName } from '@/lib/matching/owner-match';
import { validateVehicle } from '@/lib/vehicle';
import type { VerificationResult, VerificationStatus, FraudSignal } from '@/types/verification';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const maxDuration = 60;

function computeStatus(score: number, ownerMatch: boolean, documentAuthentic: boolean, vehicleValid: boolean): VerificationStatus {
  if (score >= 80 && ownerMatch && documentAuthentic && vehicleValid) return 'verified';
  if (score >= 50 || ownerMatch) return 'suspicious';
  return 'failed';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const registrationFile = formData.get('registration_document') as File | null;
    const idFile = formData.get('id_document') as File | null;
    const selfieFile = formData.get('selfie') as File | null;

    if (!registrationFile?.size || !idFile?.size) {
      return NextResponse.json(
        { error: 'Missing registration_document or id_document' },
        { status: 400 }
      );
    }

    const fraudSignals: FraudSignal[] = [];
    let ownerMatch = false;
    let documentAuthentic = true;
    let vehicleValid = false;

    // 1) OCR – registration
    const regoBuffer = Buffer.from(await registrationFile.arrayBuffer());
    const registrationData = await extractRegistrationData(regoBuffer);
    if (!registrationData.rego && !registrationData.vin) {
      fraudSignals.push({
        type: 'ocr_mismatch',
        severity: 'high',
        description: 'Could not extract registration number or VIN from document',
      });
    }

    // 2) OCR – identity
    const idBuffer = Buffer.from(await idFile.arrayBuffer());
    const identityData = await extractIdentityData(idBuffer);
    if (!identityData.name) {
      fraudSignals.push({
        type: 'id_ocr_fail',
        severity: 'medium',
        description: 'Could not extract name from ID document',
      });
    }

    // 3) Document authenticity (registration + ID)
    const regoAuth = checkDocumentAuthenticity(regoBuffer, {
      fileName: registrationFile.name,
      mimeType: registrationFile.type,
    });
    const idAuth = checkDocumentAuthenticity(idBuffer, {
      fileName: idFile.name,
      mimeType: idFile.type,
    });
    if (!regoAuth.authentic) {
      documentAuthentic = false;
      fraudSignals.push(...regoAuth.signals);
    }
    if (!idAuth.authentic) {
      documentAuthentic = false;
      fraudSignals.push(...idAuth.signals);
    }

    // 4) Owner name matching
    const regoOwner = registrationData.owner ?? '';
    const idName = identityData.name ?? '';
    const matchResult = matchOwnerName(regoOwner, idName);
    ownerMatch = matchResult.match;
    if (!ownerMatch && regoOwner && idName) {
      fraudSignals.push({
        type: 'identity_mismatch',
        severity: 'high',
        description: `Owner name similarity ${matchResult.similarity}% (registration: "${regoOwner}", ID: "${idName}")`,
      });
    }

    // 5) Vehicle validation
    const vehicleResult = validateVehicle(registrationData.vin, registrationData.expiry);
    vehicleValid = vehicleResult.valid;
    for (const err of vehicleResult.errors) {
      fraudSignals.push({
        type: 'vehicle_validation',
        severity: vehicleResult.vinValid ? 'medium' : 'high',
        description: err,
      });
    }

    // Score: 0–100
    let score = 100;
    score -= fraudSignals.filter((s) => s.severity === 'high').length * 25;
    score -= fraudSignals.filter((s) => s.severity === 'medium').length * 10;
    score -= fraudSignals.filter((s) => s.severity === 'low').length * 5;
    if (!ownerMatch) score -= 20;
    if (!documentAuthentic) score -= 25;
    if (!vehicleValid) score -= 20;
    score = Math.max(0, Math.min(100, score));

    const status = computeStatus(score, ownerMatch, documentAuthentic, vehicleValid);

    const result: VerificationResult = {
      status,
      score,
      owner_match: ownerMatch,
      document_authentic: documentAuthentic,
      vehicle_valid: vehicleValid,
      registration_data: registrationData as any,
      identity_data: identityData as any,
      fraud_signals: fraudSignals,
      message:
        status === 'verified'
          ? 'Document and identity verified.'
          : status === 'suspicious'
            ? 'Verification inconclusive; manual review recommended.'
            : 'Verification failed.',
    };

    // Optional: persist to Supabase when configured
    if (supabase) {
      const { data: row, error } = await supabase
        .from('verifications')
        .insert({
          status: result.status,
          score: result.score,
          owner_match: result.owner_match,
          document_authentic: result.document_authentic,
          vehicle_valid: result.vehicle_valid,
          rego: registrationData.rego,
          vin: registrationData.vin,
          registration_owner: registrationData.owner,
          id_document_name: identityData.name,
          raw_rego_data: registrationData,
          raw_id_data: identityData,
          fraud_signals: result.fraud_signals,
        })
        .select('id')
        .single();

      if (!error && row) {
        (result as any).verification_id = row.id;
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('verify-registration error', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Verification failed' },
      { status: 500 }
    );
  }
}
