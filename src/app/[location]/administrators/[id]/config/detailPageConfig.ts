import { administratorApiAdapter } from '../../adapters/apiAdapter';
import { administratorDataAdapter } from '../../adapters/dataAdapter';
import { AdministratorBasicDetails, AdministratorEmail, AdministratorPhone, AdministratorAddress } from '../../types';
import { deleteUserByRole } from '@/lib/api/user.api';
import { validateAdministratorEmail } from '../administrators-details.api';

export const administratorDetailPageConfig = {
  moduleName: 'Administrators',
  roleLabel: 'Role',
  defaultRole: 'Administrator',
  breadcrumbLabel: 'Administrators',
  apiAdapter: administratorApiAdapter,
  dataAdapter: administratorDataAdapter,
  deleteEndpoint: async (location: string, id: number) => {
    return await deleteUserByRole(location, id, 'administrator');
  },
  validateEmail: async (location: string, email: string) => {
    return await validateAdministratorEmail(location, email);
  },
} as const;

// Type exports for convenience
export type AdministratorDetailsConfig = typeof administratorDetailPageConfig;
export type AdministratorDetails = AdministratorBasicDetails;
export type AdministratorEmailType = AdministratorEmail;
export type AdministratorPhoneType = AdministratorPhone;
export type AdministratorAddressType = AdministratorAddress;

