'use client';

import { use, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchAdministrator, clearAdministrator } from './administrators-details.slice';
import { AdministratorDetailClient } from "./AdministratorDetailClient";

interface AdministratorDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function AdministratorDetailPage({ params }: AdministratorDetailPageProps) {
  const { location, id } = use(params);
  const dispatch = useAppDispatch();
  const administratorId = Number(id);
  
  // Track previous administratorId/location to detect changes and prevent duplicate fetches
  const prevKeyRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only fetch if we have valid IDs
    if (!administratorId || !location) return;
    
    // Create a unique key for this administrator/location combination
    const currentKey = `${location}-${administratorId}`;
    
    // Skip if we've already fetched for this exact combination (prevents duplicate calls during re-renders)
    if (prevKeyRef.current === currentKey) {
      return;
    }
    
    // If administratorId changed, clear previous administrator data immediately
    const prevKey = prevKeyRef.current;
    if (prevKey && prevKey !== currentKey) {
      const prevAdministratorId = prevKey.split('-')[1];
      if (prevAdministratorId && Number(prevAdministratorId) !== administratorId) {
        dispatch(clearAdministrator());
      }
    }
    
    // Update the ref to track this fetch
    prevKeyRef.current = currentKey;
    
    // Always fetch when administratorId/location changes - the thunk will handle caching
    // This ensures we get fresh data when switching between administrators
    dispatch(fetchAdministrator({ location, administratorId }));
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, administratorId]); // dispatch is stable from Redux Toolkit, no need to include in deps

  // Render the client component that displays the details
  return <AdministratorDetailClient location={location} id={id} />;
}

