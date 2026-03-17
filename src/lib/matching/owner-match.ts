import stringSimilarity from 'string-similarity';

/**
 * Normalise name for comparison: lowercase, collapse spaces, remove punctuation.
 */
function normaliseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compare registration owner name with ID document name.
 * Returns similarity 0–100 and whether we consider it a match (e.g. >= 80%).
 */
export function matchOwnerName(
  registrationOwner: string,
  idDocumentName: string
): { similarity: number; match: boolean } {
  if (!registrationOwner?.trim() || !idDocumentName?.trim()) {
    return { similarity: 0, match: false };
  }
  const a = normaliseName(registrationOwner);
  const b = normaliseName(idDocumentName);
  const similarity = stringSimilarity.compareTwoStrings(a, b);
  const percent = Math.round(similarity * 100);
  const match = percent >= 80;
  return { similarity: percent, match };
}
