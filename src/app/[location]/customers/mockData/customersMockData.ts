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
  proformaInvoiceDetailData: [] as ProformaInvoiceDetailData[],

 

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
