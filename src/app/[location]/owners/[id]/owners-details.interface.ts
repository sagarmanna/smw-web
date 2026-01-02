import {
  OwnerBasicDetails,
  OwnerEmail,
  OwnerPhone,
  OwnerAddress,
} from '../types';

export interface OwnerProfile {
  name: string;
  role: string;
  birthDate?: string;
  picture?: string;
}

export interface OwnerInfo {
  profile: OwnerProfile;
  email: OwnerEmail[];
  phone: OwnerPhone[];
  addresses: OwnerAddress[];
}

