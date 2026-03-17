import { validateVin } from './vin';
import { isRegistrationExpired } from './expiry';

export interface VehicleValidationResult {
  valid: boolean;
  vinValid: boolean;
  expiryValid: boolean;
  errors: string[];
}

export function validateVehicle(vin: string | undefined, expiry: string | undefined): VehicleValidationResult {
  const errors: string[] = [];
  const vinResult = vin ? validateVin(vin) : { valid: false, error: 'VIN missing' };
  const vinValid = vinResult.valid;
  if (!vinValid && vinResult.error) errors.push(vinResult.error);

  const expiryValid = !expiry || !isRegistrationExpired(expiry);
  if (expiry && isRegistrationExpired(expiry)) errors.push('Registration has expired');

  return {
    valid: vinValid && expiryValid,
    vinValid,
    expiryValid,
    errors,
  };
}

export { validateVin, isValidVinFormat, validateVinChecksum } from './vin';
export { parseExpiryDate, isRegistrationExpired } from './expiry';
