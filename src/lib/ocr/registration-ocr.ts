import type { RegistrationData } from '@/types/verification';

const VIN_REGEX = /[A-HJ-NPR-Z0-9]{17}/gi;
const REGO_REGEX = /[A-Z]{2,3}\s?\d{2,4}[A-Z]?|[A-Z]\d{1,4}[A-Z]{2,3}/gi;
const AU_STATE = /\b(NSW|VIC|QLD|WA|SA|TAS|NT|ACT)\b/i;
const DATE_REGEX = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/g;

/**
 * Extract registration document fields from OCR text.
 * In production, plug in Google Vision or AWS Textract for better accuracy.
 */
export function parseRegistrationFromText(ocrText: string): Partial<RegistrationData> {
  const text = ocrText.replace(/\s+/g, ' ').trim();
  const result: Partial<RegistrationData> = {};

  const vins = text.match(VIN_REGEX);
  if (vins?.length) result.vin = vins[0].toUpperCase();

  const regos = text.match(REGO_REGEX);
  if (regos?.length) result.rego = regos[0].replace(/\s/g, '').toUpperCase();

  const states = text.match(AU_STATE);
  if (states?.length) result.state = states[0].toUpperCase();

  const dates = text.match(DATE_REGEX);
  if (dates?.length) {
    // Prefer date that looks like expiry (future or recent)
    result.expiry = dates[0];
  }

  // Owner: look for "Owner" or "Registered Operator" followed by name (heuristic)
  const ownerMatch = text.match(/(?:owner|registered\s+operator|name)\s*:?\s*([A-Za-z\s\-']{3,40})/i);
  if (ownerMatch) result.owner = ownerMatch[1].trim();

  return result;
}
