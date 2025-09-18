"use client";

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCurrentLocation } from '@/redux/locationsSlice';

export function useLocations() {
  const dispatch = useAppDispatch();
  const { locations, currentLocation, isLoading, error } = useAppSelector((state) => state.locations);

  // No longer fetch locations here - handled by GlobalDataProvider
  // useEffect(() => {
  //   if (locations.length === 0) {
  //     dispatch(fetchLocations());
  //   }
  // }, [dispatch, locations.length]);

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
