export interface EnrolmentBasicDetails {
  id: number;
  program: string;
  student: string;
  teacher: string;
  autoRenewal: string;
  startDate: string;
  endDate: string;
  lessonsRemaining: number;
}

export interface EnrolmentRate {
  fromDate: string;
  toDate: string;
  amount: string;
}

export interface EnrolmentDetails {
  id: number;
  program: string;
  teacher: string;
  rate: string;
  rateFromDate?: string;
  rateToDate?: string;
  rates: EnrolmentRate[];
  autoRenewal: string;
  duration: string;
  student: string;
  studentId?: number;
  customer: string;
  customerId?: number;
  online: boolean;
  type?: "private" | "group"; // Normalized type: "private" | "group"
}

// Extended for update requests
export interface UpdateEnrolmentDetails extends Partial<EnrolmentDetails> {
  rates?: EnrolmentRate[];
}

export interface EnrolmentDiscounts {
  pfDiscount?: string; // For private enrolments
  multipleEnrolDiscount?: string; // For private enrolments
  discount?: string; // For group enrolments (single discount field)
}

export interface EnrolmentPaymentFrequency {
  paymentFrequency: string;
  effectiveDate?: string; // Format: "MMM dd, yyyy" (e.g., "Mar 01, 2025")
}

export interface EnrolmentSchedule {
  day: string;
  time: string;
  startDate: string;
  endDate: string;
}

export interface EnrolmentScheduleHistory {
  id?: number;
  date: string; // Date range like "Nov 14, 2025 - Dec 31, 2025"
  day: string;
  time: string;
  duration: string;
  teacher: string;
}

export interface EnrolmentLesson {
  id?: number;
  dueDate: string;
  date: string; // Date with time like "Dec 26, 2025 @ 11:30 AM"
  duration: string;
  status: string;
  price: string;
  owing: string;
  online: boolean;
}

export interface EnrolmentHistory {
  id?: number;
  message: string;
  createdOn?: string;
}

export interface EnrolmentInfo {
  details: EnrolmentDetails;
  discounts: EnrolmentDiscounts;
  paymentFrequency: EnrolmentPaymentFrequency;
  schedule: EnrolmentSchedule;
  scheduleHistory: EnrolmentScheduleHistory[];
  lessons: EnrolmentLesson[];
  history: EnrolmentHistory[];
}


