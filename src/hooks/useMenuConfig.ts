"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getSideMenus, buildMenuUrl, isMenuEnabled, getMenuSource } from '@/config/menuConfig';
import { useLocationFlags } from '@/hooks/useLocationFlags';
import { useUserInfo } from '@/hooks/useUserInfo';
import type { MenuItem } from '@/config/menuConfig';

export function useMenuConfig() {
  const params = useParams();
  const location = params.location as string;
  const { flags: locationFlags } = useLocationFlags(location);
  const { userInfo } = useUserInfo(location);

  const menuItems = useMemo(() => {
    return getSideMenus(location, locationFlags, userInfo?.role);
  }, [location, locationFlags, userInfo?.role]);

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
