import { DataAdapter } from '@/components/user-details/types/adapters';
import { AdministratorBasicDetails, AdministratorEmail, AdministratorPhone, AdministratorAddress } from '../types';

export const administratorDataAdapter: DataAdapter<
  AdministratorBasicDetails,
  AdministratorEmail,
  AdministratorPhone,
  AdministratorAddress
> = {
  toGenericDetails: (data) => ({
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role || 'Administrator',
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
    role: data.role || 'Administrator',
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

