import {
  StaffMemberBasicDetails,
  StaffMemberEmail,
  StaffMemberPhone,
  StaffMemberAddress,
} from '../types';

export interface StaffMemberProfile {
  name: string;
  role: string;
  birthDate?: string;
  picture?: string;
}

export interface StaffMemberInfo {
  profile: StaffMemberProfile;
  email: StaffMemberEmail[];
  phone: StaffMemberPhone[];
  addresses: StaffMemberAddress[];
}

