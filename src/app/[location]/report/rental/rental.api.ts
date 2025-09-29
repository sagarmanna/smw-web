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
    console.log('Testing API connection...');
    console.log('Base URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('API Client config:', {
      baseURL: apiClient.defaults.baseURL,
      timeout: apiClient.defaults.timeout,
      headers: apiClient.defaults.headers
    });
    
    // Test with the actual rental endpoint to verify connectivity
    console.log('Testing API connection with rental endpoint...');
    const response = await apiClient.get(`/admin/v2/training-location/report/rental`);
    console.log('Health check response:', response);
    
    return {
      success: true,
      message: 'API connection successful',
      details: {
        status: response.status,
        data: response.data
      }
    };
  } catch (error: unknown) {
    console.error('API connection test failed:', error);
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
  console.log('=== getRentalsList called ===');
  console.log('Location:', location);
  console.log('Filters:', filters);
  
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
    
    console.log('Rental API Debug:', {
      location,
      url,
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      fullURL: `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      filters: filters || 'none'
    });
    
    console.log('Making API call to:', `${process.env.NEXT_PUBLIC_API_URL}${url}`);
    const response = await apiClient.get(url);
    
    console.log('Rental API Response:', {
      status: response.status,
      dataLength: response.data?.length || 0,
      data: response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data)
    });
    
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
    
    console.log('Processed rentals data:', {
      originalData: response.data,
      processedData: rentalsData,
      length: rentalsData.length
    });
    
    // Debug: Log field names and values for the first item
    if (rentalsData.length > 0) {
      console.log('=== FIELD MAPPING DEBUG ===');
      console.log('First rental object keys:', Object.keys(rentalsData[0]));
      console.log('Customer field value:', rentalsData[0].customer);
      console.log('Student field value:', rentalsData[0].student);
      console.log('EquipmentReturned field value:', rentalsData[0].equipmentReturned);
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
    
    console.log('=== TRANSFORMED DATA DEBUG ===');
    console.log('Transformed data length:', transformedData.length);
    if (transformedData.length > 0) {
      console.log('Transformed customer value:', transformedData[0].customer);
      console.log('Transformed student value:', transformedData[0].student);
      console.log('Transformed equipmentReturned value:', transformedData[0].equipmentReturned);
    }
    
    return {
      success: true,
      data: transformedData,
      message: 'Rentals fetched successfully'
    };
  } catch (error: unknown) {
    console.error('Error fetching rentals:', error);
    const apiError = error as { 
      response?: { 
        status?: number;
        statusText?: string;
        data?: { message?: string } 
      };
      request?: unknown;
      code?: string;
    };
    
    // Return error for any API failure
    console.error('API Error Details:', {
      status: apiError.response?.status,
      statusText: apiError.response?.statusText,
      message: apiError.response?.data?.message,
      url: `/admin/v2/${location}/report/rental`,
      code: apiError.code,
      request: apiError.request
    });
    
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
  console.log('=== getRentalById called ===');
  console.log('Location:', location, 'ID:', id);
  
  try {
    console.log('Making API call to:', `/admin/v2/${location}/report/rental/${id}`);
    const response = await apiClient.get(`/admin/v2/${location}/report/rental/${id}`);
    console.log('Get rental by ID response:', response);
    
    return {
      success: true,
      data: response.data ? [response.data] : [],
      message: 'Rental fetched successfully'
    };
  } catch (error: unknown) {
    console.error('Error fetching rental:', error);
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
  console.log('=== createRental called ===');
  console.log('Location:', location, 'Data:', rentalData);
  
  try {
    console.log('Making POST API call to:', `/admin/v2/${location}/report/rental`);
    const response = await apiClient.post(`/admin/v2/${location}/report/rental`, rentalData);
    console.log('Create rental response:', response);
    
    return {
      success: true,
      data: response.data ? [response.data] : [],
      message: 'Rental created successfully'
    };
  } catch (error: unknown) {
    console.error('Error creating rental:', error);
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
  console.log('=== updateRental called ===');
  console.log('Location:', location, 'ID:', id, 'Data:', rentalData);
  
  try {
    console.log('Making PUT API call to:', `/admin/v2/${location}/report/rental/${id}`);
    const response = await apiClient.put(`/admin/v2/${location}/report/rental/${id}`, rentalData);
    console.log('Update rental response:', response);
    
    return {
      success: true,
      data: response.data ? [response.data] : [],
      message: 'Rental updated successfully'
    };
  } catch (error: unknown) {
    console.error('Error updating rental:', error);
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
  console.log('=== deleteRental called ===');
  console.log('Location:', location, 'ID:', id);
  
  try {
    console.log('Making DELETE API call to:', `/admin/v2/${location}/report/rental/${id}`);
    await apiClient.delete(`/admin/v2/${location}/report/rental/${id}`);
    console.log('Delete rental successful');
    
    return {
      success: true,
      data: [],
      message: 'Rental deleted successfully'
    };
  } catch (error: unknown) {
    console.error('Error deleting rental:', error);
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
  console.log('=== getRentalStats called ===');
  console.log('Location:', location);
  
  try {
    console.log('Making stats API call to:', `/admin/v2/${location}/report/rental/stats`);
    
    // Use axios with validateStatus to not throw on 404
    const response = await apiClient.get(`/admin/v2/${location}/report/rental/stats`, {
      validateStatus: function (status) {
        // Don't throw for 404, let us handle it
        return status < 500; // Only throw for 5xx errors
      }
    });
    
    // Check if we got a 404
    if (response.status === 404) {
      console.log('Stats endpoint not found (404), calculating stats from rental data');
      
      // Try to calculate stats from the main rental data
      try {
        const rentalsResponse = await getRentalsList(location);
        if (rentalsResponse.success && rentalsResponse.data) {
          const rentals = rentalsResponse.data;
          
          // Debug: Log rental data for stats calculation
          console.log('=== STATS CALCULATION DEBUG ===');
          console.log('Total rentals for stats:', rentals.length);
          if (rentals.length > 0) {
            console.log('First rental for stats:', rentals[0]);
            console.log('EquipmentReturned values:', rentals.map(r => r.equipmentReturned));
            console.log('ReturnDate values:', rentals.map(r => r.returnDate));
            console.log('Status values:', rentals.map(r => r.status));
          }
          
          // Calculate active rentals - improved logic
          const activeRentals = rentals.filter(rental => {
            const isNotReturned = rental.equipmentReturned !== 'Yes';
            const returnDate = new Date(rental.returnDate);
            const today = new Date();
            const isNotOverdue = returnDate >= today;
            
            console.log(`Rental ${rental.id || 'unknown'}:`, {
              equipmentReturned: rental.equipmentReturned,
              isNotReturned,
              returnDate: rental.returnDate,
              isNotOverdue,
              isActive: isNotReturned && isNotOverdue
            });
            
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
          
          console.log('Calculated stats from rental data:', stats);
          
          return {
            success: true,
            data: stats,
            message: 'Stats calculated from rental data (stats endpoint not available)'
          };
        }
      } catch (calcError) {
        console.error('Error calculating stats from rental data:', calcError);
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
    
    console.log('Stats API Response:', {
      status: response.status,
      data: response.data,
      dataType: typeof response.data,
      isObject: typeof response.data === 'object'
    });
    
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
    
    console.log('Processed stats data:', {
      originalData: response.data,
      processedData: statsData
    });
    
    return {
      success: true,
      data: statsData,
      message: 'Rental statistics fetched successfully'
    };
  } catch (error: unknown) {
    console.error('Error fetching rental stats:', error);
    const apiError = error as { 
      response?: { 
        status?: number;
        statusText?: string;
        data?: { message?: string } 
      };
      code?: string;
    };
    
    console.error('Stats API Error Details:', {
      status: apiError.response?.status,
      statusText: apiError.response?.statusText,
      message: apiError.response?.data?.message,
      url: `/admin/v2/${location}/report/rental/stats`,
      code: apiError.code
    });
    
    // For any other errors (5xx, network issues, etc.), return error
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rental statistics';
    return {
      success: false,
      message: apiError.response?.data?.message || errorMessage
    };
  }
}
