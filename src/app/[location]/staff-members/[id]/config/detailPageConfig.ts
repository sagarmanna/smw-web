import { staffMemberApiAdapter } from '../../adapters/apiAdapter';
import { staffMemberDataAdapter } from '../../adapters/dataAdapter';
import { StaffMemberBasicDetails, StaffMemberEmail, StaffMemberPhone, StaffMemberAddress } from '../../types';
import { deleteUserByRole } from '@/lib/api/user.api';
import { validateStaffMemberEmail } from '../staff-members-details.api';

export const staffMemberDetailPageConfig = {
  moduleName: 'Staff Members',
  roleLabel: 'Role',
  defaultRole: 'Staff Member',
  breadcrumbLabel: 'Staff Members',
  apiAdapter: staffMemberApiAdapter,
  dataAdapter: staffMemberDataAdapter,
  deleteEndpoint: async (location: string, id: number) => {
    return await deleteUserByRole(location, id, 'staffmember');
  },
  validateEmail: async (location: string, email: string) => {
    return await validateStaffMemberEmail(location, email);
  },
} as const;

// Type exports for convenience
export type StaffMemberDetailsConfig = typeof staffMemberDetailPageConfig;
export type StaffMemberDetails = StaffMemberBasicDetails;
export type StaffMemberEmailType = StaffMemberEmail;
export type StaffMemberPhoneType = StaffMemberPhone;
export type StaffMemberAddressType = StaffMemberAddress;

