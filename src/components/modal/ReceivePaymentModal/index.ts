// index.ts
/**
 * Central export file for the Receive Payment module
 * Follows the barrel pattern for clean imports
 */

// Main component
export { ReceivePaymentModal } from './ReceivePaymentModal';

// Types
export type {
  LessonItem,
  InvoiceItem,
  CreditItem,
  GroupLessonItem,
  ReceivePaymentData,
  ReceivePaymentModalProps,
  PaymentCalculations,
} from './types';

// Constants (if needed externally)
export {
  PAYMENT_METHODS,
  CUSTOMERS,
  DEFAULT_PAYMENT_METHOD,
  DEFAULT_CUSTOMER,
  DEFAULT_AMOUNT_NEEDED,
} from './constants';

// Utility classes (if needed externally)
export { PaymentCalculator, DateUtils, DataMapper, ValidationUtils } from './utils';
