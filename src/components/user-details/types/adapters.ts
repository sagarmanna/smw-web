import { GenericBasicDetails, GenericEmail, GenericPhone, GenericAddress } from './common';

// Generic API adapter interface
export interface UserDetailsApiAdapter<TDetails, TEmail, TPhone, TAddress> {
  // Details
  fetchDetails: (location: string, id: number) => Promise<TDetails>;
  updateDetails: (location: string, id: number, details: TDetails) => Promise<boolean>;
  
  // Emails
  fetchEmails: (location: string, id: number) => Promise<TEmail[]>;
  createEmail: (location: string, id: number, email: Omit<TEmail, 'id'>) => Promise<TEmail>;
  updateEmail: (location: string, id: number, emailId: string, email: Partial<TEmail>) => Promise<boolean>;
  deleteEmail: (location: string, id: number, emailId: string) => Promise<boolean>;
  
  // Phones
  fetchPhones: (location: string, id: number) => Promise<TPhone[]>;
  createPhone: (location: string, id: number, phone: Omit<TPhone, 'id'>) => Promise<TPhone>;
  updatePhone: (location: string, id: number, phoneId: string, phone: Partial<TPhone>) => Promise<boolean>;
  deletePhone: (location: string, id: number, phoneId: string) => Promise<boolean>;
  
  // Addresses
  fetchAddresses: (location: string, id: number) => Promise<TAddress[]>;
  createAddress: (location: string, id: number, address: Omit<TAddress, 'id'>) => Promise<TAddress>;
  updateAddress: (location: string, id: number, addressId: string, address: Partial<TAddress>) => Promise<boolean>;
  deleteAddress: (location: string, id: number, addressId: string) => Promise<boolean>;
}

// Data adapter interface for transforming between module-specific and generic types
export interface DataAdapter<TModuleDetails, TModuleEmail, TModulePhone, TModuleAddress> {
  toGenericDetails: (data: TModuleDetails) => GenericBasicDetails;
  toGenericEmail: (data: TModuleEmail) => GenericEmail;
  toGenericPhone: (data: TModulePhone) => GenericPhone;
  toGenericAddress: (data: TModuleAddress) => GenericAddress;
  fromGenericDetails: (data: GenericBasicDetails) => TModuleDetails;
  fromGenericEmail: (data: GenericEmail) => TModuleEmail;
  fromGenericPhone: (data: GenericPhone) => TModulePhone;
  fromGenericAddress: (data: GenericAddress) => TModuleAddress;
}

