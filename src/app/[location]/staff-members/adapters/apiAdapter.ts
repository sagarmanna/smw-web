import { UserDetailsApiAdapter } from '@/components/user-details/types/adapters';
import { StaffMemberBasicDetails, StaffMemberEmail, StaffMemberPhone, StaffMemberAddress } from '../types';
import { getStaffMemberDetails } from '../[id]/staff-members-details.api';

/**
 * Creates the staff member API adapter with Redux state access
 * This allows fetchEmails/fetchPhones/fetchAddresses to use Redux state instead of making GET requests
 */
export function createStaffMemberApiAdapter(
  getStateFn?: () => { staffMemberInfo: { email?: StaffMemberEmail[]; phone?: StaffMemberPhone[]; addresses?: StaffMemberAddress[] } | null }
): UserDetailsApiAdapter<StaffMemberBasicDetails, StaffMemberEmail, StaffMemberPhone, StaffMemberAddress> {
  return {
    fetchDetails: async (location, id) => {
      const response = await getStaffMemberDetails(location, id);
      if (!response?.success || !response.data?.body?.profile) {
        throw new Error(response?.message || 'Failed to fetch staff member details');
      }
      const profile = response.data.body.profile;
      const [firstName, ...lastNameParts] = profile.name.split(' ');
      return {
        firstName,
        lastName: lastNameParts.join(' ') || '',
        role: profile.role,
        picture: undefined,
      };
    },

    updateDetails: async () => {
      // API not ready - return false
      return false;
    },

    fetchEmails: async (location, id) => {
      // Use Redux state if available (avoids GET request)
      if (getStateFn) {
        const state = getStateFn();
        if (state?.staffMemberInfo?.email) {
          return state.staffMemberInfo.email;
        }
      }
      // Fallback: Only make GET request if Redux state is not available (should not happen in normal flow)
      const response = await getStaffMemberDetails(location, id);
      if (!response?.success || !response.data?.body?.email) {
        return [];
      }
      return response.data.body.email.map((e) => ({
        id: e.id.toString(),
        label: e.label,
        email: e.email,
        note: e.note?.trim() || undefined,
        isPrimary: e.isPrimary,
      }));
    },

    createEmail: async () => {
      // API not ready - throw error
      throw new Error('Create email API not ready');
    },

    updateEmail: async () => {
      // API not ready - return false
      return false;
    },

    deleteEmail: async () => {
      // API not ready - return false
      return false;
    },

    fetchPhones: async (location, id) => {
      // Use Redux state if available (avoids GET request)
      if (getStateFn) {
        const state = getStateFn();
        if (state?.staffMemberInfo?.phone) {
          return state.staffMemberInfo.phone;
        }
      }
      // Fallback: Only make GET request if Redux state is not available (should not happen in normal flow)
      const response = await getStaffMemberDetails(location, id);
      if (!response?.success || !response.data?.body?.phone) {
        return [];
      }
      return response.data.body.phone.map((p) => ({
        id: p.id.toString(),
        label: p.label,
        number: p.number,
        extension: p.extension?.trim() || undefined,
        note: p.note?.trim() || undefined,
      }));
    },

    createPhone: async () => {
      // API not ready - throw error
      throw new Error('Create phone API not ready');
    },

    updatePhone: async () => {
      // API not ready - return false
      return false;
    },

    deletePhone: async () => {
      // API not ready - return false
      return false;
    },

    fetchAddresses: async (location, id) => {
      // Use Redux state if available (avoids GET request)
      if (getStateFn) {
        const state = getStateFn();
        if (state?.staffMemberInfo?.addresses) {
          return state.staffMemberInfo.addresses;
        }
      }
      // Fallback: Only make GET request if Redux state is not available (should not happen in normal flow)
      const response = await getStaffMemberDetails(location, id);
      if (!response?.success || !response.data?.body?.addresses) {
        return [];
      }
      return response.data.body.addresses.map((a) => ({
        id: a.id.toString(),
        label: a.label,
        address: a.address,
        city: a.city,
        cityId: 0,
        provinceId: 0,
        countryId: 0,
        postalCode: a.postalCode,
        province: a.province?.trim() || undefined,
        country: a.country?.trim() || undefined,
        isPrimary: a.isPrimary,
      }));
    },

    createAddress: async () => {
      // API not ready - throw error
      throw new Error('Create address API not ready');
    },

    updateAddress: async () => {
      // API not ready - return false
      return false;
    },

    deleteAddress: async () => {
      // API not ready - return false
      return false;
    },
  };
}

// Export default adapter (without Redux access - for backwards compatibility)
// This will fallback to GET requests if used directly
export const staffMemberApiAdapter = createStaffMemberApiAdapter();

