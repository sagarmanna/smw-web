"use client";

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserPermissions } from '@/redux/permissionsSlice';
import { fetchLocationFlags } from '@/redux/locationFlagsSlice';

export function useLocationChange(location: string) {
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.user);
  const { flags } = useAppSelector((state) => state.locationFlags);
  const previousLocationRef = useRef<string | null>(null);

  useEffect(() => {
    // Only fetch permissions when location actually changes (not on initial load)
    const isLocationChange = previousLocationRef.current !== null && previousLocationRef.current !== location;
    
    if (userInfo?.role === 'staffmember' && location && isLocationChange) {
      // Fetch new location flags if not cached
      if (!flags[location]) {
        dispatch(fetchLocationFlags(location));
      }
      
      // Fetch new permissions for the new location
      dispatch(fetchUserPermissions(location));
    }
    
    // Update the previous location reference
    previousLocationRef.current = location;
  }, [location, userInfo?.role, dispatch, flags]);
}
