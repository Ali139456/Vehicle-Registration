import type { AuthenticityResult, FraudSignal } from '@/types/verification';

/**
 * Heuristic document authenticity checks.
 * In production, add: layout comparison to known templates, font analysis, metadata checks.
 */
export function checkDocumentAuthenticity(
  _buffer: Buffer,
  options: { fileName?: string; mimeType?: string }
): AuthenticityResult {
  const signals: FraudSignal[] = [];
  const { fileName = '', mimeType = '' } = options;

  // Metadata / file type anomalies
  if (fileName.toLowerCase().endsWith('.pdf')) {
    // Could detect modified PDFs via metadata or structure; placeholder
    // signals.push({ type: 'metadata_anomaly', severity: 'low', description: 'PDF metadata not verified' });
  }
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (mimeType && !allowedTypes.includes(mimeType)) {
    signals.push({
      type: 'unexpected_file_type',
      severity: 'medium',
      description: `Unexpected file type: ${mimeType}`,
    });
  }

  // Start with high trust; deduct for each signal
  let score = 100;
  for (const s of signals) {
    if (s.severity === 'high') score -= 40;
    else if (s.severity === 'medium') score -= 20;
    else score -= 10;
  }
  score = Math.max(0, score);

  return {
    authentic: signals.filter((s) => s.severity === 'high').length === 0 && score >= 50,
    score,
    signals,
  };
}
