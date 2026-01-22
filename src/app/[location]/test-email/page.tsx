"use client";

import { use, useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { fetchTestEmails, resetTestEmailState } from "./testEmailListing.slice";
import { TestEmailClient } from "./TestEmailClient";

interface TestEmailPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default function TestEmailPage({ params }: TestEmailPageProps) {
  const dispatch = useAppDispatch();
  const { location } = use(params);

  const prevLocationRef = useRef<string | null>(null);

  useEffect(() => {
    if (!location) return;

    // Prevent duplicate fetches for same location
    if (prevLocationRef.current === location) return;

    // If location changed, clear previous data
    if (prevLocationRef.current && prevLocationRef.current !== location) {
      dispatch(resetTestEmailState());
    }

    prevLocationRef.current = location;
    dispatch(fetchTestEmails({ location }));
  }, [location, dispatch]);

  return <TestEmailClient location={location} />;
}
