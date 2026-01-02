import { ownerApiAdapter } from '../../adapters/apiAdapter';
import { ownerDataAdapter } from '../../adapters/dataAdapter';
import { OwnerBasicDetails, OwnerEmail, OwnerPhone, OwnerAddress } from '../../types';
import { deleteOwner, validateOwnerEmail, setOwnerPassword } from '../owners-details.api';

export const ownerDetailPageConfig = {
  moduleName: 'Owners',
  roleLabel: 'Role',
  defaultRole: 'Owner',
  breadcrumbLabel: 'Owners',
  apiAdapter: ownerApiAdapter,
  dataAdapter: ownerDataAdapter,
  deleteEndpoint: async (location: string, id: number) => {
    return await deleteOwner(location, id);
  },
  validateEmail: async (location: string, email: string) => {
    return await validateOwnerEmail(location, email);
  },
  updatePassword: async (location: string, id: number, password: string, confirmPassword: string) => {
    const response = await setOwnerPassword(location, id, { password, confirmPassword });
    return response?.success ?? false;
  },
} as const;

// Type exports for convenience
export type OwnerDetailsConfig = typeof ownerDetailPageConfig;
export type OwnerDetails = OwnerBasicDetails;
export type OwnerEmailType = OwnerEmail;
export type OwnerPhoneType = OwnerPhone;
export type OwnerAddressType = OwnerAddress;

