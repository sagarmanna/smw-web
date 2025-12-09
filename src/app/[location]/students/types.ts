export interface StudentBasicDetails {
  id: string;
  firstName: string;
  lastName: string;
  birthday?: string;
  age?: string;
  gender?: string;
  status: string;
  notes?: string;
}

// StudentProfile is an alias for StudentBasicDetails (for backward compatibility)
export type StudentProfile = StudentBasicDetails;

export interface StudentCustomer {
  customer: string;
  phone: string;
  customerId?: number;
}

export interface StudentEnrolment {
  id: number;
  program: string;
  teacher: string;
  day: string;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
}

export interface StudentEvaluation {
  examDate: string;
  mark: string;
  level: string;
  program: string;
  type: string;
  teacher: string;
}

export interface StudentInfo {
  profile: StudentProfile;
  customer: StudentCustomer;
  enrolments: StudentEnrolment[];
  evaluations: StudentEvaluation[];
}

