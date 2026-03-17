import type { IdentityData } from '@/types/verification';

const DATE_REGEX = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/g;
const LICENCE_NUM = /(?:licence|license|lic)\s*#?\s*:?\s*(\d{6,12})/i;
const DOC_NUM = /(?:document|doc)\s*#?\s*:?\s*([A-Z0-9]{6,15})/i;

/**
 * Extract identity fields from ID document OCR text.
 */
export function parseIdentityFromText(ocrText: string): Partial<IdentityData> {
  const text = ocrText.replace(/\s+/g, ' ').trim();
  const result: Partial<IdentityData> = {};

  const dates = text.match(DATE_REGEX);
  if (dates?.length) {
    // Often DOB is the first or a date in "DOB: dd/mm/yyyy" form
    const dobMatch = text.match(/(?:dob|date\s+of\s+birth|birth)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    result.dob = dobMatch ? dobMatch[1] : dates[0];
  }

  const licMatch = text.match(LICENCE_NUM);
  if (licMatch) result.licence_number = licMatch[1];

  const docMatch = text.match(DOC_NUM);
  if (docMatch) result.document_number = docMatch[1];

  // Name: "Name" or "Surname" / "Given names" pattern
  const nameMatch = text.match(/(?:name|full\s+name)\s*:?\s*([A-Za-z\s\-']{3,50})/i);
  if (nameMatch) result.name = nameMatch[1].trim();

  return result;
}
