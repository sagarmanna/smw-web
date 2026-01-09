import { createStaffMemberApiAdapter } from '../../adapters/apiAdapter';
import { staffMemberDataAdapter } from '../../adapters/dataAdapter';
import { StaffMemberBasicDetails, StaffMemberEmail, StaffMemberPhone, StaffMemberAddress } from '../../types';
import { deleteUserByRole } from '@/lib/api/user.api';
import type { RootState } from '@/redux/store';

/**
 * Creates the staff member detail page config with Redux-aware adapter
 * This ensures fetchEmails/fetchPhones/fetchAddresses use Redux state instead of making GET requests
 */
export function createStaffMemberDetailPageConfig(getState?: () => RootState) {
  return {
    moduleName: 'Staff Members',
    roleLabel: 'Role',
    defaultRole: 'Staff Member',
    breadcrumbLabel: 'Staff Members',
    apiAdapter: createStaffMemberApiAdapter(
      getState
        ? () => {
            const state = getState();
            return {
              staffMemberInfo: state.staffMemberDetails.staffMemberInfo,
            };
          }
        : undefined
    ),
    dataAdapter: staffMemberDataAdapter,
    deleteEndpoint: async (location: string, id: number) => {
      return await deleteUserByRole(location, id, 'staffmember');
    },
    validateEmail: async () => {
      // Email validation API not ready
      return { success: false, data: { exists: false }, message: 'Email validation API not ready' };
    },
  } as const;
}

// Default export for backwards compatibility (without Redux access)
export const staffMemberDetailPageConfig = createStaffMemberDetailPageConfig();

// Type exports for convenience
export type StaffMemberDetailsConfig = typeof staffMemberDetailPageConfig;
export type StaffMemberDetails = StaffMemberBasicDetails;
export type StaffMemberEmailType = StaffMemberEmail;
export type StaffMemberPhoneType = StaffMemberPhone;
export type StaffMemberAddressType = StaffMemberAddress;

