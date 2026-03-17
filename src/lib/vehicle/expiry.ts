/**
 * Parse common date strings and check if registration is expired.
 */
export function parseExpiryDate(expiryStr: string): Date | null {
  if (!expiryStr?.trim()) return null;
  const s = expiryStr.trim().replace(/\s/g, '');
  // dd/mm/yyyy or dd-mm-yyyy or yyyy-mm-dd
  const parts = s.split(/[\/\-]/);
  if (parts.length !== 3) return null;
  let day: number, month: number, year: number;
  if (parts[0].length === 4) {
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else {
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
  }
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const d = new Date(year, month, day);
  if (isNaN(d.getTime())) return null;
  return d;
}

export function isRegistrationExpired(expiryStr: string): boolean {
  const d = parseExpiryDate(expiryStr);
  if (!d) return true; // unknown = treat as expired for safety
  return d < new Date();
}
