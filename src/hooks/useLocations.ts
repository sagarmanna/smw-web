"use client";

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCurrentLocation, selectFilteredLocations } from '@/redux/locationsSlice';

export function useLocations() {
  const dispatch = useAppDispatch();
  const { currentLocation, isLoading, error } = useAppSelector((state) => state.locations);
  const locations = useAppSelector(selectFilteredLocations);

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
