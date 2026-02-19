export interface PrivateLessonDetails {
  id: number;
  program: string;
  classroom: string;
  classroomId?: number;
  status: string;
  colorCode: string;
  online: boolean;
  student: string;
  studentId?: number;
  customer: string;
  customerId?: number;
  phone: string;
  isPrivate?: boolean;
  isGroup?: boolean;
  attendance: {
    present: boolean;
  };
  cost: {
    costPerHour: string;
    cost: string;
    price: string;
    profit: string;
  };
  schedule: {
    teacher: string;
    teacherId?: number;
    scheduledDate: string;
    time: string;
    duration: string;
    expiryDate: string;
  };
  dueDate: string;
  totals: {
    lessonRatePerHour: string;
    qty: string;
    lessonPrice: string;
    discount: string;
    subTotal: string;
    tax: string;
    total: string;
    paid: string;
    balance: string;
  };
}

export interface PrivateLessonPayment {
  id?: number;
  date: string;
  paymentMethod: string;
  number: string;
  amount: string;
}

export interface PrivateLessonHistory {
  id?: number;
  message: string;
  createdOn?: string;
}

export interface PrivateLessonComment {
  id: number;
  content: string;
  createdUser: string;
  avatar: string;
  createdOn: string;
}

export interface PrivateLessonInfo {
  details: PrivateLessonDetails;
  payments: PrivateLessonPayment[];
  history: PrivateLessonHistory[];
  comments: PrivateLessonComment[];
  // Group lesson specific data (when isGroup: true)
  students?: GroupLessonStudent[];
  groupCost?: GroupLessonCost;
}

// Group Lesson Student Interface (for isGroup: true)
export interface GroupLessonStudent {
  id: number;
  studentName: string;
  customerName: string;
  dueDate: string;
  grossPrice: string;
  discount: string;
  netPrice: string;
  owing: string;
}

// Group Lesson Cost Data
export interface GroupLessonCost {
  costPerHour: string;
  cost: string;
  costPerStudent: string;
}
