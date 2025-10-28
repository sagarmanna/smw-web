import { 
  ProformaInvoiceDetailData 
} from '../tabConfigs';

// Interface for recurring payment enrolments
export interface RecurringPaymentEnrolmentData {
  id: string;
  program: string;
  paymentFrequency: string;
  student: string;
  teacher: string;
  selected: boolean;
}

// Mock data for customer detail tabs
export const mockCustomerTabData = {
  // Detailed rows for the standalone Proforma Invoice page
  proformaInvoiceDetailData: [
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Oct 01, 2025", endDate: "Oct 31, 2025", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Nov 01, 2025", endDate: "Nov 30, 2025", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Dec 01, 2025", endDate: "Dec 31, 2025", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Jan 01, 2026", endDate: "Jan 31, 2026", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Feb 01, 2026", endDate: "Feb 28, 2026", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Mar 01, 2026", endDate: "Mar 31, 2026", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Apr 01, 2026", endDate: "Apr 30, 2026", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "May 01, 2026", endDate: "May 31, 2026", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Jun 01, 2026", endDate: "Jun 30, 2026", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Jul 01, 2026", endDate: "Jul 31, 2026", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Aug 01, 2026", endDate: "Aug 31, 2026", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Sep 01, 2026", endDate: "Sep 30, 2026", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Oct 01, 2026", endDate: "Oct 31, 2026", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Nov 01, 2026", endDate: "Nov 30, 2026", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Dec 01, 2026", endDate: "Dec 31, 2026", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Jan 01, 2027", endDate: "Jan 31, 2027", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Feb 01, 2027", endDate: "Feb 28, 2027", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Mar 01, 2027", endDate: "Mar 31, 2027", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Apr 01, 2027", endDate: "Apr 30, 2027", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "May 01, 2027", endDate: "May 31, 2027", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Jun 01, 2027", endDate: "Jun 30, 2027", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Jul 01, 2027", endDate: "Jul 31, 2027", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Aug 01, 2027", endDate: "Aug 31, 2027", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Sep 01, 2027", endDate: "Sep 30, 2027", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Oct 01, 2027", endDate: "Oct 31, 2027", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Nov 01, 2027", endDate: "Nov 30, 2027", dueDate: "-", proFormaInvoice: "-", status: "-" },
    { student: "(AJ)stu4 (AJ)test2", program: "xPiano Contemporary", startDate: "Dec 01, 2027", endDate: "Dec 31, 2027", dueDate: "-", proFormaInvoice: "-", status: "-" },
  ] as ProformaInvoiceDetailData[],

 

  recurringPaymentEnrolments: [
    {
      id: "1",
      program: "Ukulele",
      paymentFrequency: "Quarterly",
      student: "321123 123",
      teacher: "Art Tatum",
      selected: false,
    },
    {
      id: "2",
      program: "xPiano Core",
      paymentFrequency: "Monthly",
      student: "321123 123",
      teacher: "Alexander Hamilton",
      selected: false,
    },
    {
      id: "3",
      program: "Guitar Core",
      paymentFrequency: "Monthly",
      student: "321123 123",
      teacher: "Alexander Hamilton",
      selected: false,
    },
    {
      id: "4",
      program: "Guitar Core",
      paymentFrequency: "Monthly",
      student: "321123 123",
      teacher: "Alexander Hamilton",
      selected: false,
    },
    {
      id: "5",
      program: "Drums Core",
      paymentFrequency: "Monthly",
      student: "321123 123",
      teacher: "Art Tatum",
      selected: false,
    },
    {
      id: "6",
      program: "xTrombone",
      paymentFrequency: "Monthly",
      student: "321123 123",
      teacher: "Daniel Clain",
      selected: false,
    },
    {
      id: "7",
      program: "xPiano Core",
      paymentFrequency: "Monthly",
      student: "321123 123",
      teacher: "Amy Macaluso",
      selected: false,
    },
    {
      id: "8",
      program: "xGuitar Contemporary",
      paymentFrequency: "Monthly",
      student: "321123 123",
      teacher: "tes123 12345",
      selected: false,
    },
    {
      id: "9",
      program: "xPiano Hybrid",
      paymentFrequency: "Monthly",
      student: "321123 123",
      teacher: "tes123 12345",
      selected: false,
    },
    {
      id: "10",
      program: "",
      paymentFrequency: "",
      student: "",
      teacher: "",
      selected: false,
    },
  ] as RecurringPaymentEnrolmentData[],
};
