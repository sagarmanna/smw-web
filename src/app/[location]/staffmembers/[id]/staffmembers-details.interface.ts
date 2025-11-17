export interface Email {
  id: number;
  email: string;
  note: string;
  label: string;
  isPrimary: boolean;
}

export interface Phone {
  id: number;
  number: string;
  extension: string | null;
  note: string;
  label: string;
  isPrimary: boolean;
}

export interface Address {
  id: number;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  label: string;
  isPrimary: boolean;
}

export interface StaffMemberProfile {
  name: string;
  role: string;
}

export interface StaffMemberInfo {
  profile: StaffMemberProfile;
  email: Email[];
  phone: Phone[];
  addresses: Address[];
}

export interface StaffMemberTab {
  id: number;
  name: string;
  icon: string;
  href: string;
}

export interface StaffMemberTabContent {
  id: number;
  content: string;
}

export interface StaffMemberTabsData {
  tabs: StaffMemberTab[];
  content: StaffMemberTabContent[];
}

