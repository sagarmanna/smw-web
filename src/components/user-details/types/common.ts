// Generic types that all user detail modules can map to

export interface GenericBasicDetails {
  firstName: string;
  lastName: string;
  role?: string;
  picture?: string;
  [key: string]: unknown; // Allow module-specific fields
}

export interface GenericEmail {
  id: string;
  label: string;
  email: string;
  note?: string;
  isPrimary?: boolean;
}

export interface GenericPhone {
  id: string;
  label: string;
  number: string;
  extension?: string;
  note?: string;
}

export interface GenericAddress {
  id: string;
  label: string;
  address: string;
  city: string;
  cityId: number;
  provinceId: number;
  countryId: number;
  postalCode: string;
  province?: string;
  country?: string;
  isPrimary?: boolean;
}

