"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserPermissions } from '@/redux/permissionsSlice';

export function useUserPermissions(location: string) {
  const dispatch = useAppDispatch();
  const { permissions, isLoading, error } = useAppSelector((state) => state.permissions);

  useEffect(() => {
    if (location && !permissions) {
      // Only fetch if we don't have permissions yet
      dispatch(fetchUserPermissions(location));
    }
  }, [location, dispatch, permissions]);

  return { permissions, isLoading, error };
}
