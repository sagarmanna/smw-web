import { getMockInvoiceDetail, InvoiceDetail } from "../mockData/invoiceDetailMockData";
import { API_DELAY } from "../utils/constants";

// ---------------------------------------------
// Invoice Details API Response Types
// ---------------------------------------------

export interface InvoiceDetailsApiResponse {
  success: boolean;
  data: {
    body: InvoiceDetail;
  };
  message?: string;
}

// ---------------------------------------------
// Update Invoice Details API Types
// ---------------------------------------------

export interface UpdateInvoiceDetailsRequest {
  date?: string;
  status?: string;
  customer?: {
    name: string;
    phone: string;
    email: string;
    customerId?: number;
  };
  message?: string;
}

export interface UpdateInvoiceDetailsResponse {
  success: boolean;
  data: InvoiceDetail;
  message?: string;
}

// ---------------------------------------------
// Mock API Functions (using mock data for now)
// ---------------------------------------------

/**
 * Fetches detailed invoice information (mock implementation)
 * 
 * @param location - The location identifier
 * @param invoiceId - The invoice ID
 * @returns Promise resolving to the invoice details response
 */
export async function getInvoiceDetails(
  location: string,
  invoiceId: number
): Promise<InvoiceDetailsApiResponse | null> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, API_DELAY.SHORT));
    
    const detail = getMockInvoiceDetail(invoiceId);
    
    if (!detail) {
      return {
        success: false,
        data: {
          body: {} as InvoiceDetail,
        },
        message: "Invoice not found",
      };
    }

    return {
      success: true,
      data: {
        body: detail,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching invoice details:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: {} as InvoiceDetail,
      },
      message: apiError.response?.data?.message || "Failed to fetch invoice details",
    };
  }
}

/**
 * Updates invoice information (mock implementation)
 * 
 * @param location - The location identifier
 * @param invoiceId - The invoice ID
 * @param data - The invoice data to update
 * @returns Promise resolving to the update response
 */
export async function updateInvoiceDetails(
  location: string,
  invoiceId: number,
  data: UpdateInvoiceDetailsRequest
): Promise<UpdateInvoiceDetailsResponse | null> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, API_DELAY.SHORT));
    
    const currentDetail = getMockInvoiceDetail(invoiceId);
    
    if (!currentDetail) {
      return {
        success: false,
        data: {} as InvoiceDetail,
        message: "Invoice not found",
      };
    }

    // Merge updates with current data
    const updatedDetail: InvoiceDetail = {
      ...currentDetail,
      ...(data.date && { date: data.date }),
      ...(data.status && { status: data.status as InvoiceDetail["status"] }),
      ...(data.customer && { customer: { ...currentDetail.customer, ...data.customer } }),
      ...(data.message !== undefined && { message: data.message }),
    };

    return {
      success: true,
      data: updatedDetail,
    };
  } catch (error: unknown) {
    console.error("Error updating invoice details:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {} as InvoiceDetail,
      message: apiError.response?.data?.message || "Failed to update invoice details",
    };
  }
}

