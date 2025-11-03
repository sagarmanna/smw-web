/**
 * Simple Legacy API Adapter for Lesson Updates
 * Only handles the lesson update functionality
 */

export interface LegacyApiResponse {
  status: boolean;
  url?: string;
  message?: string;
  errors?: string[];
}

export interface LessonUpdateData {
  teacherId: string | number;
  date: string; // Format: YYYY-MM-DD HH:mm:ss
  duration: string; // Format: HH:mm:ss
}

export interface ClassroomModifyData {
  classroomId: string | number;
}

export interface StudentCreateData {
  firstName: string;
  lastName: string;
  customerId: string | number;
  birthDate: string; // Format: MMM d, yyyy (e.g., "Nov 01, 2018")
  gender: "not-specified" | "male" | "female";
}

/**
 * Update a lesson using the legacy API
 */
export async function updateLesson(
  location: string,
  lessonId: string,
  lessonData: LessonUpdateData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  formData.append('Lesson[teacherId]', lessonData.teacherId.toString());
  formData.append('Lesson[date]', lessonData.date);
  formData.append('Lesson[duration]', lessonData.duration);

  const url = `/admin/${location}/lesson/update?id=${lessonId}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}

// Export utility functions for date/duration formatting
export const formatDateTimeForLegacy = (date: Date): string => {
  // Format as local time instead of UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatDurationForLegacy = (startTime: Date, endTime: Date): string => {
  const diffMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Modify classroom for a lesson using the legacy API
 */
export async function modifyClassroom(
  location: string,
  lessonId: string,
  classroomData: ClassroomModifyData
): Promise<LegacyApiResponse> {
  const url = `/admin/${location}/lesson/modify-classroom?id=${lessonId}&classroomId=${classroomData.classroomId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Set a user's password using the legacy API
 */
export async function setUserPassword(
  location: string,
  userId: string | number,
  password: string,
  confirmPassword: string
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  formData.append('UserForm[password]', password);
  formData.append('UserForm[confirmPassword]', confirmPassword);

  const url = `/admin/${location}/user/set-password?id=${userId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Create a student using the legacy API
 */
export async function createStudent(
  location: string,
  userId: string | number,
  studentData: StudentCreateData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  formData.append('Student[first_name]', studentData.firstName);
  formData.append('Student[last_name]', studentData.lastName);
  formData.append('Student[customer_id]', studentData.customerId.toString());
  
  if (studentData.birthDate && studentData.birthDate.trim()) {
    formData.append('Student[birth_date]', studentData.birthDate);
  }
  
  // Map gender: "male" -> 1, "female" -> 2, "not-specified" -> empty
  if (studentData.gender === 'male') {
    formData.append('Student[gender]', '1');
  } else if (studentData.gender === 'female') {
    formData.append('Student[gender]', '2');
  }
  // For "not-specified", don't append anything (or append empty string)
  
  formData.append('User[id]', userId.toString());

  const url = `/admin/${location}/student/create?userId=${userId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Create a note/comment using the legacy API
 */
export async function createNote(
  location: string,
  instanceId: string | number,
  instanceType: number,
  content: string
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  formData.append('Note[content]', content);

  const url = `/admin/${location}/note/create?instanceId=${instanceId}&instanceType=${instanceType}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Merge a customer into another customer using the legacy API
 */
export async function mergeCustomer(
  location: string,
  currentCustomerId: string | number,
  duplicateCustomerId: string | number
): Promise<LegacyApiResponse> {
  const url = `/admin/${location}/customer/merge?id=${currentCustomerId}&customerId=${duplicateCustomerId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}

export interface RecurringPaymentCreateData {
  customerId: number;
  startDate: string; // Format: MMM dd, yyyy (e.g., "Nov 03, 2025")
  paymentDay: number;
  paymentFrequencyId: number;
  paymentMethodId: number;
  expiryMonth?: string; // Optional, can be empty
  expiryYear?: string; // Optional, can be empty
  amount: number;
  isRecurringPaymentEnabled: boolean;
}

/**
 * Create a recurring payment using the legacy API
 */
export async function createRecurringPayment(
  location: string,
  customerId: string | number,
  paymentData: RecurringPaymentCreateData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  formData.append('CustomerRecurringPayment[customerId]', paymentData.customerId.toString());
  formData.append('CustomerRecurringPayment[startDate]', paymentData.startDate);
  formData.append('CustomerRecurringPayment[paymentDay]', paymentData.paymentDay.toString());
  formData.append('CustomerRecurringPayment[paymentFrequencyId]', paymentData.paymentFrequencyId.toString());
  formData.append('CustomerRecurringPayment[paymentMethodId]', paymentData.paymentMethodId.toString());
  
  // Expiry month and year - append even if empty
  formData.append('CustomerRecurringPayment[expiryMonth]', paymentData.expiryMonth || '');
  formData.append('CustomerRecurringPayment[expiryYear]', paymentData.expiryYear || '');
  
  formData.append('CustomerRecurringPayment[amount]', paymentData.amount.toString());
  
  // isRecurringPaymentEnabled needs to be sent twice:
  // First as '0', then as the actual value ('1' if enabled, '0' if not)
  // This is a quirk of the legacy API
  formData.append('CustomerRecurringPayment[isRecurringPaymentEnabled]', '0');
  formData.append('CustomerRecurringPayment[isRecurringPaymentEnabled]', paymentData.isRecurringPaymentEnabled ? '1' : '0');

  const url = `/admin/${location}/customer-recurring-payment/create?id=${customerId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}