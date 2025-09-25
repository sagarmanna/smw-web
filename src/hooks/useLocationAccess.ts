"use client";

import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useLocationAccess(currentLocationSlug: string) {
  const { userInfo } = useAppSelector((state) => state.user);
  const { locations } = useAppSelector((state) => state.locations);
  const router = useRouter();

  useEffect(() => {
    // If no user info or user is admin, allow access to all locations
    if (!userInfo || userInfo.role === 'administrator') {
      return;
    }

    // If user has userLocations, check if current location is allowed
    if (userInfo.userLocations && userInfo.userLocations.length > 0) {
      // Find the current location by slug
      const currentLocation = locations.find(loc => loc.slug === currentLocationSlug);
      
      if (currentLocation && !userInfo.userLocations.includes(currentLocation.id)) {
        // User doesn't have access to this location, redirect to first allowed location
        const firstAllowedLocation = locations.find(loc => 
          userInfo.userLocations!.includes(loc.id)
        );
        
        if (firstAllowedLocation) {
          // Get current pathname and replace the location slug
          const currentPath = window.location.pathname;
          const newPath = currentPath.replace(`/${currentLocationSlug}`, `/${firstAllowedLocation.slug}`);
          router.push(newPath);
        }
      }
    }
  }, [userInfo, locations, currentLocationSlug, router]);

  // Helper function to check if user has access to a specific location
  const hasLocationAccess = (locationSlug: string): boolean => {
    if (!userInfo || userInfo.role === 'administrator') {
      return true;
    }

    if (userInfo.userLocations && userInfo.userLocations.length > 0) {
      const location = locations.find(loc => loc.slug === locationSlug);
      return location ? userInfo.userLocations.includes(location.id) : false;
    }

    return true; // Fallback: allow access if no restrictions
  };

  return { hasLocationAccess };
}
