// constants.ts

// No default payment methods - all loaded dynamically from API
export const PAYMENT_METHODS = [] as const;

// No default customers - all loaded dynamically from API
export const CUSTOMERS = [] as const;

// No default student filter options - all loaded dynamically from data
export const STUDENT_FILTER_OPTIONS = [] as const;

// No default values - all dynamic
export const DEFAULT_PAYMENT_METHOD = '';
export const DEFAULT_CUSTOMER = '';
export const DEFAULT_AMOUNT_NEEDED = 0;
export const DEFAULT_AMOUNT_RECEIVED = '0.00';

export const CALENDAR_CONFIG = {
  fromYear: 2005,
  toYear: 2125,
  captionLayout: 'dropdown' as const,
} as const;

export const MESSAGES = {
  SAVE_SUCCESS: 'Payment saved successfully!',
  NO_LESSONS: 'No Lessons Available!',
  NO_GROUP_LESSONS: 'No Group Lessons Available!',
  NO_INVOICES: 'No Invoices Available!',
  NO_CREDITS: 'No Credits Available!',
  LOADING: 'Loading payment data...',
  ERROR_LOADING: 'Error Loading Data',
} as const;

export const TABLE_CONFIG = {
  enableSearch: false,
  enableExport: false,
  enableFilter: false,
  enablePrint: false,
  size: 'compact' as const,
  variant: 'striped' as const,
} as const;