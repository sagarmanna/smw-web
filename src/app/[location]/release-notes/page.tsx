"use client";

import { use, useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { fetchReleaseNotes, resetReleaseNotesState } from "./releaseNotesListing.slice";
import { ReleaseNotesListingClient } from "./ReleaseNotesListingClient";

interface ReleaseNotesPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default function ReleaseNotesPage({ params }: ReleaseNotesPageProps) {
  const dispatch = useAppDispatch();
  const { location } = use(params);
  
  // Track previous location to detect changes and prevent duplicate fetches
  const prevLocationRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only fetch if we have a valid location
    if (!location) return;
    
    // Skip if we've already fetched for this exact location (prevents duplicate calls during re-renders)
    // This ensures the GET API is called ONLY ONCE per location
    if (prevLocationRef.current === location) {
      return;
    }
    
    // If location changed, clear previous data immediately
    if (prevLocationRef.current && prevLocationRef.current !== location) {
      dispatch(resetReleaseNotesState());
    }
    
    // Update the ref to track this fetch
    prevLocationRef.current = location;
    
    /**
     * Fetch all release notes ONCE on initial page load
     * 
     * This is the ONLY place where GET API is called.
     * After this, all data comes from Redux state:
     * - Add/Update/Delete operations update Redux directly after API calls
     * - No refetching needed
     * - Pagination, sorting, and filtering happen client-side on Redux data
     */
    dispatch(fetchReleaseNotes({ location }));
  }, [location, dispatch]);

  return <ReleaseNotesListingClient location={location} />;
}

