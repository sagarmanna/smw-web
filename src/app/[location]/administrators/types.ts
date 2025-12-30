export interface AdministratorBasicDetails {
  firstName: string;
  lastName: string;
  role?: string;
  picture?: string;
}

export interface AdministratorEmail {
  id: string;
  label: string;
  email: string;
  note?: string;
  isPrimary?: boolean;
}

export interface AdministratorPhone {
  id: string;
  label: string;
  number: string;
  extension?: string;
  note?: string;
}

export interface AdministratorAddress {
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

export interface AdministratorDetailsState {
  loading: boolean;
  error: string | null;
  details: AdministratorBasicDetails | null;
  emails: AdministratorEmail[];
  phones: AdministratorPhone[];
  addresses: AdministratorAddress[];
}

