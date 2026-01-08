import { createAdministratorApiAdapter } from '../../adapters/apiAdapter';
import { administratorDataAdapter } from '../../adapters/dataAdapter';
import { AdministratorBasicDetails, AdministratorEmail, AdministratorPhone, AdministratorAddress } from '../../types';
import { deleteUserByRole } from '@/lib/api/user.api';
import type { RootState } from '@/redux/store';

/**
 * Creates the administrator detail page config with Redux-aware adapter
 * This ensures fetchEmails/fetchPhones/fetchAddresses use Redux state instead of making GET requests
 */
export function createAdministratorDetailPageConfig(getState?: () => RootState) {
  return {
    moduleName: 'Administrators',
    roleLabel: 'Role',
    defaultRole: 'Administrator',
    breadcrumbLabel: 'Administrators',
    apiAdapter: createAdministratorApiAdapter(
      getState
        ? () => {
            const state = getState();
            return {
              administratorInfo: state.administrator.administratorInfo,
            };
          }
        : undefined
    ),
    dataAdapter: administratorDataAdapter,
    deleteEndpoint: async (location: string, id: number) => {
      return await deleteUserByRole(location, id, 'administrator');
    },
    validateEmail: async () => {
      // Email validation API not ready
      return { success: false, data: { exists: false }, message: 'Email validation API not ready' };
    },
  } as const;
}

// Default export for backwards compatibility (without Redux access)
export const administratorDetailPageConfig = createAdministratorDetailPageConfig();

// Type exports for convenience
export type AdministratorDetailsConfig = typeof administratorDetailPageConfig;
export type AdministratorDetails = AdministratorBasicDetails;
export type AdministratorEmailType = AdministratorEmail;
export type AdministratorPhoneType = AdministratorPhone;
export type AdministratorAddressType = AdministratorAddress;

