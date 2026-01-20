/**
 * Types for the reusable EmailModal component
 */

export interface EmailFormData {
  recipients: string[];
  subject: string;
  content: string;
}

export interface PrivateLessonDueData {
  lessonDate: string;
  student?: string;
  studentName?: string;
  program?: string;
  programName?: string;
  teacher?: string;
  teacherName?: string;
  amount: number | string;
}

export interface GroupLessonDueData {
  lessonDate: string;
  studentName: string;
  programName: string;
  teacherName: string;
  amount: number | string;
}

export interface InvoiceData {
  id: string;
  date: string;
  status: string;
  total: number;
  balance: number;
}

export interface CreditData {
  id: number;
  type: string;
  reference: string;
  amount: number;
}

export interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (emailData: EmailFormData) => void;
  onDelete?: () => void;
  /**
   * Default recipient email addresses
   */
  recipientEmails?: string[];
  /**
   * Location name for email signature
   */
  locationName?: string;
  /**
   * HST number for email footer
   */
  hstNumber?: string;
  /**
   * Initial subject line
   */
  initialSubject?: string;
  /**
   * Initial email content (HTML)
   */
  initialContent?: string;
  /**
   * Private lesson due data for generating tables
   */
  privateLessonDueData?: PrivateLessonDueData[];
  /**
   * Group lesson due data for generating tables
   */
  groupLessonDueData?: GroupLessonDueData[];
  /**
   * Invoice data for generating tables
   */
  invoiceData?: InvoiceData[];
  /**
   * Credit data for generating tables
   */
  creditData?: CreditData[];
  /**
   * Total balance to display
   */
  totalBalance?: string;
  /**
   * Show delete button in modal
   */
  showDeleteButton?: boolean;
  /**
   * Custom localStorage key for draft saving
   */
  localStorageKey?: string;
}
