import { DataAdapter } from '@/components/user-details/types/adapters';
import { OwnerBasicDetails, OwnerEmail, OwnerPhone, OwnerAddress } from '../types';

export const ownerDataAdapter: DataAdapter<
  OwnerBasicDetails,
  OwnerEmail,
  OwnerPhone,
  OwnerAddress
> = {
  toGenericDetails: (data) => ({
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role || 'Owner',
    picture: data.picture,
  }),

  toGenericEmail: (data) => ({
    id: data.id,
    label: data.label,
    email: data.email,
    note: data.note,
    isPrimary: data.isPrimary,
  }),

  toGenericPhone: (data) => ({
    id: data.id,
    label: data.label,
    number: data.number,
    extension: data.extension,
    note: data.note,
  }),

  toGenericAddress: (data) => ({
    id: data.id,
    label: data.label,
    address: data.address,
    city: data.city,
    cityId: data.cityId,
    provinceId: data.provinceId,
    countryId: data.countryId,
    postalCode: data.postalCode,
    province: data.province,
    country: data.country,
    isPrimary: data.isPrimary,
  }),

  fromGenericDetails: (data) => ({
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role || 'Owner',
    picture: data.picture,
  }),

  fromGenericEmail: (data) => ({
    id: data.id,
    label: data.label,
    email: data.email,
    note: data.note,
    isPrimary: data.isPrimary,
  }),

  fromGenericPhone: (data) => ({
    id: data.id,
    label: data.label,
    number: data.number,
    extension: data.extension,
    note: data.note,
  }),

  fromGenericAddress: (data) => ({
    id: data.id,
    label: data.label,
    address: data.address,
    city: data.city,
    cityId: data.cityId,
    provinceId: data.provinceId,
    countryId: data.countryId,
    postalCode: data.postalCode,
    province: data.province,
    country: data.country,
    isPrimary: data.isPrimary,
  }),
};

