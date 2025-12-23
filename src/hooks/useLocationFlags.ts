"use client";

import { useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAllLocationFlags, fetchLocationFlags, updateLocationFlags } from '@/redux/locationFlagsSlice';

export function useLocationFlags(location: string) {
  const dispatch = useAppDispatch();
  const { flags, isLoading, error, lastFetched } = useAppSelector((state) => state.locationFlags);

  const locationFlags = useMemo(() => flags[location] || {}, [flags, location]);
  const lastFetchedTime = lastFetched[location] || 0;

  useEffect(() => {
    const FIVE_MINUTES = 5 * 60 * 1000;
    const shouldFetch = !locationFlags || Object.keys(locationFlags).length === 0 || 
                       (Date.now() - lastFetchedTime > FIVE_MINUTES);
    
    if (location && shouldFetch) {
      // Check if we have flags for this specific location
      if (!flags[location]) {
        // Check if we have any flags loaded at all
        const hasAnyFlags = Object.keys(flags).length > 0;
        
        if (!hasAnyFlags) {
          // If no flags are loaded at all, fetch all location flags at once
          dispatch(fetchAllLocationFlags());
        } else {
          // If some flags are loaded but not for this location, fetch just this location
          dispatch(fetchLocationFlags(location));
        }
      }
    }
  }, [location, dispatch, lastFetchedTime, locationFlags, flags]);

  const updateFlags = (newFlags: { [feature: string]: 'modern' | 'legacy' | 'disabled' }) => {
    dispatch(updateLocationFlags({ location, flags: newFlags }));
  };

  const verifyFlagsPassword = async (password: string): Promise<boolean> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/v2/locations/flags/verify-password`,
      { password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data?.success === true;
  };

  const isFeatureEnabled = (feature: string): boolean => {
    const featureFlag = locationFlags[feature];
    return featureFlag !== 'disabled';
  };

  const getFeatureSource = (feature: string): 'modern' | 'legacy' => {
    const featureFlag = locationFlags[feature];
    return featureFlag === 'modern' ? 'modern' : 'legacy';
  };

  return {
    flags: locationFlags,
    isLoading,
    error,
    updateFlags,
    verifyFlagsPassword,
    isFeatureEnabled,
    getFeatureSource,
  };
}
