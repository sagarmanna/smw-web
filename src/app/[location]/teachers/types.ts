export interface TeacherBasicDetails {
  firstName: string;
  lastName: string;
  role?: string;
  birthDate?: string;
  picture?: string;
}

export interface TeacherEmail {
  id: string;
  label: string;
  email: string;
  note?: string;
  isPrimary?: boolean;
}

export interface TeacherPhone {
  id: string;
  label: string;
  number: string;
  extension?: string;
  note?: string;
}

export interface TeacherAddress {
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

export interface TeacherQualification {
  id: string;
  name: string;
  rate?: number;
  description?: string;
  dateObtained?: string;
}

export interface TeacherDetailsState {
  loading: boolean;
  error: string | null;
  details: TeacherBasicDetails | null;
  emails: TeacherEmail[];
  phones: TeacherPhone[];
  addresses: TeacherAddress[];
  privateQualifications: TeacherQualification[];
  groupQualifications: TeacherQualification[];
}

