// constants.ts
export const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Debit Card', label: 'Debit Card' },
  { value: 'Check', label: 'Check' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
] as const;

export const CUSTOMERS = [
  { value: '123 234', label: '123 234' },
  { value: '456 234', label: '456 234' },
] as const;

export const STUDENT_FILTER_OPTIONS = [
  { value: 'all', label: 'All Students' },
  { value: '456234', label: '456 234' },
] as const;

export const DEFAULT_PAYMENT_METHOD = 'Cash';
export const DEFAULT_CUSTOMER = '123 234';
export const DEFAULT_AMOUNT_NEEDED = 2718.75;
export const DEFAULT_AMOUNT_RECEIVED = '1718.75';

export const CALENDAR_CONFIG = {
  fromYear: 2005,
  toYear: 2125,
  captionLayout: 'dropdown' as const,
} as const;

export const MESSAGES = {
  SAVE_SUCCESS: 'Payment saved successfully!',
  NO_LESSONS: 'No Lessons Available!',
} as const;

export const TABLE_CONFIG = {
  enableSearch: false,
  enableExport: false,
  enableFilter: false,
  enablePrint: false,
  size: 'compact' as const,
  variant: 'striped' as const,
} as const;