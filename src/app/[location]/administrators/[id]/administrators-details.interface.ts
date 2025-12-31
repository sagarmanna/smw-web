import {
  AdministratorBasicDetails,
  AdministratorEmail,
  AdministratorPhone,
  AdministratorAddress,
} from '../types';

export interface AdministratorProfile {
  name: string;
  role: string;
  birthDate?: string;
  picture?: string;
}

export interface AdministratorInfo {
  profile: AdministratorProfile;
  email: AdministratorEmail[];
  phone: AdministratorPhone[];
  addresses: AdministratorAddress[];
}

