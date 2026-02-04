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
  /** Stored separately to preserve user's first/last name split when reopening edit modal */
  firstName?: string;
  lastName?: string;
}

export interface StaffMemberInfo {
  profile: StaffMemberProfile;
  email: StaffMemberEmail[];
  phone: StaffMemberPhone[];
  addresses: StaffMemberAddress[];
}

