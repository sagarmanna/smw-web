'use client';

import { use, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchOwner, clearOwner } from './owners-details.slice';
import { clearOwnerTabs } from './ownersTabs.slice';
import { OwnerDetailClient } from "./OwnerDetailClient";

interface OwnerDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function OwnerDetailPage({ params }: OwnerDetailPageProps) {
  const { location, id } = use(params);
  const dispatch = useAppDispatch();
  const ownerId = Number(id);
  
  // Track previous ownerId/location to detect changes and prevent duplicate fetches
  const prevKeyRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only fetch if we have valid IDs
    if (!ownerId || !location) return;
    
    // Create a unique key for this owner/location combination
    const currentKey = `${location}-${ownerId}`;
    
    // Skip if we've already fetched for this exact combination (prevents duplicate calls during re-renders)
    if (prevKeyRef.current === currentKey) {
      return;
    }
    
    // If ownerId changed, clear previous owner data immediately
    const prevKey = prevKeyRef.current;
    if (prevKey && prevKey !== currentKey) {
      const prevOwnerId = prevKey.split('-')[1];
      if (prevOwnerId && Number(prevOwnerId) !== ownerId) {
        dispatch(clearOwner());
        dispatch(clearOwnerTabs());
      }
    }
    
    // Update the ref to track this fetch
    prevKeyRef.current = currentKey;
    
    // Always fetch when ownerId/location changes - the thunk will handle caching
    // This ensures we get fresh data when switching between owners
    dispatch(fetchOwner({ location, ownerId }));
  }, [location, ownerId, dispatch]);

  // Render the client component that displays the details
  return <OwnerDetailClient location={location} id={id} />;
}

