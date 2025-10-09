/* eslint-disable @typescript-eslint/no-unused-vars */
export interface PaidUnscheduledGroupLesson {
  lessonId: string;
  studentName: string;
  customerName: string;
  date: string;
  duration: string;
  amount: number;
  paidAmount: number;
  balance: number;
}

export interface PrepaidFuturePrivateLesson {
  lessonId: string;
  studentName: string;
  customerName: string;
  date: string;
  duration: string;
  amount: number;
  paidAmount: number;
  balance: number;
}

export interface PaidUnscheduledPrivateLesson {
  lessonId: string;
  studentName: string;
  customerName: string;
  date: string;
  duration: string;
  amount: number;
  paidAmount: number;
  balance: number;
}

export interface ActiveOutstandingInvoice {
  invoiceId: string;
  customerName: string;
  date: string;
  amount: number;
  paidAmount: number;
  balance: number;
}

export interface InactiveOutstandingInvoice {
  invoiceId: string;
  customerName: string;
  date: string;
  amount: number;
  paidAmount: number;
  balance: number;
}

export interface ActiveCustomerWithCredit {
  customerId: string;
  customerName: string;
  balance: number;
}

export interface InactiveCustomerWithCredit {
  customerId: string;
  customerName: string;
  balance: number;
}

export interface FinancialSummaryData {
  paidUnscheduledGroupLessons: PaidUnscheduledGroupLesson[];
  prepaidFuturePrivateLessons: PrepaidFuturePrivateLesson[];
  paidUnscheduledPrivateLessons: PaidUnscheduledPrivateLesson[];
  activeOutstandingInvoices: ActiveOutstandingInvoice[];
  inactiveOutstandingInvoices: InactiveOutstandingInvoice[];
  activeCustomersWithCredit: ActiveCustomerWithCredit[];
  inactiveCustomersWithCredit: InactiveCustomerWithCredit[];
}

// Mock data generator
const mockData: FinancialSummaryData = {
  paidUnscheduledGroupLessons: [
    { lessonId: "169901", studentName: "Danish Leena", customerName: "Danish Leena", date: "Dec 25, 2018 @ 03:00 PM", duration: "01:00", amount: 15.63, paidAmount: 15.63, balance: 0.00 },
    { lessonId: "194075", studentName: "Jim Carter", customerName: "John Carter", date: "Jan 10, 2019 @ 04:00 PM", duration: "01:00", amount: 31.25, paidAmount: 31.25, balance: 0.00 },
    { lessonId: "194075", studentName: "Julie Rockwell", customerName: "Sam Rockwell", date: "Jan 10, 2019 @ 04:00 PM", duration: "01:00", amount: 29.17, paidAmount: 29.17, balance: 0.00 },
    { lessonId: "194075", studentName: "John Derin", customerName: "Jack Derin", date: "Jan 10, 2019 @ 04:00 PM", duration: "01:00", amount: 29.17, paidAmount: 29.17, balance: 0.00 },
    { lessonId: "194075", studentName: "Kevin Laurel", customerName: "Liza Laurel", date: "Jan 10, 2019 @ 04:00 PM", duration: "01:00", amount: 29.17, paidAmount: 29.17, balance: 0.00 },
  ],
  prepaidFuturePrivateLessons: [
    { lessonId: "3300007", studentName: "Sofi test", customerName: "Sento test", date: "Oct 15, 2025 @ 10:30 AM", duration: "00:30", amount: 26.68, paidAmount: 26.68, balance: 0.00 },
    { lessonId: "3300008", studentName: "Sofi test", customerName: "Sento test", date: "Oct 22, 2025 @ 10:30 AM", duration: "00:30", amount: 26.68, paidAmount: 26.68, balance: 0.00 },
    { lessonId: "3594148", studentName: "Sofi test", customerName: "Sento test", date: "Oct 10, 2025 @ 07:00 AM", duration: "01:00", amount: 59.38, paidAmount: 59.38, balance: 0.00 },
    { lessonId: "3594149", studentName: "Sofi test", customerName: "Sento test", date: "Oct 17, 2025 @ 07:00 AM", duration: "01:00", amount: 59.38, paidAmount: 59.38, balance: 0.00 },
    { lessonId: "3594150", studentName: "Sofi test", customerName: "Sento test", date: "Oct 24, 2025 @ 07:00 AM", duration: "01:00", amount: 59.38, paidAmount: 59.38, balance: 0.00 },
  ],
  paidUnscheduledPrivateLessons: [
    { lessonId: "4691260", studentName: "Test student18", customerName: "Test customer18", date: "Aug 08, 2025 @ 02:30 PM", duration: "00:30", amount: 28.75, paidAmount: 28.75, balance: 0.00 },
  ],
  activeOutstandingInvoices: [
    { invoiceId: "15967", customerName: "Thomad john", date: "Sep 10, 2018", amount: 28.75, paidAmount: 0.00, balance: 28.75 },
    { invoiceId: "15968", customerName: "Thomad john", date: "Sep 17, 2018", amount: 28.75, paidAmount: 0.00, balance: 28.75 },
    { invoiceId: "15969", customerName: "Thomad john", date: "Sep 24, 2018", amount: 28.75, paidAmount: 0.00, balance: 28.75 },
    { invoiceId: "15976", customerName: "leena thomas", date: "Sep 10, 2018", amount: 27.00, paidAmount: 0.00, balance: 27.00 },
    { invoiceId: "15977", customerName: "leena thomas", date: "Sep 17, 2018", amount: 27.00, paidAmount: 0.00, balance: 27.00 },
  ],
  inactiveOutstandingInvoices: [
    { invoiceId: "20452", customerName: "Danish Len", date: "Sep 04, 2018", amount: 27.50, paidAmount: 0.00, balance: 27.50 },
    { invoiceId: "20453", customerName: "Danish Len", date: "Sep 18, 2018", amount: 27.50, paidAmount: 0.00, balance: 27.50 },
    { invoiceId: "20454", customerName: "Danish Len", date: "Sep 25, 2018", amount: 27.50, paidAmount: 0.00, balance: 27.50 },
    { invoiceId: "20610", customerName: "Karkae Ranae", date: "Oct 02, 2018", amount: 15.63, paidAmount: 0.00, balance: 15.63 },
    { invoiceId: "20615", customerName: "Karkae Ranae", date: "Oct 09, 2018", amount: 15.63, paidAmount: 0.00, balance: 15.63 },
  ],
  activeCustomersWithCredit: [
    { customerId: "3884", customerName: "Jack Black", balance: -344.99 },
    { customerId: "12771", customerName: "Heather O'Connell", balance: -58.50 },
    { customerId: "14006", customerName: "Test customer22", balance: -100.00 },
  ],
  inactiveCustomersWithCredit: [
    { customerId: "5557", customerName: "Debbie Daniel", balance: -89.69 },
    { customerId: "7453", customerName: "Bill Tom", balance: -223.12 },
    { customerId: "9761", customerName: "lola peters", balance: -130.00 },
    { customerId: "12451", customerName: "Customer Refund Test", balance: -260.00 },
  ],
};

export async function getFinancialSummary(
  location: string,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; data: FinancialSummaryData; message?: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: mockData,
  };
}