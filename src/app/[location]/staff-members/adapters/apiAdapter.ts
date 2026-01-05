import { UserDetailsApiAdapter } from '@/components/user-details/types/adapters';
import { StaffMemberBasicDetails, StaffMemberEmail, StaffMemberPhone, StaffMemberAddress } from '../types';
import * as staffMemberApi from '../[id]/staff-members-details.api';

export const staffMemberApiAdapter: UserDetailsApiAdapter<
  StaffMemberBasicDetails,
  StaffMemberEmail,
  StaffMemberPhone,
  StaffMemberAddress
> = {
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
      picture: undefined, // StaffMemberProfileResponse doesn't include picture field
    };
  },

  updateDetails: async (location, id, details) => {
    const response = await staffMemberApi.updateStaffMemberProfile(location, id, {
      firstname: details.firstName,
      lastname: details.lastName,
    });
    return response?.success ?? false;
  },

  fetchEmails: async (location, id) => {
    const response = await staffMemberApi.getStaffMemberDetails(location, id);
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
    const response = await staffMemberApi.addStaffMemberEmail(location, id, {
      email: email.email,
      label: email.label,
      note: email.note,
      isPrimary: email.isPrimary ?? false,
    });
    if (!response?.success || !response.data || response.data.length === 0) {
      throw new Error(response?.message || 'Failed to create email');
    }
    const created = response.data[response.data.length - 1];
    return {
      id: created.id.toString(),
      label: created.label,
      email: created.email,
      note: created.note,
      isPrimary: created.isPrimary,
    };
  },

  updateEmail: async (location, id, emailId, email) => {
    const response = await staffMemberApi.updateStaffMemberEmail(location, id, parseInt(emailId), {
      email: email.email ?? '',
      label: email.label ?? '',
      note: email.note,
      isPrimary: email.isPrimary ?? false,
    });
    return response?.success ?? false;
  },

  deleteEmail: async (location, id, emailId) => {
    const response = await staffMemberApi.deleteStaffMemberEmail(location, id, emailId);
    return response?.success ?? false;
  },

  fetchPhones: async (location, id) => {
    const response = await staffMemberApi.getStaffMemberDetails(location, id);
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
    const response = await staffMemberApi.addStaffMemberPhone(location, id, {
      number: phone.number,
      extension: phone.extension,
      label: phone.label,
      note: phone.note,
      isPrimary: false,
    });
    if (!response?.success || !response.data || response.data.length === 0) {
      throw new Error(response?.message || 'Failed to create phone');
    }
    const created = response.data[response.data.length - 1];
    return {
      id: created.id.toString(),
      label: created.label,
      number: created.number,
      extension: created.extension,
      note: created.note,
    };
  },

  updatePhone: async (location, id, phoneId, phone) => {
    const response = await staffMemberApi.updateStaffMemberPhone(location, id, parseInt(phoneId), {
      number: phone.number ?? '',
      extension: phone.extension,
      label: phone.label ?? '',
      note: phone.note,
      isPrimary: false,
    });
    return response?.success ?? false;
  },

  deletePhone: async (location, id, phoneId) => {
    const response = await staffMemberApi.deleteStaffMemberPhone(location, id, phoneId);
    return response?.success ?? false;
  },

  fetchAddresses: async (location, id) => {
    const response = await staffMemberApi.getStaffMemberDetails(location, id);
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
    const response = await staffMemberApi.addStaffMemberAddress(location, id, {
      address: address.address,
      city: address.city,
      cityId: address.cityId,
      provinceId: address.provinceId,
      countryId: address.countryId,
      postalCode: address.postalCode,
      label: address.label,
      isPrimary: address.isPrimary ?? false,
    });
    if (!response?.success || !response.data || response.data.length === 0) {
      throw new Error(response?.message || 'Failed to create address');
    }
    const created = response.data[response.data.length - 1];
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
    const response = await staffMemberApi.updateStaffMemberAddress(location, id, parseInt(addressId), {
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
    const response = await staffMemberApi.deleteStaffMemberAddress(location, id, addressId);
    return response?.success ?? false;
  },
};

