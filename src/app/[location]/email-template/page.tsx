"use client";

import { use, useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { fetchEmailTemplates, resetEmailTemplateState } from "./emailTemplateListing.slice";
import { EmailTemplateListingClient } from "./EmailTemplateListingClient";

interface EmailTemplatePageProps {
  params: Promise<{
    location: string;
  }>;
}

export default function EmailTemplatePage({ params }: EmailTemplatePageProps) {
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
    
    // If location changed, clear previous data immediately
    if (prevLocationRef.current && prevLocationRef.current !== location) {
      dispatch(resetEmailTemplateState());
    }
    
    // Update the ref to track this fetch
    prevLocationRef.current = location;
    
    /**
     * Fetch email templates on initial page load
     * 
     * After initial load, pagination changes will trigger API calls via the hook.
     */
    dispatch(fetchEmailTemplates({ 
      location,
      page: 1,
      limit: 20
    }));
  }, [location, dispatch]);

  return <EmailTemplateListingClient location={location} />;
}
