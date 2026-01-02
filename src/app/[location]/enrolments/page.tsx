'use client';

import { use, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchPrograms } from './scheduleFilters.slice';
import { EnrolmentsListingClient } from "./EnrolmentsListingClient";

interface EnrolmentsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default function EnrolmentsPage({ params }: EnrolmentsPageProps) {
  const { location } = use(params);
  const dispatch = useAppDispatch();
  
  // Check if programs are already loaded in Redux
  const programs = useAppSelector((state) => state.scheduleFilters.programs);
  const programsLoading = useAppSelector((state) => state.scheduleFilters.programsLoading);
  
  useEffect(() => {
    // Fetch programs on initial page load only if not already loaded
    // Programs are global (not location-specific), so fetch once per session
    if (programs.length === 0 && !programsLoading) {
      dispatch(fetchPrograms());
    }
  }, [dispatch, programs.length, programsLoading]);
  
  return <EnrolmentsListingClient location={location} />;
}

