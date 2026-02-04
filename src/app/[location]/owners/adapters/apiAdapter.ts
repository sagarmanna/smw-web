import { UserDetailsApiAdapter } from '@/components/user-details/types/adapters';
import { OwnerBasicDetails, OwnerEmail, OwnerPhone, OwnerAddress } from '../types';
import * as ownerApi from '../[id]/owners-details.api';

/**
 * Creates the owner API adapter with optional Redux state access.
 * This allows fetchEmails/fetchPhones/fetchAddresses to use Redux state
 * instead of making additional GET requests after the initial load.
 */
export function createOwnerApiAdapter(
  getStateFn?: () => { ownerInfo: { email?: OwnerEmail[]; phone?: OwnerPhone[]; addresses?: OwnerAddress[] } | null }
): UserDetailsApiAdapter<OwnerBasicDetails, OwnerEmail, OwnerPhone, OwnerAddress> {
  return {
  fetchDetails: async (location, id) => {
    const response = await ownerApi.getOwnerDetails(location, id);
    if (!response?.success || !response.data?.body?.profile) {
      throw new Error(response?.message || 'Failed to fetch owner details');
    }
    const profile = response.data.body.profile;
    const [firstName, ...lastNameParts] = profile.name.split(' ');
    return {
      firstName,
      lastName: lastNameParts.join(' ') || '',
      role: profile.role,
      picture: undefined, // OwnerProfileResponse doesn't include picture field
    };
  },

  updateDetails: async (location, id, details) => {
    const response = await ownerApi.updateOwnerProfile(location, id, {
      firstname: details.firstName,
      lastname: details.lastName,
    });
    return response?.success ?? false;
  },

  fetchEmails: async (location, id) => {
    // Prefer Redux state if available to avoid extra GET calls
    if (getStateFn) {
      const state = getStateFn();
      if (state?.ownerInfo?.email) {
        return state.ownerInfo.email;
      }
    }
    const response = await ownerApi.getOwnerDetails(location, id);
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

  createEmail: async (location, id, email) => {
    const response = await ownerApi.addOwnerEmail(location, id, {
      email: email.email,
      label: email.label,
      note: email.note,
      isPrimary: email.isPrimary ?? false,
    });
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to create email');
    }
    // API may return data as object (single email) or array
    let created: { id: number; email: string; label: string; note?: string; isPrimary?: boolean };
    if (Array.isArray(response.data)) {
      if (response.data.length === 0) {
        throw new Error(response?.message || 'Failed to create email');
      }
      created = response.data[response.data.length - 1];
    } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
      created = response.data as typeof created;
    } else {
      throw new Error(response?.message || 'Failed to create email');
    }
    return {
      id: created.id.toString(),
      label: created.label,
      email: created.email,
      note: created.note,
      isPrimary: created.isPrimary,
    };
  },

  updateEmail: async (location, id, emailId, email) => {
    const response = await ownerApi.updateOwnerEmail(location, id, parseInt(emailId), {
      email: email.email ?? '',
      label: email.label ?? '',
      note: email.note,
      isPrimary: email.isPrimary ?? false,
    });
    return response?.success ?? false;
  },

  deleteEmail: async (location, id, emailId) => {
    const response = await ownerApi.deleteOwnerEmail(location, id, emailId);
    return response?.success ?? false;
  },

  fetchPhones: async (location, id) => {
    if (getStateFn) {
      const state = getStateFn();
      if (state?.ownerInfo?.phone) {
        return state.ownerInfo.phone;
      }
    }
    const response = await ownerApi.getOwnerDetails(location, id);
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

  createPhone: async (location, id, phone) => {
    const response = await ownerApi.addOwnerPhone(location, id, {
      number: phone.number,
      extension: phone.extension,
      label: phone.label,
      note: phone.note,
      isPrimary: false,
    });
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to create phone');
    }
    let created: { id: number; number: string; label: string; extension?: string; note?: string };
    if (Array.isArray(response.data)) {
      if (response.data.length === 0) {
        throw new Error(response?.message || 'Failed to create phone');
      }
      created = response.data[response.data.length - 1];
    } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
      created = response.data as typeof created;
    } else {
      throw new Error(response?.message || 'Failed to create phone');
    }
    return {
      id: created.id.toString(),
      label: created.label,
      number: created.number,
      extension: created.extension,
      note: created.note,
    };
  },

  updatePhone: async (location, id, phoneId, phone) => {
    const response = await ownerApi.updateOwnerPhone(location, id, parseInt(phoneId), {
      number: phone.number ?? '',
      extension: phone.extension,
      label: phone.label ?? '',
      note: phone.note,
      isPrimary: false,
    });
    return response?.success ?? false;
  },

  deletePhone: async (location, id, phoneId) => {
    const response = await ownerApi.deleteOwnerPhone(location, id, phoneId);
    return response?.success ?? false;
  },

  fetchAddresses: async (location, id) => {
    if (getStateFn) {
      const state = getStateFn();
      if (state?.ownerInfo?.addresses) {
        return state.ownerInfo.addresses;
      }
    }
    const response = await ownerApi.getOwnerDetails(location, id);
    if (!response?.success || !response.data?.body?.addresses) {
      return [];
    }
    return response.data.body.addresses.map((a) => ({
      id: a.id.toString(),
      label: a.label,
      address: a.address,
      city: a.city,
      cityId: 0, // Will be set from actual data if available
      provinceId: 0,
      countryId: 0,
      postalCode: a.postalCode,
      province: a.province,
      country: a.country,
      isPrimary: a.isPrimary,
    }));
  },

  createAddress: async (location, id, address) => {
    const response = await ownerApi.addOwnerAddress(location, id, {
      address: address.address,
      city: address.city,
      cityId: address.cityId,
      provinceId: address.provinceId,
      countryId: address.countryId,
      postalCode: address.postalCode,
      label: address.label,
      isPrimary: address.isPrimary ?? false,
    });
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to create address');
    }
    type CreatedAddress = { id: number; address: string; city: string; postalCode: string; label: string; province?: string; country?: string; isPrimary?: boolean };
    let created: CreatedAddress;
    if (Array.isArray(response.data)) {
      if (response.data.length === 0) {
        throw new Error(response?.message || 'Failed to create address');
      }
      created = response.data[response.data.length - 1];
    } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
      created = response.data as CreatedAddress;
    } else {
      throw new Error(response?.message || 'Failed to create address');
    }
    return {
      id: created.id.toString(),
      label: created.label,
      address: created.address,
      city: created.city,
      cityId: 0,
      provinceId: 0,
      countryId: 0,
      postalCode: created.postalCode,
      province: created.province,
      country: created.country,
      isPrimary: created.isPrimary,
    };
  },

  updateAddress: async (location, id, addressId, address) => {
    const response = await ownerApi.updateOwnerAddress(location, id, parseInt(addressId), {
      address: address.address ?? '',
      city: address.city ?? '',
      cityId: address.cityId ?? 0,
      provinceId: address.provinceId ?? 0,
      countryId: address.countryId ?? 0,
      postalCode: address.postalCode ?? '',
      label: address.label ?? '',
      isPrimary: address.isPrimary ?? false,
    });
    return response?.success ?? false;
  },

  deleteAddress: async (location, id, addressId) => {
    const response = await ownerApi.deleteOwnerAddress(location, id, addressId);
    return response?.success ?? false;
  },
};
}

// Default adapter without Redux state (for backwards compatibility)
export const ownerApiAdapter = createOwnerApiAdapter();

