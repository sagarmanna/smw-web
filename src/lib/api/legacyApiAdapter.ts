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
    tax: string; // Tax amount
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
  formData.append('EquipmentRentals[returnDate]', rentalData.returnDate);
  
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