'use client';

import { use, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchEnrolment, clearEnrolment } from './enrolment-details.slice';
import { EnrolmentDetailClient } from "./EnrolmentDetailClient";

interface EnrolmentDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function EnrolmentDetailPage({ params }: EnrolmentDetailPageProps) {
  const { location, id } = use(params);
  const dispatch = useAppDispatch();
  const enrolmentId = id;
  
  // Track previous enrolmentId/location to detect changes and prevent duplicate fetches
  const prevKeyRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only fetch if we have valid IDs
    if (!enrolmentId || !location) return;
    
    // Create a unique key for this enrolment/location combination
    const currentKey = `${location}-${enrolmentId}`;
    
    // Skip if we've already fetched for this exact combination (prevents duplicate calls during re-renders)
    if (prevKeyRef.current === currentKey) {
      return;
    }
    
    // If enrolmentId changed, clear previous enrolment data immediately
    const prevKey = prevKeyRef.current;
    if (prevKey && prevKey !== currentKey) {
      const prevEnrolmentId = prevKey.split('-')[1];
      if (prevEnrolmentId && prevEnrolmentId !== enrolmentId) {
        dispatch(clearEnrolment());
      }
    }
    
    // Update the ref to track this fetch
    prevKeyRef.current = currentKey;
    
    // Fetch enrolment details on initial page load
    dispatch(fetchEnrolment({ location, enrolmentId }));
  }, [location, enrolmentId, dispatch]);

  // Render the client component that displays the details
  return <EnrolmentDetailClient location={location} id={id} />;
}

