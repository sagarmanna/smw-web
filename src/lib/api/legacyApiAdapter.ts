/**
 * Simple Legacy API Adapter for Lesson Updates
 * Only handles the lesson update functionality
 */

export interface LegacyApiResponse {
  status: boolean;
  url?: string;
  message?: string;
  errors?: string[];
  data?: string; // HTML content for payment receipt
}

export interface LessonUpdateData {
  teacherId: string | number;
  date: string; // Format: "MMM dd, yyyy hh:mm AM/PM" (e.g., "Dec 12, 2025 04:30 PM")
  duration: string; // Format: "HH:mm" (e.g., "00:30")
  expiryDate?: string; // Format: "MMM dd, yyyy" (e.g., "Jan 10, 2026")
  goToDate?: string; // Format: "MMM dd, yyyy" (e.g., "Dec 8, 2025")
  hour?: string; // Format: "00" to "23"
  minute?: string; // Format: "00" to "59"
}

export interface LessonValidateData {
  hour: string; // Format: "00" to "23"
  minute: string; // Format: "00" to "59"
  duration: string; // Format: "HH:mm"
  teacherId: string | number;
  date: string; // Format: "MMM dd, yyyy hh:mm AM/PM" (e.g., "Dec 10, 2025 06:30 AM")
  expiryDate: string; // Format: "MMM dd, yyyy" (e.g., "Jan 02, 2026")
  goToDate: string; // Format: "MMM dd, yyyy" (e.g., "Dec 08, 2025")
}

export interface LessonValidationResponse {
  [key: string]: string[]; // e.g., {"lesson-date": ["Teacher occupied with another lesson"]}
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

export interface NotifyEmailData {
  emailNotifyTypeIds: number[];
}

export interface QualificationCreateData {
  programs: number[]; // Array of program IDs
  rate: number;
}

export interface QualificationUpdateData {
  rate: number;
}

export interface QualificationDeleteData {
  rate: number | string; // Can be number or empty string for delete
}

/**
 * Delete a user using the legacy API
 */
export async function deleteUser(
  location: string,
  userId: string | number
): Promise<LegacyApiResponse> {
  const url = `/admin/${location}/user/delete?id=${userId}`;

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

/**
 * Send notification email using the legacy API
 */
export async function notifyCustomerByEmail(
  location: string,
  customerId: string | number,
  notifyData: NotifyEmailData
): Promise<LegacyApiResponse> {
  const formData = new FormData();

  if (notifyData.emailNotifyTypeIds.length === 0) {
    throw new Error('At least one email notify type must be selected.');
  }

  notifyData.emailNotifyTypeIds.forEach((typeId) => {
    formData.append('NotificationEmailType[emailNotifyType][]', typeId.toString());
  });

  const url = `/admin/${location}/email/notify-email?customerId=${customerId}`;

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
 * Update a lesson using the legacy API
 */
export async function updateLesson(
  location: string,
  lessonId: string,
  lessonData: LessonUpdateData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  
  // Add hour and minute if provided
  if (lessonData.hour !== undefined) {
    formData.append('hour', lessonData.hour);
  }
  if (lessonData.minute !== undefined) {
    formData.append('minute', lessonData.minute);
  }
  
  // Add lesson data
  formData.append('Lesson[duration]', lessonData.duration);
  formData.append('Lesson[teacherId]', lessonData.teacherId.toString());
  formData.append('Lesson[date]', lessonData.date);
  
  // Add optional fields
  if (lessonData.expiryDate) {
    formData.append('PrivateLesson[expiryDate]', lessonData.expiryDate);
  }
  if (lessonData.goToDate) {
    formData.append('goToDate', lessonData.goToDate);
  }

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

/**
 * Validate lesson data before updating
 */
export async function validateLesson(
  location: string,
  lessonId: string,
  validateData: LessonValidateData
): Promise<LessonValidationResponse> {
  const formData = new FormData();
  formData.append('hour', validateData.hour);
  formData.append('minute', validateData.minute);
  formData.append('Lesson[duration]', validateData.duration);
  formData.append('Lesson[teacherId]', validateData.teacherId.toString());
  formData.append('Lesson[date]', validateData.date);
  formData.append('PrivateLesson[expiryDate]', validateData.expiryDate);
  formData.append('goToDate', validateData.goToDate);
  formData.append('ajax', 'modal-form');

  const url = `/admin/${location}/lesson/validate-on-update?id=${lessonId}`;
  
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
    return data || {};
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
 * Format date for validation API: "MMM dd, yyyy hh:mm AM/PM"
 * Example: "Dec 10, 2025 06:30 AM"
 */
export const formatDateForValidation = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  const minutesStr = minutes.toString().padStart(2, '0');
  const hoursStr = hours.toString().padStart(2, '0');
  
  return `${month} ${day}, ${year} ${hoursStr}:${minutesStr} ${ampm}`;
};

/**
 * Format date for validation API (date only): "MMM dd, yyyy"
 * Example: "Jan 02, 2026"
 */
export const formatDateOnlyForValidation = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
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
 * Update a recurring payment using the legacy API
 */
export async function updateRecurringPayment(
  location: string,
  customerId: string | number,
  recurringPaymentId: string | number,
  paymentData: RecurringPaymentCreateData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  // Note: customerId is not needed in form data for update, only in the URL path
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

  const url = `/admin/${location}/customer-recurring-payment/update?id=${recurringPaymentId}`;

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
 * Delete a recurring payment using the legacy API
 * Note: The legacy API requires sending form data even for delete
 */
export async function deleteRecurringPayment(
  location: string,
  customerId: string | number,
  recurringPaymentId: string | number,
  paymentData: RecurringPaymentCreateData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
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

  const url = `/admin/${location}/customer-recurring-payment/delete?id=${recurringPaymentId}`;

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

export interface EquipmentRentalInstrumentData {
  instrumentId: number;
  retailValue: string;
  assetTag: string;
  monthlyRate: string;
  numberOfMonths: string;
  total: string;
}

export interface EquipmentRentalCreateData {
  userId: string | number;
  customerName: string;
  studentId: string | number;
  startDate: string; // Format: "MMM dd, yyyy" (e.g., "Nov 03, 2025")
  isOnGoing: boolean;
  duration: number; // Number of months
  returnDate: string; // ISO date string
  securityDeposit: "yes" | "no";
  tenderType: string; // Number as string (e.g., "1")
  depositAmount: string;
  instruments: EquipmentRentalInstrumentData[];
  subTotal: number;
  hst: number;
  instrumentsTotal: number;
}

/**
 * Create an equipment rental using the legacy API
 */
export async function createEquipmentRental(
  location: string,
  customerId: string | number,
  rentalData: EquipmentRentalCreateData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  
  formData.append('EquipmentRentals[userId]', rentalData.userId.toString());
  formData.append('EquipmentRentals[customerId]', rentalData.customerName);
  formData.append('EquipmentRentals[studentId]', rentalData.studentId.toString());
  formData.append('EquipmentRentals[startDate]', rentalData.startDate);
  formData.append('EquipmentRentals[isOnGoing]', rentalData.isOnGoing ? '1' : '0');
  formData.append('EquipmentRentals[duration]', rentalData.duration.toString());
  formData.append('EquipmentRentals[returnDate]', rentalData.returnDate);
  
  // Security deposit needs to be sent twice (legacy API quirk)
  const securityDepositValue = rentalData.securityDeposit === "yes" ? "1" : "0";
  formData.append('EquipmentRentals[securityDeposit]', securityDepositValue);
  formData.append('EquipmentRentals[securityDeposit]', securityDepositValue);
  
  formData.append('EquipmentRentals[tenderType]', rentalData.tenderType || '');
  formData.append('EquipmentRentals[depositAmount]', rentalData.depositAmount || '');
  
  // Add instrument data with 1-based indexing
  rentalData.instruments.forEach((instrument, index) => {
    const idx = (index + 1).toString();
    formData.append(`EquipmentRentals[instruments][${idx}][value]`, instrument.instrumentId.toString());
    formData.append(`EquipmentRentals[values][${idx}][value]`, instrument.retailValue || '');
    formData.append(`EquipmentRentals[assets][${idx}][value]`, instrument.assetTag || '');
    formData.append(`EquipmentRentals[prices][${idx}][value]`, instrument.monthlyRate || '0');
    formData.append(`EquipmentRentals[durations][${idx}][value]`, instrument.numberOfMonths || '0');
    formData.append(`EquipmentRentals[totals][${idx}][value]`, instrument.total || '0.00');
    
    // Calculate tax for this instrument (13% HST)
    const instrumentTotal = parseFloat(instrument.total || '0');
    const instrumentTax = (instrumentTotal * 0.13).toFixed(2);
    formData.append(`EquipmentRentals[taxs][${idx}][value]`, instrumentTax);
  });

  const url = `/admin/${location}/equipment-rentals/create?id=${customerId}&isOnGoing=${rentalData.isOnGoing ? '1' : '0'}&securityDeposit=${securityDepositValue}&subTotal=${rentalData.subTotal.toFixed(2)}&hst=${rentalData.hst.toFixed(2)}&instutmentsTotal=${rentalData.instrumentsTotal.toFixed(2)}`;

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

export interface EquipmentReturnedData {
  userId: string | number;
  customerName: string;
  studentName: string; // Note: API expects student name, not ID
  // returnDate removed - we don't send it to preserve the original return date
  securityDeposit: string; // Empty string
  tenderType: string; // Empty string
  depositAmount: string; // "0.00"
  instruments: Array<{
    value?: string; // Empty string for retail value
    asset?: string; // Empty string for asset tag
    price: string; // Monthly rate
    duration: string; // Number of months
    total: string; // Total amount
    tax: string; // Tax amount
  }>;
}

export interface EquipmentRentalUpdateData {
  userId: string | number;
  customerName: string;
  studentName: string; // Note: API expects student name, not ID
  returnDate: string; // Format: "MMM dd, yyyy" (e.g., "Dec 25, 2025")
  securityDeposit: string; // Empty string
  tenderType: string; // Empty string
  depositAmount: string; // "0.00"
  instruments: Array<{
    value?: string; // Empty string for retail value
    asset?: string; // Empty string for asset tag
    price: string; // Monthly rate
    duration?: string; // Empty string or number of months
    total: string; // Total amount
    tax: string; // Tax amount (e.g., "13.00")
  }>;
}

export interface EquipmentRentalDeleteData {
  userId: string | number;
  customerName: string;
  studentName: string; // Note: API expects student name, not ID
  returnDate: string; // Format: "YYYY-MM-DD"
  securityDeposit: string; // Empty string
  tenderType: string; // Empty string
  depositAmount: string; // "0.00"
  instruments: Array<{
    value?: string; // Empty string for retail value
    asset?: string; // Empty string for asset tag
    price: string; // Monthly rate
    duration: string; // Number of months
    total: string; // Total amount
    tax: string; // Tax amount (13% HST)
  }>;
}

/**
 * Mark equipment as returned using the legacy API
 */
export async function equipmentReturned(
  location: string,
  rentalId: string | number,
  returnDateFormatted: string, // Format: "MMM dd, yyyy" for URL
  rentalData: EquipmentReturnedData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  
  formData.append('EquipmentRentals[userId]', rentalData.userId.toString());
  formData.append('EquipmentRentals[customerId]', rentalData.customerName);
  formData.append('EquipmentRentals[studentId]', rentalData.studentName);
  // NOTE: We do NOT send EquipmentRentals[returnDate] in FormData to preserve the original return date
  // The URL parameter 'returnDate' is used for the equipment returned date (today's date)
  
  // Security deposit needs to be sent twice (legacy API quirk) - empty values
  formData.append('EquipmentRentals[securityDeposit]', rentalData.securityDeposit);
  formData.append('EquipmentRentals[securityDeposit]', rentalData.securityDeposit);
  
  formData.append('EquipmentRentals[tenderType]', rentalData.tenderType || '');
  formData.append('EquipmentRentals[depositAmount]', rentalData.depositAmount || '0.00');
  
  // Add instrument data with 1-based indexing
  rentalData.instruments.forEach((instrument, index) => {
    const idx = (index + 1).toString();
    formData.append(`EquipmentRentals[values][${idx}][value]`, instrument.value || '');
    formData.append(`EquipmentRentals[assets][${idx}][value]`, instrument.asset || '');
    formData.append(`EquipmentRentals[prices][${idx}][value]`, instrument.price || '0');
    formData.append(`EquipmentRentals[durations][${idx}][value]`, instrument.duration || '0');
    formData.append(`EquipmentRentals[totals][${idx}][value]`, instrument.total || '0.00');
    formData.append(`EquipmentRentals[taxs][${idx}][value]`, instrument.tax || '0.00');
  });

  // URL encode the return date for the query parameter
  const encodedReturnDate = encodeURIComponent(returnDateFormatted);
  const url = `/admin/${location}/equipment-rentals/equipment-returned?id=${rentalId}&returnDate=${encodedReturnDate}`;

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
 * Update an equipment rental's return date using the legacy API
 */
export async function updateEquipmentRental(
  location: string,
  rentalId: string | number,
  returnDateFormatted: string, // Format: "MMM dd, yyyy" for URL and FormData
  rentalData: EquipmentRentalUpdateData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  
  formData.append('EquipmentRentals[userId]', rentalData.userId.toString());
  formData.append('EquipmentRentals[customerId]', rentalData.customerName);
  formData.append('EquipmentRentals[studentId]', rentalData.studentName);
  
  // Return date appears twice (legacy API quirk): once with value, once empty
  formData.append('EquipmentRentals[returnDate]', returnDateFormatted);
  formData.append('EquipmentRentals[returnDate]', '');
  
  // Security deposit needs to be sent (empty)
  formData.append('EquipmentRentals[securityDeposit]', rentalData.securityDeposit || '');
  
  formData.append('EquipmentRentals[tenderType]', rentalData.tenderType || '');
  formData.append('EquipmentRentals[depositAmount]', rentalData.depositAmount || '0.00');
  
  // Add instrument data with 1-based indexing
  rentalData.instruments.forEach((instrument, index) => {
    const idx = (index + 1).toString();
    formData.append(`EquipmentRentals[values][${idx}][value]`, instrument.value || '');
    formData.append(`EquipmentRentals[assets][${idx}][value]`, instrument.asset || '');
    formData.append(`EquipmentRentals[prices][${idx}][value]`, instrument.price || '0');
    formData.append(`EquipmentRentals[durations][${idx}][value]`, instrument.duration || '');
    formData.append(`EquipmentRentals[totals][${idx}][value]`, instrument.total || '0.00');
    formData.append(`EquipmentRentals[taxs][${idx}][value]`, instrument.tax || '0.00');
  });

  // URL encode the return date for the query parameter
  const encodedReturnDate = encodeURIComponent(returnDateFormatted);
  const url = `/admin/${location}/equipment-rentals/update?id=${rentalId}&returnDate=${encodedReturnDate}`;

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
 * Delete an equipment rental using the legacy API
 */
export async function deleteEquipmentRental(
  location: string,
  rentalId: string | number,
  rentalData: EquipmentRentalDeleteData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  
  formData.append('EquipmentRentals[userId]', rentalData.userId.toString());
  formData.append('EquipmentRentals[customerId]', rentalData.customerName);
  formData.append('EquipmentRentals[studentId]', rentalData.studentName);
  formData.append('EquipmentRentals[returnDate]', rentalData.returnDate);
  
  // Security deposit needs to be sent twice (legacy API quirk) - empty values
  formData.append('EquipmentRentals[securityDeposit]', rentalData.securityDeposit || '');
  formData.append('EquipmentRentals[securityDeposit]', rentalData.securityDeposit || '');
  
  formData.append('EquipmentRentals[tenderType]', rentalData.tenderType || '');
  formData.append('EquipmentRentals[depositAmount]', rentalData.depositAmount || '0.00');
  
  // Add instrument data with 1-based indexing
  rentalData.instruments.forEach((instrument, index) => {
    const idx = (index + 1).toString();
    formData.append(`EquipmentRentals[values][${idx}][value]`, instrument.value || '');
    formData.append(`EquipmentRentals[assets][${idx}][value]`, instrument.asset || '');
    formData.append(`EquipmentRentals[prices][${idx}][value]`, instrument.price || '0');
    formData.append(`EquipmentRentals[durations][${idx}][value]`, instrument.duration || '0');
    formData.append(`EquipmentRentals[totals][${idx}][value]`, instrument.total || '0.00');
    formData.append(`EquipmentRentals[taxs][${idx}][value]`, instrument.tax || '0.00');
  });

  const url = `/admin/${location}/equipment-rentals/delete?id=${rentalId}`;

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
 * Create a blank invoice using the legacy API
 * This is a GET request that creates an invoice and redirects to the invoice view page
 */
export async function createBlankInvoice(
  location: string,
  customerId: string | number
): Promise<LegacyApiResponse> {
  // Invoice::TYPE_INVOICE = 2
  const invoiceType = 2;
  
  // Build query parameters in the format expected by the legacy API
  const params = new URLSearchParams({
    'Invoice[customer_id]': customerId.toString(),
    'Invoice[type]': invoiceType.toString(),
  });

  const url = `/admin/${location}/invoice/blank-invoice?${params.toString()}`;

  try {
    // Make a GET request with redirect handling
    // The legacy API will create the invoice and return a redirect (302) to the invoice view page
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      redirect: 'manual', // Handle redirect manually to get the Location header
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    // If we get a redirect (302 or 301), extract the Location header
    if (response.status === 302 || response.status === 301) {
      const redirectUrl = response.headers.get('Location');
      if (redirectUrl) {
        // Construct full URL if it's a relative path
        // Yii2 redirects return relative paths like /admin/training-location/invoice/view?id=123
        const fullUrl = redirectUrl.startsWith('http') 
          ? redirectUrl 
          : `${window.location.origin}${redirectUrl.startsWith('/') ? '' : '/'}${redirectUrl}`;
        
        return {
          status: true,
          url: fullUrl,
        };
      }
      
      // If no Location header, try to construct from response.url
      if (response.url) {
        return {
          status: true,
          url: response.url,
        };
      }
    }

    // If no redirect but response is OK, use the response URL
    if (response.ok && response.url) {
      return {
        status: true,
        url: response.url,
      };
    }

    // If we get here, something went wrong
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}

export interface SendEmailData {
  objectId: number; // EmailObject::OBJECT_CUSTOMER_STATEMENT = 8
  userId: number;
  to: string[];
  subject: string;
  content: string;
}

/**
 * Send email using the legacy API
 */
export async function sendEmail(
  location: string,
  emailData: SendEmailData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  
  // Add to recipients (array format)
  emailData.to.forEach((email) => {
    formData.append('EmailForm[to][]', email);
  });
  
  formData.append('EmailForm[subject]', emailData.subject);
  formData.append('EmailForm[content]', emailData.content);

  const url = `/admin/${location}/email/send?EmailForm[objectId]=${emailData.objectId}&EmailForm[userId]=${emailData.userId}`;

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

export interface PaymentReceiveData {
  userId: string | number;
  date: string; // Format: "MMM dd, yyyy" (e.g., "Nov 09, 2025")
  paymentMethodId: number;
  reference: string;
  amount: number;
  amountNeeded: number;
  selectedCreditValue: number;
  amountToDistribute: number;
  notes: string;
  lessonPayments?: Array<{
    id: number;
    value: number;
  }>;
  groupLessonPayments?: Array<{
    id: number;
    value: number;
  }>;
  invoicePayments?: Array<{
    id: number;
    value: number;
  }>;
  paymentCredits?: Array<{
    id: number;
    value: number;
  }>;
  invoiceCredits?: Array<{
    id: number;
    value: number;
  }>;
  canUsePaymentCredits?: number; // 0 or 1
  canUseInvoiceCredits?: number; // 0 or 1
  prId?: string; // Optional, can be empty
}

/**
 * Receive a payment using the legacy API
 */
export async function receivePayment(
  location: string,
  paymentData: PaymentReceiveData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  
  // Helper function to format numbers to 2 decimal places as string
  const formatDecimal = (value: number): string => {
    return value.toFixed(2);
  };
  
  formData.append('Payment[user_id]', paymentData.userId.toString());
  formData.append('PaymentForm[date]', paymentData.date);
  formData.append('Payment[payment_method_id]', paymentData.paymentMethodId.toString());
  formData.append('Payment[reference]', paymentData.reference || '');
  formData.append('PaymentForm[amount]', formatDecimal(paymentData.amount));
  formData.append('PaymentForm[amountNeeded]', formatDecimal(paymentData.amountNeeded));
  formData.append('PaymentForm[selectedCreditValue]', formatDecimal(paymentData.selectedCreditValue));
  formData.append('PaymentForm[amountToDistribute]', formatDecimal(paymentData.amountToDistribute));
  formData.append('PaymentForm[notes]', paymentData.notes || '');
  
  // Add lesson payments if provided
  if (paymentData.lessonPayments && paymentData.lessonPayments.length > 0) {
    paymentData.lessonPayments.forEach((lessonPayment, index) => {
      formData.append(`PaymentForm[lessonPayments][${index}][id]`, lessonPayment.id.toString());
      formData.append(`PaymentForm[lessonPayments][${index}][value]`, formatDecimal(lessonPayment.value));
    });
  }
  
  // Add group lesson payments if provided
  if (paymentData.groupLessonPayments && paymentData.groupLessonPayments.length > 0) {
    paymentData.groupLessonPayments.forEach((groupLessonPayment, index) => {
      formData.append(`PaymentForm[groupLessonPayments][${index}][id]`, groupLessonPayment.id.toString());
      formData.append(`PaymentForm[groupLessonPayments][${index}][value]`, formatDecimal(groupLessonPayment.value));
    });
  }
  
  // Add invoice payments if provided
  if (paymentData.invoicePayments && paymentData.invoicePayments.length > 0) {
    paymentData.invoicePayments.forEach((invoicePayment, index) => {
      formData.append(`PaymentForm[invoicePayments][${index}][id]`, invoicePayment.id.toString());
      formData.append(`PaymentForm[invoicePayments][${index}][value]`, formatDecimal(invoicePayment.value));
    });
  }
  
  // Add payment credits if provided
  if (paymentData.paymentCredits && paymentData.paymentCredits.length > 0) {
    paymentData.paymentCredits.forEach((paymentCredit, index) => {
      formData.append(`PaymentForm[paymentCredits][${index}][id]`, paymentCredit.id.toString());
      formData.append(`PaymentForm[paymentCredits][${index}][value]`, formatDecimal(paymentCredit.value));
    });
  }
  
  // Add invoice credits if provided
  if (paymentData.invoiceCredits && paymentData.invoiceCredits.length > 0) {
    paymentData.invoiceCredits.forEach((invoiceCredit, index) => {
      formData.append(`PaymentForm[invoiceCredits][${index}][id]`, invoiceCredit.id.toString());
      formData.append(`PaymentForm[invoiceCredits][${index}][value]`, formatDecimal(invoiceCredit.value));
    });
  }
  
  formData.append('PaymentForm[canUsePaymentCredits]', (paymentData.canUsePaymentCredits || 0).toString());
  formData.append('PaymentForm[canUseInvoiceCredits]', (paymentData.canUseInvoiceCredits || 0).toString());
  formData.append('PaymentForm[userId]', paymentData.userId.toString());
  formData.append('PaymentForm[prId]', paymentData.prId || '');

  const url = `/admin/${location}/payment/receive`;

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

export interface PaymentUpdateData {
  date: string; // Format: "MMM dd, yyyy" (e.g., "Dec 02, 2025")
  paymentMethodId: number;
  reference: string;
  amount: number;
  amountToDistribute: number;
  lessonPayments?: Array<{
    id: number;
    value: number;
  }>;
  groupLessonPayments?: Array<{
    id: number;
    value: number;
  }>;
  invoicePayments?: Array<{
    id: number;
    value: number;
  }>;
}

/**
 * Update a payment using the legacy API
 */
export async function updatePayment(
  location: string,
  paymentId: string | number,
  paymentData: PaymentUpdateData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  
  // Helper function to format numbers to 2 decimal places as string
  const formatDecimal = (value: number): string => {
    return value.toFixed(2);
  };
  
  formData.append('Payment[date]', paymentData.date);
  formData.append('Payment[payment_method_id]', paymentData.paymentMethodId.toString());
  formData.append('Payment[reference]', paymentData.reference || '');
  formData.append('PaymentEditForm[amount]', formatDecimal(paymentData.amount));
  formData.append('PaymentEditForm[amountToDistribute]', formatDecimal(paymentData.amountToDistribute));
  
  // Add lesson payments if provided
  if (paymentData.lessonPayments && paymentData.lessonPayments.length > 0) {
    paymentData.lessonPayments.forEach((lessonPayment, index) => {
      formData.append(`PaymentEditForm[lessonPayments][${index}][id]`, lessonPayment.id.toString());
      formData.append(`PaymentEditForm[lessonPayments][${index}][value]`, formatDecimal(lessonPayment.value));
    });
  }
  
  // Add group lesson payments if provided
  if (paymentData.groupLessonPayments && paymentData.groupLessonPayments.length > 0) {
    paymentData.groupLessonPayments.forEach((groupLessonPayment, index) => {
      formData.append(`PaymentEditForm[groupLessonPayments][${index}][id]`, groupLessonPayment.id.toString());
      formData.append(`PaymentEditForm[groupLessonPayments][${index}][value]`, formatDecimal(groupLessonPayment.value));
    });
  }
  
  // Add invoice payments if provided
  if (paymentData.invoicePayments && paymentData.invoicePayments.length > 0) {
    paymentData.invoicePayments.forEach((invoicePayment, index) => {
      formData.append(`PaymentEditForm[invoicePayments][${index}][id]`, invoicePayment.id.toString());
      formData.append(`PaymentEditForm[invoicePayments][${index}][value]`, formatDecimal(invoicePayment.value));
    });
  }

  const url = `/admin/${location}/payment/update?id=${paymentId}`;

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
 * Delete a payment using the legacy API
 */
export async function deletePayment(
  location: string,
  paymentId: string | number
): Promise<LegacyApiResponse> {
  const url = `/admin/${location}/payment/delete?id=${paymentId}`;

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

/**
 * Create a qualification (private or group) using the legacy API
 * @param location - The location string
 * @param teacherId - The teacher/user ID
 * @param type - Qualification type: 1 for private, 2 for group
 * @param qualificationData - The qualification data with programs and rate
 */
export async function createQualification(
  location: string,
  teacherId: string | number,
  type: 1 | 2, // 1 = private, 2 = group
  qualificationData: QualificationCreateData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  
  // Add programs array - the legacy API expects Qualification[programs][] format
  qualificationData.programs.forEach((programId) => {
    formData.append('Qualification[programs][]', programId.toString());
  });
  
  formData.append('Qualification[rate]', qualificationData.rate.toString());

  const url = `/admin/${location}/qualification/create?id=${teacherId}&type=${type}`;

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
 * Update a qualification (private or group) using the legacy API
 * @param location - The location string
 * @param qualificationId - The qualification ID
 * @param qualificationData - The qualification data with rate
 */
export async function updateQualification(
  location: string,
  qualificationId: string | number,
  qualificationData: QualificationUpdateData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  
  formData.append('Qualification[rate]', qualificationData.rate.toString());

  const url = `/admin/${location}/qualification/update?id=${qualificationId}`;

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
 * Delete a qualification (private or group) using the legacy API
 * @param location - The location string
 * @param qualificationId - The qualification ID
 * @param qualificationData - The qualification data with rate
 */
export async function deleteQualification(
  location: string,
  qualificationId: string | number,
  qualificationData: QualificationDeleteData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  
  // Handle empty string or number for rate
  const rateValue = typeof qualificationData.rate === 'string' 
    ? qualificationData.rate 
    : qualificationData.rate.toString();
  formData.append('Qualification[rate]', rateValue);

  const url = `/admin/${location}/qualification/delete?id=${qualificationId}`;

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

export interface TeacherBulkRescheduleResponse {
  status: boolean;
  message?: string;
  reshedule?: boolean;
}

/**
 * Submit bulk reschedule request for teacher lessons using the legacy API
 * @param location - Location slug
 * @param teacherId - Teacher ID
 * @param sourceDate - Source date in format "MMM dd, yyyy" (e.g., "Dec 13, 2025")
 * @param destinationDate - Destination date in format "MMM dd, yyyy" (e.g., "Dec 14, 2025")
 * @returns API response
 */
export async function submitTeacherBulkReschedule(
  location: string,
  teacherId: number,
  sourceDate: string,
  destinationDate: string
): Promise<TeacherBulkRescheduleResponse> {
  const formData = new FormData();
  formData.append('PrivateLesson[teacherBulkRescheduleSourceDate]', sourceDate);
  formData.append('PrivateLesson[teacherBulkRescheduleDestinationDate]', destinationDate);

  const url = `/admin/${location}/private-lesson/teacher-bulk-reschedule?PrivateLesson[selectedTeacherId]=${teacherId}`;

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

export interface TeacherUnavailabilityValidationResponse {
  [key: string]: string[];
}

export interface TeacherUnavailabilityCreateResponse {
  status: boolean;
  message?: string;
}

export interface TeacherUnavailabilityUpdateResponse {
  status: boolean;
  message?: string;
  errors?: {
    fromDateTime?: string[];
    toDateTime?: string[];
    reason?: string[];
  };
}

export interface TeacherUnavailabilityDeleteResponse {
  status: boolean;
  message?: string;
}

/**
 * Validate teacher unavailability using the legacy API
 * @param location - Location slug
 * @param teacherId - Teacher ID
 * @param fromDateTime - From date time in format "MMM dd, yyyy HH:mm" (e.g., "Dec 22, 2025 11:55")
 * @param toDateTime - To date time in format "MMM dd, yyyy HH:mm" (e.g., "Dec 22, 2025 04:25")
 * @param reason - Reason for unavailability
 * @returns Validation errors object with field names as keys and error messages as arrays
 */
export async function validateTeacherUnavailability(
  location: string,
  teacherId: number,
  fromDateTime: string,
  toDateTime: string,
  reason: string
): Promise<TeacherUnavailabilityValidationResponse> {
  const formData = new FormData();
  formData.append('TeacherUnavailability[fromDateTime]', fromDateTime);
  formData.append('TeacherUnavailability[toDateTime]', toDateTime);
  formData.append('TeacherUnavailability[reason]', reason);

  const url = `/admin/${location}/teacher-unavailability/validate?teacherId=${teacherId}`;

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
 * Create teacher unavailability using the legacy API
 * @param location - Location slug
 * @param teacherId - Teacher ID
 * @param fromDateTime - From date time in format "MMM dd, yyyy HH:mm" (e.g., "Dec 22, 2025 11:55")
 * @param toDateTime - To date time in format "MMM dd, yyyy HH:mm" (e.g., "Dec 22, 2025 14:00")
 * @param reason - Reason for unavailability
 * @returns API response with status
 */
export async function createTeacherUnavailability(
  location: string,
  teacherId: number,
  fromDateTime: string,
  toDateTime: string,
  reason: string
): Promise<TeacherUnavailabilityCreateResponse> {
  const formData = new FormData();
  formData.append('TeacherUnavailability[fromDateTime]', fromDateTime);
  formData.append('TeacherUnavailability[toDateTime]', toDateTime);
  formData.append('TeacherUnavailability[reason]', reason);

  const url = `/admin/${location}/teacher-unavailability/create?id=${teacherId}`;

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
 * Update teacher unavailability using the legacy API
 * @param location - Location slug
 * @param unavailabilityId - Unavailability ID
 * @param fromDateTime - From date time in format "MMM dd, yyyy HH:mm" (e.g., "Dec 22, 2025 10:50")
 * @param toDateTime - To date time in format "MMM dd, yyyy HH:mm" (e.g., "Dec 22, 2025 11:50")
 * @param reason - Reason for unavailability
 * @returns API response with status and optional errors
 */
export async function updateTeacherUnavailability(
  location: string,
  unavailabilityId: number | string,
  fromDateTime: string,
  toDateTime: string,
  reason: string
): Promise<TeacherUnavailabilityUpdateResponse> {
  const formData = new FormData();
  formData.append('TeacherUnavailability[fromDateTime]', fromDateTime);
  formData.append('TeacherUnavailability[toDateTime]', toDateTime);
  formData.append('TeacherUnavailability[reason]', reason);

  const url = `/admin/${location}/teacher-unavailability/update?id=${unavailabilityId}`;

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
 * Delete teacher unavailability using the legacy API
 * @param location - Location slug
 * @param unavailabilityId - Unavailability ID
 * @param fromDateTime - From date time in format "MMM dd, yyyy HH:mm" (e.g., "Dec 22, 2025 10:55")
 * @param toDateTime - To date time in format "MMM dd, yyyy HH:mm" (e.g., "Dec 22, 2025 11:55")
 * @param reason - Reason for unavailability
 * @returns API response with status
 */
export async function deleteTeacherUnavailability(
  location: string,
  unavailabilityId: number | string,
  fromDateTime: string,
  toDateTime: string,
  reason: string
): Promise<TeacherUnavailabilityDeleteResponse> {
  const formData = new FormData();
  formData.append('TeacherUnavailability[fromDateTime]', fromDateTime);
  formData.append('TeacherUnavailability[toDateTime]', toDateTime);
  formData.append('TeacherUnavailability[reason]', reason);

  const url = `/admin/${location}/teacher-unavailability/delete?id=${unavailabilityId}`;

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
 * Delete teacher availability using the legacy API
 * @param location - Location slug
 * @param availabilityId - Availability ID to delete
 * @param availabilityData - The availability data (required for form submission)
 * @returns API response with status and optional URL
 */
export async function deleteTeacherAvailability(
  location: string,
  availabilityId: number,
  availabilityData: TeacherAvailabilityModifyData
): Promise<TeacherAvailabilityDeleteResponse> {
  const formData = new FormData();
  
  // Convert times to 12-hour format
  const fromTime12Hour = convertTimeTo12Hour(availabilityData.fromTime);
  const toTime12Hour = convertTimeTo12Hour(availabilityData.toTime);
  
  // Extract time components for from_time
  const fromComponents = extractTimeComponents(availabilityData.fromTime);
  formData.append('hour', fromComponents.hour);
  formData.append('minute', fromComponents.minute);
  formData.append('meridian', fromComponents.meridian);
  
  // Add TeacherRoom[from_time] in 12-hour format
  formData.append('TeacherRoom[from_time]', fromTime12Hour);
  
  // Extract time components for to_time
  const toComponents = extractTimeComponents(availabilityData.toTime);
  formData.append('hour', toComponents.hour);
  formData.append('minute', toComponents.minute);
  formData.append('meridian', toComponents.meridian);
  
  // Add TeacherRoom[to_time] in 12-hour format
  formData.append('TeacherRoom[to_time]', toTime12Hour);
  
  // Add day and classroomId (classroomId can be empty)
  formData.append('TeacherRoom[day]', availabilityData.day.toString());
  if (availabilityData.classroomId) {
    formData.append('TeacherRoom[classroomId]', availabilityData.classroomId.toString());
  }

  const url = `/admin/${location}/teacher-availability/delete?id=${availabilityId}`;

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

export interface TeacherAvailabilityModifyData {
  day: number; // 1-7 (Monday-Sunday)
  fromTime: string; // Format: "HH:mm:ss" (e.g., "13:00:00")
  toTime: string; // Format: "HH:mm:ss" (e.g., "14:15:00")
  classroomId?: number;
}

export interface TeacherAvailabilityModifyResponse {
  status: boolean;
  message?: string;
}

export interface TeacherAvailabilityDeleteResponse {
  status: boolean;
  url?: string;
  message?: string;
}

/**
 * Convert time from "HH:mm:ss" format to 12-hour format with AM/PM
 * @param timeStr - Time in "HH:mm:ss" format (e.g., "13:00:00")
 * @returns Time in "g:i A" format (e.g., "1:00 PM")
 */
function convertTimeTo12Hour(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Extract hour, minute, and meridian from time string
 */
function extractTimeComponents(timeStr: string): { hour: string; minute: string; meridian: string } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  const hour12 = date.getHours() % 12 || 12; // Convert to 12-hour format (1-12)
  const minute = date.getMinutes();
  const meridian = date.getHours() >= 12 ? 'PM' : 'AM';
  
  return {
    hour: hour12.toString().padStart(2, '0'),
    minute: minute.toString().padStart(2, '0'),
    meridian: meridian,
  };
}

/**
 * Modify teacher availability (create or update) using the legacy API
 * @param location - Location slug
 * @param teacherId - Teacher ID
 * @param availabilityId - Availability ID (0 for create, actual ID for update)
 * @param availabilityData - The availability data
 * @returns API response with status
 */
export async function modifyTeacherAvailability(
  location: string,
  teacherId: number,
  availabilityId: number,
  availabilityData: TeacherAvailabilityModifyData
): Promise<TeacherAvailabilityModifyResponse> {
  const formData = new FormData();
  
  // Convert times to 12-hour format
  const fromTime12Hour = convertTimeTo12Hour(availabilityData.fromTime);
  const toTime12Hour = convertTimeTo12Hour(availabilityData.toTime);
  
  // Extract time components for from_time
  const fromComponents = extractTimeComponents(availabilityData.fromTime);
  formData.append('hour', fromComponents.hour);
  formData.append('minute', fromComponents.minute);
  formData.append('meridian', fromComponents.meridian);
  
  // Add TeacherRoom[from_time] in 12-hour format
  formData.append('TeacherRoom[from_time]', fromTime12Hour);
  
  // Extract time components for to_time
  const toComponents = extractTimeComponents(availabilityData.toTime);
  formData.append('hour', toComponents.hour);
  formData.append('minute', toComponents.minute);
  formData.append('meridian', toComponents.meridian);
  
  // Add TeacherRoom[to_time] in 12-hour format
  formData.append('TeacherRoom[to_time]', toTime12Hour);
  
  // Add day and classroomId
  formData.append('TeacherRoom[day]', availabilityData.day.toString());
  if (availabilityData.classroomId) {
    formData.append('TeacherRoom[classroomId]', availabilityData.classroomId.toString());
  }

  const url = `/admin/${location}/teacher-availability/modify?teacherId=${teacherId}&id=${availabilityId}`;

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