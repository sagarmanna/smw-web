"use client";

import { usePathname } from "next/navigation";
import { useMenuConfig } from "@/hooks/useMenuConfig";
import type { MenuItem } from "@/config/menuConfig";
import { useAppSelector } from "@/redux/hooks";
import AccessDeniedCard from "@/components/AccessDeniedCard";

interface PageAccessControlProps {
  children: React.ReactNode;
}

// Helper function to recursively find a menu item by URL
const findMenuItemByUrl = (menuItems: MenuItem[], url: string): MenuItem | null => {
  for (const item of menuItems) {
    // Normalize URLs for comparison
    const itemUrl = item.url?.split('?')[0];
    const pageUrl = url.split('?')[0];

    if (itemUrl && pageUrl.endsWith(itemUrl)) {
      return item;
    }
    if (item.items) {
      const found = findMenuItemByUrl(item.items, url);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export default function PageAccessControl({ children }: PageAccessControlProps) {
  const pathname = usePathname();
  const { menuItems } = useMenuConfig(); // This gets role-filtered menu items
  const { userInfo } = useAppSelector((state) => state.user);

  // If user info is not loaded yet, don't render anything
  if (!userInfo) {
    return null;
  }

  // Find the menu item that corresponds to the current page
  const currentMenuItem = findMenuItemByUrl(menuItems, pathname);

  // If no menu item is found for the current path, deny access

  if (!currentMenuItem && !pathname.includes('/dashboard') && !pathname.includes('/menu-flags') && !pathname.includes('/customers')) {
    return <AccessDeniedCard />;
  }
  
  return <>{children}</>;
}
