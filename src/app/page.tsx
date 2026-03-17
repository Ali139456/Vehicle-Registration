'use client';

import { useState } from 'react';
import { VerificationStatus } from '@/types/verification';
import { FileDropZone } from '@/components/FileDropZone';

interface VerificationResponse {
  status: VerificationStatus;
  score: number;
  owner_match: boolean;
  document_authentic: boolean;
  vehicle_valid: boolean;
  registration_data?: {
    rego?: string;
    vin?: string;
    owner?: string;
    expiry?: string;
    state?: string;
  };
  identity_data?: {
    name?: string;
    dob?: string;
    licence_number?: string;
  };
  fraud_signals?: { type: string; severity: string; description: string }[];
  message?: string;
  verification_id?: string;
}

const DocIcon = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IdIcon = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
  </svg>
);

const SelfieIcon = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function Home() {
  const [registrationFile, setRegistrationFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!registrationFile || !idFile) {
      setError('Please upload both registration and ID documents.');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append('registration_document', registrationFile);
      form.append('id_document', idFile);
      if (selfieFile) form.append('selfie', selfieFile);

      const res = await fetch('/api/verify-registration', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification request failed');
        return;
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  const statusConfig = {
    verified: {
      label: 'Verified',
      className: 'bg-[var(--verified-bg)] text-[var(--verified)] border-[var(--verified)]/40',
      ring: 'stroke-green-500',
      icon: '✓',
    },
    suspicious: {
      label: 'Suspicious',
      className: 'bg-[var(--suspicious-bg)] text-[var(--suspicious)] border-[var(--suspicious)]/40',
      ring: 'stroke-amber-500',
      icon: '!',
    },
    failed: {
      label: 'Failed',
      className: 'bg-[var(--failed-bg)] text-[var(--failed)] border-[var(--failed)]/40',
      ring: 'stroke-red-500',
      icon: '✕',
    },
  };

  const cfg = result ? statusConfig[result.status] : null;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = result ? circumference - (result.score / 100) * circumference : circumference;

  return (
    <main className="min-h-screen bg-mesh">
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Hero */}
        <header className="text-center mb-12 md:mb-14">
          <p className="text-blue-400/90 text-sm font-semibold tracking-wider uppercase mb-3">
            Document verification
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            VehicleRegistration<span className="text-green-400">.ai</span>
          </h1>
          <p className="text-slate-400 mt-3 text-lg max-w-md mx-auto">
            Verify registration documents and owner identity in seconds
          </p>
        </header>

        {/* Upload card */}
        <section className="rounded-2xl border border-white/[0.06] bg-[var(--surface)]/80 shadow-card backdrop-blur-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm">
                1
              </span>
              Upload documents
            </h2>
            <p className="text-slate-500 text-sm mt-1 ml-10">
              Registration paper, ID and optional selfie
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-1">
              <FileDropZone
                label="Vehicle registration"
                required
                accept="image/*,.pdf"
                file={registrationFile}
                onFileChange={setRegistrationFile}
                icon={<DocIcon />}
              />
              <FileDropZone
                label="Driver licence or passport"
                required
                accept="image/*,.pdf"
                file={idFile}
                onFileChange={setIdFile}
                icon={<IdIcon />}
              />
              <FileDropZone
                label="Selfie"
                accept="image/*"
                file={selfieFile}
                onFileChange={setSelfieFile}
                icon={<SelfieIcon />}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 text-sm flex items-center gap-2">
                <span className="text-red-400">●</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-white transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-glow flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying…
                </>
              ) : (
                'Verify registration'
              )}
            </button>
          </form>
        </section>

        {/* Result */}
        {result && (
          <section className="mt-10 rounded-2xl border border-white/[0.06] bg-[var(--surface)]/80 shadow-card backdrop-blur-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
<span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 text-sm">
                2
                </span>
                Result
              </h2>
            </div>
            <div className="p-6 md:p-8 space-y-8">
              {/* Score + Status */}
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative flex-shrink-0">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={scoreOffset}
                      className={`transition-all duration-700 ease-out ${cfg?.ring ?? ''}`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
                    {result.score}
                  </span>
                </div>
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold ${cfg?.className}`}>
                      <span>{cfg?.icon}</span>
                      {cfg?.label}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{result.message}</p>
                </div>
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Owner match', value: result.owner_match },
                  { label: 'Document authentic', value: result.document_authentic },
                  { label: 'Vehicle valid', value: result.vehicle_valid },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[var(--surface-elevated)]/50 px-4 py-3"
                  >
                    <span className="text-slate-400 text-sm">{label}</span>
                    <span className={value ? 'text-green-400' : 'text-red-400'}>
                      {value ? 'Yes' : 'No'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Extracted data */}
              {(result.registration_data?.rego || result.registration_data?.owner || result.identity_data?.name) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.registration_data && (result.registration_data.rego || result.registration_data.owner) && (
                    <div className="rounded-xl border border-white/[0.06] bg-[var(--surface-elevated)]/50 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Registration</span>
                      </div>
                      <dl className="p-4 space-y-2 text-sm">
                        {result.registration_data.rego && (
                          <div><dt className="text-slate-500">Rego</dt><dd className="font-mono text-white">{result.registration_data.rego}</dd></div>
                        )}
                        {result.registration_data.vin && (
                          <div><dt className="text-slate-500">VIN</dt><dd className="font-mono text-white break-all">{result.registration_data.vin}</dd></div>
                        )}
                        {result.registration_data.owner && (
                          <div><dt className="text-slate-500">Owner</dt><dd className="text-white">{result.registration_data.owner}</dd></div>
                        )}
                        {result.registration_data.expiry && (
                          <div><dt className="text-slate-500">Expiry</dt><dd className="text-white">{result.registration_data.expiry}</dd></div>
                        )}
                        {result.registration_data.state && (
                          <div><dt className="text-slate-500">State</dt><dd className="text-white">{result.registration_data.state}</dd></div>
                        )}
                      </dl>
                    </div>
                  )}
                  {result.identity_data?.name && (
                    <div className="rounded-xl border border-white/[0.06] bg-[var(--surface-elevated)]/50 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Identity</span>
                      </div>
                      <dl className="p-4 space-y-2 text-sm">
                        <div><dt className="text-slate-500">Name</dt><dd className="text-white">{result.identity_data.name}</dd></div>
                        {result.identity_data.dob && (
                          <div><dt className="text-slate-500">DOB</dt><dd className="text-white">{result.identity_data.dob}</dd></div>
                        )}
                        {result.identity_data.licence_number && (
                          <div><dt className="text-slate-500">Licence #</dt><dd className="font-mono text-white">{result.identity_data.licence_number}</dd></div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              )}

              {/* Fraud signals */}
              {result.fraud_signals && result.fraud_signals.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Risk signals</h3>
                  <ul className="space-y-2">
                    {result.fraud_signals.map((s, i) => (
                      <li
                        key={i}
                        className={`rounded-lg border px-4 py-2.5 text-sm ${
                          s.severity === 'high'
                            ? 'border-red-500/30 bg-red-500/10 text-red-300'
                            : s.severity === 'medium'
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                              : 'border-white/[0.06] bg-white/[0.02] text-slate-400'
                        }`}
                      >
                        <span className="font-medium capitalize text-slate-400 mr-2">[{s.severity}]</span>
                        {s.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.verification_id && (
                <p className="text-xs text-slate-600">
                  Verification ID: <code className="text-slate-500">{result.verification_id}</code>
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
