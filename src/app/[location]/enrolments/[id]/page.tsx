'use client';

import { use, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchEnrolment, clearEnrolment } from './enrolment-details.slice';
import { EnrolmentDetailClient } from "./EnrolmentDetailClient";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ENROLMENT_MESSAGES } from "../utils/constants";

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
  // Wrap in ErrorBoundary to catch and handle any React errors gracefully
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-[600px] px-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-xl font-semibold text-destructive">
              {ENROLMENT_MESSAGES.ERROR_TITLE}
            </h2>
            <p className="text-muted-foreground">
              {ENROLMENT_MESSAGES.ERROR_FALLBACK}
            </p>
          </div>
        </div>
      }
      onReset={() => {
        // Clear enrolment state and refetch on reset
        dispatch(clearEnrolment());
        dispatch(fetchEnrolment({ location, enrolmentId: id }));
      }}
    >
      <EnrolmentDetailClient location={location} id={id} />
    </ErrorBoundary>
  );
}

