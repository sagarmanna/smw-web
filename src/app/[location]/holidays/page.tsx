"use client";

import { use } from "react";
import { HolidaysListingClient } from "./HolidaysListingClient";

interface HolidaysPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default function HolidaysPage({ params }: HolidaysPageProps) {
  const { location } = use(params);

  /**
   * Initial data fetch is handled by useHolidaysListing hook
   * No need to fetch here to avoid duplicate API calls
   */
  return <HolidaysListingClient location={location} />;
}

