"use client";

import { use, useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { fetchHolidays } from "./holidaysListing.slice";
import { HolidaysListingClient } from "./HolidaysListingClient";

interface HolidaysPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default function HolidaysPage({ params }: HolidaysPageProps) {
  const dispatch = useAppDispatch();
  const { location } = use(params);
  
  // Track previous location to detect changes and prevent duplicate fetches
  const prevLocationRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only fetch if we have a valid location
    if (!location) return;
    
    // Skip if we've already fetched for this exact location (prevents duplicate calls during re-renders)
    // This ensures the GET API is called ONLY ONCE per location on initial load
    if (prevLocationRef.current === location) {
      return;
    }
    
    // Update the ref to track this fetch
    prevLocationRef.current = location;
    
    /**
     * Fetch holidays on initial page load
     * 
     * After initial load, sorting changes will trigger API calls via the hook.
     * Pagination changes will also trigger API calls via the hook.
     */
    dispatch(fetchHolidays({ 
      location,
      query: {
        page: 1,
        limit: 10,
      }
    }));
  }, [location, dispatch]);

  return <HolidaysListingClient location={location} />;
}

