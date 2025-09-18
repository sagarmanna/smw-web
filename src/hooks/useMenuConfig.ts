"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getSideMenus, buildMenuUrl, isMenuEnabled, getMenuSource } from '@/config/menuConfig';
import { useAppSelector } from '@/redux/hooks';
import type { MenuItem } from '@/config/menuConfig';

export function useMenuConfig() {
  const params = useParams();
  const location = params.location as string;
  const { flags } = useAppSelector((state) => state.locationFlags);
  const { userInfo } = useAppSelector((state) => state.user);
  const { permissions } = useAppSelector((state) => state.permissions);
  const locationFlags = useMemo(() => flags[location] || {}, [flags, location]);

  const menuItems = useMemo(() => {
    return getSideMenus(
      location, 
      locationFlags, 
      userInfo?.role, 
      permissions?.permissions,
      permissions?.dashboardPermissions
    );
  }, [location, locationFlags, userInfo?.role, permissions?.permissions, permissions?.dashboardPermissions]);

  const isMenuAvailable = (menuId: string) => {
    return isMenuEnabled(locationFlags, menuId);
  };

  const getMenuUrl = (item: MenuItem) => {
    return buildMenuUrl(item, location);
  };

  const getMenuType = (menuId: string) => {
    return getMenuSource(locationFlags, menuId);
  };

  return {
    menuItems,
    location,
    isMenuAvailable,
    getMenuUrl,
    getMenuType,
  };
}
