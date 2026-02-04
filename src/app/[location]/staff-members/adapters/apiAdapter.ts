import { UserDetailsApiAdapter } from '@/components/user-details/types/adapters';
import { StaffMemberBasicDetails, StaffMemberEmail, StaffMemberPhone, StaffMemberAddress } from '../types';
import * as staffMemberApi from '../[id]/staff-members-details.api';

/**
 * Creates the staff member API adapter with Redux state access
 * This allows fetchEmails/fetchPhones/fetchAddresses to use Redux state instead of making GET requests
 */
export function createStaffMemberApiAdapter(
  getStateFn?: () => { staffMemberInfo: { email?: StaffMemberEmail[]; phone?: StaffMemberPhone[]; addresses?: StaffMemberAddress[] } | null }
): UserDetailsApiAdapter<StaffMemberBasicDetails, StaffMemberEmail, StaffMemberPhone, StaffMemberAddress> {
  return {
    fetchDetails: async (location, id) => {
      const response = await staffMemberApi.getStaffMemberDetails(location, id);
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
      return false;
    },

    fetchEmails: async (location, id) => {
      if (getStateFn) {
        const state = getStateFn();
        if (state?.staffMemberInfo?.email) {
          return state.staffMemberInfo.email;
        }
      }
      const response = await staffMemberApi.getStaffMemberDetails(location, id);
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

    createEmail: async (location, id, emailData) => {
      const response = await staffMemberApi.addStaffMemberEmail(location, Number(id), {
        email: emailData.email,
        label: emailData.label,
        note: emailData.note,
        isPrimary: emailData.isPrimary || false,
      });
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to create email');
      }
      let createdEmail;
      if (Array.isArray(response.data)) {
        createdEmail = response.data.find((e) => e.email === emailData.email);
        if (!createdEmail) {
          throw new Error(response?.message || 'Created email not found in response');
        }
      } else {
        createdEmail = response.data;
      }
      const result = {
        id: createdEmail.id.toString(),
        label: createdEmail.label,
        email: createdEmail.email,
        note: createdEmail.note?.trim() || undefined,
        isPrimary: createdEmail.isPrimary,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)._apiMessage = response.message;
      return result;
    },

    updateEmail: async (location, id, emailId, emailData) => {
      const response = await staffMemberApi.updateStaffMemberEmail(
        location,
        Number(id),
        Number(emailId),
        {
          email: emailData.email || '',
          label: emailData.label || '',
          note: emailData.note || '',
          isPrimary: emailData.isPrimary || false,
        }
      );
      if (!response?.success) {
        return false;
      }
      return true;
    },

    deleteEmail: async (location, id, emailId) => {
      const response = await staffMemberApi.deleteStaffMemberEmail(location, Number(id), emailId);
      if (!response?.success) {
        return false;
      }
      return true;
    },

    fetchPhones: async (location, id) => {
      if (getStateFn) {
        const state = getStateFn();
        if (state?.staffMemberInfo?.phone) {
          return state.staffMemberInfo.phone;
        }
      }
      const response = await staffMemberApi.getStaffMemberDetails(location, id);
      if (!response?.success || !response.data?.body?.phone) {
        return [];
      }
      return response.data.body.phone.map((p) => ({
        id: p.id.toString(),
        label: p.label,
        number: p.number,
        extension: p.extension != null ? String(p.extension).trim() || undefined : undefined,
        note: p.note?.trim() || undefined,
        isPrimary: p.isPrimary,
      }));
    },

    createPhone: async (location, id, phoneData) => {
      const ext = phoneData.extension?.toString().trim();
      const extensionAsNumber = ext && /^\d+$/.test(ext) ? parseInt(ext, 10) : undefined;
      const payload: Parameters<typeof staffMemberApi.addStaffMemberPhone>[2] = {
        number: phoneData.number,
        label: phoneData.label,
        note: phoneData.note,
      };
      if (extensionAsNumber !== undefined) {
        payload.extension = extensionAsNumber;
      }
      const response = await staffMemberApi.addStaffMemberPhone(location, Number(id), payload);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to create phone');
      }
      let createdPhone;
      if (Array.isArray(response.data)) {
        createdPhone = response.data.find((p) => p.number === phoneData.number);
        if (!createdPhone) {
          throw new Error(response?.message || 'Created phone not found in response');
        }
      } else {
        createdPhone = response.data;
      }
      const result = {
        id: createdPhone.id.toString(),
        label: createdPhone.label,
        number: createdPhone.number,
        extension: createdPhone.extension != null ? String(createdPhone.extension).trim() || undefined : undefined,
        note: createdPhone.note?.trim() || undefined,
        isPrimary: createdPhone.isPrimary,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)._apiMessage = response.message;
      return result;
    },

    updatePhone: async (location, id, phoneId, phoneData) => {
      const ext = phoneData.extension?.toString().trim();
      const extensionAsNumber = ext && /^\d+$/.test(ext) ? parseInt(ext, 10) : undefined;
      const payload: Parameters<typeof staffMemberApi.updateStaffMemberPhone>[3] = {
        number: phoneData.number || '',
        label: phoneData.label || '',
        note: phoneData.note || '',
      };
      if (extensionAsNumber !== undefined) {
        payload.extension = extensionAsNumber;
      }
      const response = await staffMemberApi.updateStaffMemberPhone(
        location,
        Number(id),
        Number(phoneId),
        payload
      );
      if (!response?.success) {
        return false;
      }
      return true;
    },

    deletePhone: async (location, id, phoneId) => {
      const response = await staffMemberApi.deleteStaffMemberPhone(location, Number(id), phoneId);
      if (!response?.success) {
        return false;
      }
      return true;
    },

    fetchAddresses: async (location, id) => {
      if (getStateFn) {
        const state = getStateFn();
        if (state?.staffMemberInfo?.addresses) {
          return state.staffMemberInfo.addresses;
        }
      }
      const response = await staffMemberApi.getStaffMemberDetails(location, id);
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

    createAddress: async (location, id, addressData) => {
      const response = await staffMemberApi.addStaffMemberAddress(location, Number(id), {
        address: addressData.address,
        city: addressData.city,
        cityId: addressData.cityId,
        provinceId: addressData.provinceId,
        countryId: addressData.countryId,
        postalCode: addressData.postalCode,
        label: addressData.label,
        isPrimary: addressData.isPrimary || false,
      });
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to create address');
      }
      let createdAddress;
      if (Array.isArray(response.data)) {
        createdAddress = response.data.find(
          (a) => a.address === addressData.address && a.postalCode === addressData.postalCode
        );
        if (!createdAddress) {
          throw new Error(response?.message || 'Created address not found in response');
        }
      } else {
        createdAddress = response.data;
      }
      const responseData = createdAddress as typeof createdAddress & {
        cityId?: number;
        provinceId?: number;
        countryId?: number;
      };
      const result = {
        id: responseData.id.toString(),
        label: responseData.label,
        address: responseData.address,
        city: responseData.city,
        cityId: responseData.cityId ?? addressData.cityId ?? 0,
        provinceId: responseData.provinceId ?? addressData.provinceId ?? 0,
        countryId: responseData.countryId ?? addressData.countryId ?? 0,
        postalCode: responseData.postalCode,
        province: responseData.province || undefined,
        country: responseData.country || undefined,
        isPrimary: responseData.isPrimary || false,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)._apiMessage = response.message;
      return result;
    },

    updateAddress: async (location, id, addressId, addressData) => {
      const response = await staffMemberApi.updateStaffMemberAddress(
        location,
        Number(id),
        Number(addressId),
        {
          address: addressData.address || '',
          city: addressData.city || '',
          cityId: addressData.cityId || 0,
          provinceId: addressData.provinceId || 0,
          countryId: addressData.countryId || 0,
          postalCode: addressData.postalCode || '',
          label: addressData.label || '',
          isPrimary: addressData.isPrimary || false,
        }
      );
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to update address');
      }
      return true;
    },

    deleteAddress: async (location, id, addressId) => {
      const response = await staffMemberApi.deleteStaffMemberAddress(location, Number(id), addressId);
      if (!response?.success) {
        return false;
      }
      return true;
    },
  };
}

// Export default adapter (without Redux access - for backwards compatibility)
// This will fallback to GET requests if used directly
export const staffMemberApiAdapter = createStaffMemberApiAdapter();

