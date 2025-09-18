"use client";

import { useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserInfo } from '@/redux/userSlice';
import { fetchUserPermissions } from '@/redux/permissionsSlice';
import { fetchLocationFlags } from '@/redux/locationFlagsSlice';
import { fetchLocations } from '@/redux/locationsSlice';

interface GlobalDataProviderProps {
  children: ReactNode;
  location: string;
}

export function GlobalDataProvider({ children, location }: GlobalDataProviderProps) {
  const dispatch = useAppDispatch();
  const { userInfo, isLoading: userLoading } = useAppSelector((state) => state.user);
  const { permissions, isLoading: permissionsLoading } = useAppSelector((state) => state.permissions);
  const { flags, isLoading: flagsLoading } = useAppSelector((state) => state.locationFlags);
  const { locations, isLoading: locationsLoading } = useAppSelector((state) => state.locations);

  useEffect(() => {
    const initializeGlobalData = async () => {
      // 1. Fetch user info (always needed)
      if (!userInfo && !userLoading) {
        dispatch(fetchUserInfo(location));
      }

      // 2. Fetch locations (always needed)
      if (!locations.length && !locationsLoading) {
        dispatch(fetchLocations());
      }

      // 3. Fetch location flags (always needed)
      if (!flags[location] && !flagsLoading) {
        dispatch(fetchLocationFlags(location));
      }
    };

    initializeGlobalData();
  }, [location, dispatch, userInfo, userLoading, locations, locationsLoading, flags, flagsLoading]);

  // Fetch permissions only for staff members after user info is loaded
  useEffect(() => {
    if (userInfo?.role === 'staffmember' && !permissions && !permissionsLoading) {
      console.log('GlobalDataProvider: Fetching permissions for staff member');
      dispatch(fetchUserPermissions(location));
    }
  }, [userInfo?.role, permissions, permissionsLoading, location, dispatch]);

  return <>{children}</>;
}
