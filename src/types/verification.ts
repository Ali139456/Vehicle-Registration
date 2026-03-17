export type VerificationStatus = 'verified' | 'suspicious' | 'failed';

export interface RegistrationData {
  rego: string;
  vin: string;
  owner: string;
  address?: string;
  expiry: string;
  state: string;
  issuingAuthority?: string;
}

export interface IdentityData {
  name: string;
  dob: string;
  licence_number?: string;
  document_number?: string;
}

export interface VerificationResult {
  status: VerificationStatus;
  score: number;
  owner_match: boolean;
  document_authentic: boolean;
  vehicle_valid: boolean;
  registration_data?: RegistrationData;
  identity_data?: IdentityData;
  fraud_signals: FraudSignal[];
  message?: string;
}

export interface FraudSignal {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface AuthenticityResult {
  authentic: boolean;
  score: number;
  signals: FraudSignal[];
}
