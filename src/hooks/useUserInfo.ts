"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserInfo } from '@/redux/userSlice';

export function useUserInfo(location: string) {
  const dispatch = useAppDispatch();
  const { userInfo, isLoading, error } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (location && !userInfo) {
      // Only fetch if we don't have user info yet
      dispatch(fetchUserInfo(location));
    }
  }, [location, dispatch, userInfo]);

  return { userInfo, isLoading, error };
}
