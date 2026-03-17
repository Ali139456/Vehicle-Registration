/**
 * VIN format: 17 characters, excluding I, O, Q.
 * Position 9 is check digit (0-9 or X for 10).
 */
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

const VIN_TRANSLITERATION: Record<string, number> = {};
'0123456789'.split('').forEach((c, i) => (VIN_TRANSLITERATION[c] = i));
'ABCDEFGHJKLMNPRSTUVWXYZ'.split('').forEach((c, i) => {
  const n = i + 1;
  if (n >= 9) VIN_TRANSLITERATION[c] = n + 1; // I,O,Q skipped
  else VIN_TRANSLITERATION[c] = n;
});

export function isValidVinFormat(vin: string): boolean {
  if (!vin || vin.length !== 17) return false;
  return VIN_REGEX.test(vin);
}

export function validateVinChecksum(vin: string): boolean {
  if (!isValidVinFormat(vin)) return false;
  const u = vin.toUpperCase();
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = u[i];
    const value = char === 'X' ? 10 : VIN_TRANSLITERATION[char];
    if (value === undefined) return false;
    sum += value * VIN_WEIGHTS[i];
  }
  const remainder = sum % 11;
  const checkDigit = remainder === 10 ? 'X' : String(remainder);
  return u[8] === checkDigit;
}

export function validateVin(vin: string): { valid: boolean; error?: string } {
  if (!vin?.trim()) return { valid: false, error: 'VIN missing' };
  if (!isValidVinFormat(vin)) return { valid: false, error: 'VIN must be 17 characters (no I, O, Q)' };
  if (!validateVinChecksum(vin)) return { valid: false, error: 'VIN check digit invalid' };
  return { valid: true };
}
