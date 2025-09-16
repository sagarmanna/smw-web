"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchLocations, setCurrentLocation } from '@/redux/locationsSlice';

export function useLocations() {
  const dispatch = useAppDispatch();
  const { locations, currentLocation, isLoading, error } = useAppSelector((state) => state.locations);

  useEffect(() => {
    if (locations.length === 0) {
      // Only fetch if we don't have locations yet
      dispatch(fetchLocations());
    }
  }, [dispatch, locations.length]);

  const changeLocation = (locationSlug: string) => {
    dispatch(setCurrentLocation(locationSlug));
  };

  return { 
    locations, 
    currentLocation, 
    isLoading, 
    error, 
    changeLocation 
  };
}
