import { createOwnerApiAdapter } from '../../adapters/apiAdapter';
import { ownerDataAdapter } from '../../adapters/dataAdapter';
import { OwnerBasicDetails, OwnerEmail, OwnerPhone, OwnerAddress } from '../../types';
import { deleteOwner, validateOwnerEmail, setOwnerPassword } from '../owners-details.api';
import type { RootState } from '@/redux/store';

/**
 * Creates the owner detail page config with Redux-aware adapter.
 * This ensures fetchEmails/fetchPhones/fetchAddresses use Redux state
 * instead of making additional GET requests after the initial load.
 */
export function createOwnerDetailPageConfig(getState?: () => RootState) {
  return {
    moduleName: 'Owners',
    roleLabel: 'Role',
    defaultRole: 'Owner',
    breadcrumbLabel: 'Owners',
    apiAdapter: createOwnerApiAdapter(
      getState
        ? () => {
            const state = getState();
            return {
              ownerInfo: state.ownerDetails.ownerInfo,
            };
          }
        : undefined
    ),
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
}

// Default export for backwards compatibility (without Redux access)
export const ownerDetailPageConfig = createOwnerDetailPageConfig();

// Type exports for convenience
export type OwnerDetailsConfig = typeof ownerDetailPageConfig;
export type OwnerDetails = OwnerBasicDetails;
export type OwnerEmailType = OwnerEmail;
export type OwnerPhoneType = OwnerPhone;
export type OwnerAddressType = OwnerAddress;

