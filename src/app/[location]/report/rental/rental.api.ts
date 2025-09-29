import { apiClient } from "@/lib/api/client";

/**
 * Test API connectivity
 */
export async function testApiConnection(): Promise<{
  success: boolean;
  message: string;
  details?: {
    status?: number;
    data?: unknown;
    statusText?: string;
    code?: string;
  };
}> {
  try {
    const response = await apiClient.get(`/admin/v2/training-location/report/rental`);
    
    return {
      success: true,
      message: 'API connection successful',
      details: {
        status: response.status,
        data: response.data
      }
    };
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { status?: number; statusText?: string };
      code?: string;
      message?: string;
    };
    
    return {
      success: false,
      message: `API connection failed: ${apiError.message || apiError.code || 'Unknown error'}`,
      details: {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        code: apiError.code
      }
    };
  }
}

export interface RentalRow {
  id: string;
  customer: string;
  student: string;
  startDate: string;
  returnDate: string;
  rentalTerm: string;
  equipmentReturned: "Yes" | "No";
  equipmentReturnedDate?: string;
  location?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RentalFilters {
  status?: string;
  customer?: string;
  student?: string;
  rentalTerm?: string;
  startDate?: string;
  returnDate?: string;
  equipmentReturned?: "Yes" | "No";
}

export interface RentalAPIResponse {
  success: boolean;
  data: RentalRow[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateRentalData {
  customer: string;
  student: string;
  startDate: string;
  returnDate: string;
  rentalTerm: string;
  location: string;
}

export interface UpdateRentalData {
  customer?: string;
  student?: string;
  startDate?: string;
  returnDate?: string;
  rentalTerm?: string;
  equipmentReturned?: "Yes" | "No";
  equipmentReturnedDate?: string;
}

/**
 * Fetch rentals list with optional filters
 */
export async function getRentalsList(
  location: string,
  filters?: RentalFilters
): Promise<RentalAPIResponse> {
  try {
    const params = new URLSearchParams();
    
    // Add filter parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = `/admin/v2/${location}/report/rental${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    
    // Handle different response data structures
    let rentalsData = [];
    if (Array.isArray(response.data)) {
      rentalsData = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Check for nested data structures
      if (response.data.data && response.data.data.body && Array.isArray(response.data.data.body)) {
        // Handle: { data: { body: [...] } }
        rentalsData = response.data.data.body;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Handle: { data: [...] }
        rentalsData = response.data.data;
      } else if (response.data.rentals && Array.isArray(response.data.rentals)) {
        // Handle: { rentals: [...] }
        rentalsData = response.data.rentals;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        // Handle: { items: [...] }
        rentalsData = response.data.items;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        // Handle: { results: [...] }
        rentalsData = response.data.results;
      } else if (response.data.body && Array.isArray(response.data.body)) {
        // Handle: { body: [...] }
        rentalsData = response.data.body;
      } else {
        // If it's an object but not an array, wrap it in an array
        rentalsData = [response.data];
      }
    }
    
    
    // Transform data to ensure consistent field names
    const transformedData = rentalsData.map((rental: Record<string, unknown>) => {
      // Handle different possible field name variations
      return {
        id: rental.id || rental.ID || rental.Id || '',
        customer: rental.customer || rental.Customer || rental.CUSTOMER || rental.customer_name || rental.customerName || '',
        student: rental.student || rental.Student || rental.STUDENT || rental.student_name || rental.studentName || '',
        startDate: rental.startDate || rental.StartDate || rental.START_DATE || rental.start_date || rental.startdate || '',
        returnDate: rental.returnDate || rental.ReturnDate || rental.RETURN_DATE || rental.return_date || rental.returndate || '',
        rentalTerm: rental.rentalTerm || rental.RentalTerm || rental.RENTAL_TERM || rental.rental_term || rental.rentalterm || '',
        equipmentReturned: rental.equipmentReturned || rental.EquipmentReturned || rental.EQUIPMENT_RETURNED || rental.equipment_returned || rental.equipmentreturned || rental['Equipment Returned'] || '',
        equipmentReturnedDate: rental.equipmentReturnedDate || rental.EquipmentReturnedDate || rental.EQUIPMENT_RETURNED_DATE || rental.equipment_returned_date || rental.equipmentreturneddate || rental['Equipment Returned Date'] || '',
        location: rental.location || rental.Location || rental.LOCATION || '',
        status: rental.status || rental.Status || rental.STATUS || '',
        createdAt: rental.createdAt || rental.CreatedAt || rental.CREATED_AT || rental.created_at || rental.createdat || '',
        updatedAt: rental.updatedAt || rental.UpdatedAt || rental.UPDATED_AT || rental.updated_at || rental.updatedat || ''
      };
    });
    
    
    return {
      success: true,
      data: transformedData,
      message: 'Rentals fetched successfully'
    };
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { 
        status?: number;
        statusText?: string;
        data?: { message?: string } 
      };
      request?: unknown;
      code?: string;
    };
    
    return {
      success: false,
      data: [],
      message: apiError.response?.data?.message || `${apiError.response?.status}: ${apiError.response?.statusText}` || 'Failed to fetch rentals'
    };
  }
}

/**
 * Fetch rental by ID
 */
export async function getRentalById(location: string, id: string): Promise<RentalAPIResponse> {
  try {
    const response = await apiClient.get(`/admin/v2/${location}/report/rental/${id}`);
    
    return {
      success: true,
      data: response.data ? [response.data] : [],
      message: 'Rental fetched successfully'
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rental';
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: [],
      message: apiError.response?.data?.message || errorMessage
    };
  }
}

/**
 * Create new rental
 */
export async function createRental(location: string, rentalData: CreateRentalData): Promise<RentalAPIResponse> {
  try {
    const response = await apiClient.post(`/admin/v2/${location}/report/rental`, rentalData);
    
    return {
      success: true,
      data: response.data ? [response.data] : [],
      message: 'Rental created successfully'
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create rental';
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: [],
      message: apiError.response?.data?.message || errorMessage
    };
  }
}

/**
 * Update existing rental
 */
export async function updateRental(location: string, id: string, rentalData: UpdateRentalData): Promise<RentalAPIResponse> {
  try {
    const response = await apiClient.put(`/admin/v2/${location}/report/rental/${id}`, rentalData);
    
    return {
      success: true,
      data: response.data ? [response.data] : [],
      message: 'Rental updated successfully'
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update rental';
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: [],
      message: apiError.response?.data?.message || errorMessage
    };
  }
}

/**
 * Delete rental
 */
export async function deleteRental(location: string, id: string): Promise<RentalAPIResponse> {
  try {
    await apiClient.delete(`/admin/v2/${location}/report/rental/${id}`);
    
    return {
      success: true,
      data: [],
      message: 'Rental deleted successfully'
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete rental';
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: [],
      message: apiError.response?.data?.message || errorMessage
    };
  }
}

/**
 * Get rental statistics
 */
export async function getRentalStats(location: string): Promise<{
  success: boolean;
  data?: {
    total: number;
    active: number;
    overdue: number;
    returned: number;
  };
  message?: string;
}> {
  try {
    
    // Use axios with validateStatus to not throw on 404
    const response = await apiClient.get(`/admin/v2/${location}/report/rental/stats`, {
      validateStatus: function (status) {
        // Don't throw for 404, let us handle it
        return status < 500; // Only throw for 5xx errors
      }
    });
    
    // Check if we got a 404
    if (response.status === 404) {
      // Try to calculate stats from the main rental data
      try {
        const rentalsResponse = await getRentalsList(location);
        if (rentalsResponse.success && rentalsResponse.data) {
          const rentals = rentalsResponse.data;
          
          // Calculate active rentals - improved logic
          const activeRentals = rentals.filter(rental => {
            const isNotReturned = rental.equipmentReturned !== 'Yes';
            const returnDate = new Date(rental.returnDate);
            const today = new Date();
            const isNotOverdue = returnDate >= today;
            
            return isNotReturned && isNotOverdue;
          });
          
          const stats = {
            total: rentals.length,
            active: activeRentals.length,
            overdue: rentals.filter(rental => {
              const isNotReturned = rental.equipmentReturned !== 'Yes';
              const returnDate = new Date(rental.returnDate);
              const today = new Date();
              const isOverdue = returnDate < today;
              return isNotReturned && isOverdue;
            }).length,
            returned: rentals.filter(rental => 
              rental.equipmentReturned === 'Yes'
            ).length
          };
          
          
          return {
            success: true,
            data: stats,
            message: 'Stats calculated from rental data (stats endpoint not available)'
          };
        }
        } catch {
          // Error calculating stats from rental data
        }
      
      // Fallback to empty stats if calculation fails
      return {
        success: true,
        data: {
          total: 0,
          active: 0,
          overdue: 0,
          returned: 0
        },
        message: 'Stats endpoint not available - using default values'
      };
    }
    
    
    // Handle different response data structures for stats
    let statsData = response.data;
    if (response.data && typeof response.data === 'object') {
      // If stats are nested in a property, extract them
      if (response.data.data && response.data.data.summary) {
        // Handle: { data: { summary: {...} } }
        statsData = response.data.data.summary;
      } else if (response.data.data && response.data.data.stats) {
        // Handle: { data: { stats: {...} } }
        statsData = response.data.data.stats;
      } else if (response.data.stats) {
        // Handle: { stats: {...} }
        statsData = response.data.stats;
      } else if (response.data.data) {
        // Handle: { data: {...} }
        statsData = response.data.data;
      } else if (response.data.summary) {
        // Handle: { summary: {...} }
        statsData = response.data.summary;
      }
    }
    
    
    return {
      success: true,
      data: statsData,
      message: 'Rental statistics fetched successfully'
    };
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { 
        status?: number;
        statusText?: string;
        data?: { message?: string } 
      };
      code?: string;
    };
    
    // For any other errors (5xx, network issues, etc.), return error
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rental statistics';
    return {
      success: false,
      message: apiError.response?.data?.message || errorMessage
    };
  }
}
