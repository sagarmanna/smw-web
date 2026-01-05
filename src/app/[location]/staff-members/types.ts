export interface StaffMemberBasicDetails {
  firstName: string;
  lastName: string;
  role?: string;
  picture?: string;
  [key: string]: unknown; // Allow module-specific fields for GenericBasicDetails compatibility
}

export interface StaffMemberEmail {
  id: string;
  label: string;
  email: string;
  note?: string;
  isPrimary?: boolean;
}

export interface StaffMemberPhone {
  id: string;
  label: string;
  number: string;
  extension?: string;
  note?: string;
}

export interface StaffMemberAddress {
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

export interface StaffMemberDetailsState {
  loading: boolean;
  error: string | null;
  details: StaffMemberBasicDetails | null;
  emails: StaffMemberEmail[];
  phones: StaffMemberPhone[];
  addresses: StaffMemberAddress[];
}

