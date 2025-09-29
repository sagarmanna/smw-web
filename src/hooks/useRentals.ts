import { useState, useEffect, useCallback } from 'react';
import {
  getRentalsList,
  createRental,
  updateRental,
  deleteRental,
  getRentalStats,
  RentalRow,
  RentalFilters,
  CreateRentalData,
  UpdateRentalData
} from '@/app/[location]/report/rental/rental.api';

export interface RentalStats {
  total: number;
  active: number;
  overdue: number;
  returned: number;
}

export interface UseRentalsReturn {
  // Data
  rentals: RentalRow[];
  stats: RentalStats | null;
  
  // Loading states
  isLoading: boolean;
  isStatsLoading: boolean;
  
  // Error states
  error: string | null;
  statsError: string | null;
  
  // Actions
  refetch: () => void;
  refetchStats: () => void;
  createRental: (data: CreateRentalData) => Promise<boolean>;
  updateRental: (id: string, data: UpdateRentalData) => Promise<boolean>;
  deleteRental: (id: string) => Promise<boolean>;
  setFilters: (filters: RentalFilters) => void;
  clearErrors: () => void;
}

export function useRentals(
  location: string,
  initialFilters?: RentalFilters
): UseRentalsReturn {
  // Data state
  const [rentals, setRentals] = useState<RentalRow[]>([]);
  const [stats, setStats] = useState<RentalStats | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  // Filter state
  const [currentFilters, setCurrentFilters] = useState<RentalFilters>(initialFilters || {});

  // Fetch rentals
  const fetchRentals = useCallback(async (filters: RentalFilters = {}) => {
    console.log('=== fetchRentals hook called ===');
    console.log('Location:', location, 'Filters:', filters);
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Calling getRentalsList API...');
      const response = await getRentalsList(location, filters);
      console.log('getRentalsList response:', response);
      
      if (response.success) {
        console.log('Setting rentals data:', response.data.length, 'records');
        setRentals(response.data);
      } else {
        console.error('API returned error:', response.message);
        setError(response.message || 'Failed to fetch rentals');
        setRentals([]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching rentals';
      setError(errorMessage);
      setRentals([]);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    console.log('=== fetchStats hook called ===');
    console.log('Location:', location);
    
    try {
      setIsStatsLoading(true);
      setStatsError(null);
      
      console.log('Calling getRentalStats API...');
      const response = await getRentalStats(location);
      console.log('getRentalStats response:', response);
      
      if (response.success && response.data) {
        console.log('Setting stats data:', response.data);
        setStats(response.data);
        // Clear any previous stats error since we got data
        setStatsError(null);
      } else {
        console.error('Stats API returned error:', response.message);
        setStatsError(response.message || 'Failed to fetch rental statistics');
        // Set default stats to prevent UI issues
        setStats({
          total: 0,
          active: 0,
          overdue: 0,
          returned: 0
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching statistics';
      console.error('Stats fetch error:', errorMessage);
      setStatsError(errorMessage);
      // Set default stats to prevent UI issues
      setStats({
        total: 0,
        active: 0,
        overdue: 0,
        returned: 0
      });
    } finally {
      setIsStatsLoading(false);
    }
  }, [location]);

  // Create rental
  const createRentalHandler = useCallback(async (data: CreateRentalData): Promise<boolean> => {
    try {
      const response = await createRental(location, data);
      if (response.success) {
        // Refresh the rentals list
        await fetchRentals(currentFilters);
        return true;
      } else {
        setError(response.message || 'Failed to create rental');
        return false;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating rental';
      setError(errorMessage);
      return false;
    }
  }, [location, fetchRentals, currentFilters]);

  // Update rental
  const updateRentalHandler = useCallback(async (id: string, data: UpdateRentalData): Promise<boolean> => {
    try {
      const response = await updateRental(location, id, data);
      if (response.success) {
        // Refresh the rentals list
        await fetchRentals(currentFilters);
        return true;
      } else {
        setError(response.message || 'Failed to update rental');
        return false;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating rental';
      setError(errorMessage);
      return false;
    }
  }, [location, fetchRentals, currentFilters]);

  // Delete rental
  const deleteRentalHandler = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await deleteRental(location, id);
      if (response.success) {
        // Refresh the rentals list
        await fetchRentals(currentFilters);
        return true;
      } else {
        setError(response.message || 'Failed to delete rental');
        return false;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting rental';
      setError(errorMessage);
      return false;
    }
  }, [location, fetchRentals, currentFilters]);

  // Set filters and refetch
  const setFilters = useCallback((filters: RentalFilters) => {
    setCurrentFilters(filters);
    fetchRentals(filters);
  }, [fetchRentals]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setError(null);
    setStatsError(null);
  }, []);

  // Refetch functions
  const refetch = useCallback(() => {
    fetchRentals(currentFilters);
    fetchStats();
  }, [fetchRentals, fetchStats, currentFilters]);

  const refetchStats = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  // Initial data fetch
  useEffect(() => {
    fetchRentals(currentFilters);
    fetchStats();
  }, [fetchRentals, fetchStats, currentFilters]);

  return {
    // Data
    rentals,
    stats,
    
    // Loading states
    isLoading,
    isStatsLoading,
    
    // Error states
    error,
    statsError,
    
    // Actions
    refetch,
    refetchStats,
    createRental: createRentalHandler,
    updateRental: updateRentalHandler,
    deleteRental: deleteRentalHandler,
    setFilters,
    clearErrors,
  };
}

