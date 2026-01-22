import { UserDetailsApiAdapter } from '@/components/user-details/types/adapters';
import { AdministratorBasicDetails, AdministratorEmail, AdministratorPhone, AdministratorAddress } from '../types';
import * as administratorApi from '../[id]/administrators-details.api';

/**
 * Creates the administrator API adapter with Redux state access
 * This allows fetchEmails/fetchPhones/fetchAddresses to use Redux state instead of making GET requests
 */
export function createAdministratorApiAdapter(
  getStateFn?: () => { administratorInfo: { email?: AdministratorEmail[]; phone?: AdministratorPhone[]; addresses?: AdministratorAddress[] } | null }
): UserDetailsApiAdapter<AdministratorBasicDetails, AdministratorEmail, AdministratorPhone, AdministratorAddress> {
  return {
    fetchDetails: async (location, id) => {
      const response = await administratorApi.getAdministratorDetails(location, id);
      if (!response?.success || !response.data?.body?.profile) {
        throw new Error(response?.message || 'Failed to fetch administrator details');
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
        if (state?.administratorInfo?.email) {
          return state.administratorInfo.email;
        }
      }
      // Fallback: Only make GET request if Redux state is not available (should not happen in normal flow)
      const response = await administratorApi.getAdministratorDetails(location, id);
      if (!response?.success || !response.data?.body?.email) {
        return [];
      }
      return response.data.body.email.map((e) => ({
        id: e.id.toString(),
        label: e.label,
        email: e.email,
        note: e.note,
        isPrimary: e.isPrimary,
      }));
    },

    createEmail: async (location, id, emailData) => {
      const response = await administratorApi.addAdministratorEmail(location, Number(id), {
        email: emailData.email,
        label: emailData.label,
        note: emailData.note,
        isPrimary: emailData.isPrimary || false,
      });
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to create email');
      }
      // API may return data as object (POST) or array (PUT/DELETE)
      // Handle both cases
      let createdEmail;
      if (Array.isArray(response.data)) {
        // If data is an array, find the newly created email
        createdEmail = response.data.find(e => e.email === emailData.email);
        if (!createdEmail) {
          throw new Error(response?.message || 'Created email not found in response');
        }
      } else {
        // If data is an object (single email), use it directly
        createdEmail = response.data;
      }
      const result = {
        id: createdEmail.id.toString(),
        label: createdEmail.label,
        email: createdEmail.email,
        note: createdEmail.note,
        isPrimary: createdEmail.isPrimary,
      };
      // Attach API message as a property (modal can check for it)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)._apiMessage = response.message;
      return result;
    },

    updateEmail: async (location, id, emailId, emailData) => {
      const response = await administratorApi.updateAdministratorEmail(
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
      const response = await administratorApi.deleteAdministratorEmail(
        location,
        Number(id),
        emailId
      );
      if (!response?.success) {
        return false;
      }
      return true;
    },

    fetchPhones: async (location, id) => {
      // Use Redux state if available (avoids GET request)
      if (getStateFn) {
        const state = getStateFn();
        if (state?.administratorInfo?.phone) {
          return state.administratorInfo.phone;
        }
      }
      // Fallback: Only make GET request if Redux state is not available (should not happen in normal flow)
      const response = await administratorApi.getAdministratorDetails(location, id);
      if (!response?.success || !response.data?.body?.phone) {
        return [];
      }
      return response.data.body.phone.map((p) => ({
        id: p.id.toString(),
        label: p.label,
        number: p.number,
        extension: p.extension,
        note: p.note,
      }));
    },

    createPhone: async (location, id, phoneData) => {
      const response = await administratorApi.addAdministratorPhone(location, Number(id), {
        number: phoneData.number,
        label: phoneData.label,
        extension: phoneData.extension,
        note: phoneData.note,
      });
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to create phone');
      }
      // API may return data as object (POST) or array (PUT/DELETE)
      // Handle both cases
      let createdPhone;
      if (Array.isArray(response.data)) {
        // If data is an array, find the newly created phone
        createdPhone = response.data.find(p => p.number === phoneData.number);
        if (!createdPhone) {
          throw new Error(response?.message || 'Created phone not found in response');
        }
      } else {
        // If data is an object (single phone), use it directly
        createdPhone = response.data;
      }
      const result = {
        id: createdPhone.id.toString(),
        label: createdPhone.label,
        number: createdPhone.number,
        extension: createdPhone.extension,
        note: createdPhone.note,
      };
      // Attach API message as a property (modal can check for it)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)._apiMessage = response.message;
      return result;
    },

    updatePhone: async (location, id, phoneId, phoneData) => {
      const response = await administratorApi.updateAdministratorPhone(
        location,
        Number(id),
        Number(phoneId),
        {
          number: phoneData.number || '',
          label: phoneData.label || '',
          extension: phoneData.extension || '',
          note: phoneData.note || '',
        }
      );
      if (!response?.success) {
        return false;
      }
      return true;
    },

    deletePhone: async (location, id, phoneId) => {
      const response = await administratorApi.deleteAdministratorPhone(
        location,
        Number(id),
        phoneId
      );
      if (!response?.success) {
        return false;
      }
      return true;
    },

    fetchAddresses: async (location, id) => {
      // Use Redux state if available (avoids GET request)
      if (getStateFn) {
        const state = getStateFn();
        if (state?.administratorInfo?.addresses) {
          return state.administratorInfo.addresses;
        }
      }
      // Fallback: Only make GET request if Redux state is not available (should not happen in normal flow)
      const response = await administratorApi.getAdministratorDetails(location, id);
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
        province: a.province,
        country: a.country,
        isPrimary: a.isPrimary,
      }));
    },

    createAddress: async (location, id, addressData) => {
      const response = await administratorApi.addAdministratorAddress(location, Number(id), {
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
      // POST API returns full address object in data
      let createdAddress;
      if (Array.isArray(response.data)) {
        // If data is an array, find the newly created address
        createdAddress = response.data.find(a => a.address === addressData.address && a.postalCode === addressData.postalCode);
        if (!createdAddress) {
          throw new Error(response?.message || 'Created address not found in response');
        }
      } else {
        // POST returns full address object
        createdAddress = response.data;
      }
      
      // Return address using full response data
      // Note: API response may include cityId, provinceId, countryId even though type doesn't specify them
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
      
      // Attach API message as a property (modal can check for it)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)._apiMessage = response.message;
      
      return result;
    },

    updateAddress: async (location, id, addressId, addressData) => {
      const response = await administratorApi.updateAdministratorAddress(
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
        return false;
      }
      return true;
    },

    deleteAddress: async (location, id, addressId) => {
      const response = await administratorApi.deleteAdministratorAddress(
        location,
        Number(id),
        addressId
      );
      if (!response?.success) {
        return false;
      }
      return true;
    },
  };
}

// Export default adapter (without Redux access - for backwards compatibility)
// This will fallback to GET requests if used directly
export const administratorApiAdapter = createAdministratorApiAdapter();
