export interface OwnerBasicDetails {
  firstName: string;
  lastName: string;
  role?: string;
  picture?: string;
}

export interface OwnerEmail {
  id: string;
  label: string;
  email: string;
  note?: string;
  isPrimary?: boolean;
}

export interface OwnerPhone {
  id: string;
  label: string;
  number: string;
  extension?: string;
  note?: string;
}

export interface OwnerAddress {
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

export interface OwnerDetailsState {
  loading: boolean;
  error: string | null;
  details: OwnerBasicDetails | null;
  emails: OwnerEmail[];
  phones: OwnerPhone[];
  addresses: OwnerAddress[];
}

