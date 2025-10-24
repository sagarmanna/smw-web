"use client";

import { usePathname, useParams } from "next/navigation";
import { useMenuConfig } from "@/hooks/useMenuConfig";
import type { MenuItem } from "@/config/menuConfig";
import { useAppSelector } from "@/redux/hooks";
import AccessDeniedCard from "@/components/AccessDeniedCard";

interface PageAccessControlProps {
  children: React.ReactNode;
}

// Constants for better maintainability
const ALLOWED_PATHS = [
  '/dashboard',
  '/menu-flags', 
  '/customers',
  '/students',
  '/[location]/report/account-receivable/[id]',
  '/teachers',
] as const;

// Helper function to normalize pathname by replacing dynamic segments
const normalizePathname = (pathname: string, params: Record<string, string | string[] | undefined>): string => {
  let normalizedPath = pathname;
  
  // Replace actual parameter values with their parameter names in brackets
  Object.entries(params).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      // Replace the actual value with the parameter name in brackets
      normalizedPath = normalizedPath.replace(`/${value}`, `/[${key}]`);
    }
  });
  
  return normalizedPath;
};

// Helper function to check if path is in allowed list
const isPathAllowed = (pathname: string, params: Record<string, string | string[] | undefined>): boolean => {
  // Normalize the pathname to match route patterns
  const normalizedPath = normalizePathname(pathname, params);

  return ALLOWED_PATHS.some(allowedPath => {
    // Handle dynamic routes (containing [id], [slug], etc.)
    if (allowedPath.includes('[') && allowedPath.includes(']')) {
      return normalizedPath === allowedPath;
    }
    // Handle static paths
    return pathname.includes(allowedPath);
  });
};

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

// Helper function to determine if user has access
const hasAccess = (pathname: string, menuItems: MenuItem[], params: Record<string, string | string[] | undefined>): boolean => {
  // Check if path is in the allowed list (bypasses menu-based access control)
  if (isPathAllowed(pathname, params)) {
    return true;
  }

  // Check if path has a corresponding menu item
  const currentMenuItem = findMenuItemByUrl(menuItems, pathname);
  return currentMenuItem !== null;
};

export default function PageAccessControl({ children }: PageAccessControlProps) {
  const pathname = usePathname();
  const params = useParams();
  const { menuItems } = useMenuConfig(); // This gets role-filtered menu items
  const { userInfo } = useAppSelector((state) => state.user);

  // If user info is not loaded yet, don't render anything
  if (!userInfo) {
    return null;
  }

  // Check if user has access to the current page
  if (!hasAccess(pathname, menuItems, params)) {
    return <AccessDeniedCard />;
  }

  return <>{children}</>;
}
