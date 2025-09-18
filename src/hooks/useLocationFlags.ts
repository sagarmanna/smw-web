"use client";

import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchLocationFlags, updateLocationFlags } from '@/redux/locationFlagsSlice';

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
      dispatch(fetchLocationFlags(location));
    }
  }, [location, dispatch, lastFetchedTime, locationFlags]);

  const updateFlags = (newFlags: { [feature: string]: 'modern' | 'legacy' | 'disabled' }) => {
    dispatch(updateLocationFlags({ location, flags: newFlags }));
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
    isFeatureEnabled,
    getFeatureSource,
  };
}
