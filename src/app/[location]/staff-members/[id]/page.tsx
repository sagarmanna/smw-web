'use client';

import { use, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchStaffMember, clearStaffMember } from './staff-members-details.slice';
import { clearStaffMemberTabs } from './staffMembersTabs.slice';
import { StaffMemberDetailClient } from "./StaffMemberDetailClient";

interface StaffMemberDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function StaffMemberDetailPage({ params }: StaffMemberDetailPageProps) {
  const { location, id } = use(params);
  const dispatch = useAppDispatch();
  const staffMemberId = Number(id);
  
  // Track previous staffMemberId/location to detect changes and prevent duplicate fetches
  const prevKeyRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only fetch if we have valid IDs
    if (!staffMemberId || !location) return;
    
    // Create a unique key for this staff member/location combination
    const currentKey = `${location}-${staffMemberId}`;
    
    // Skip if we've already fetched for this exact combination (prevents duplicate calls during re-renders)
    if (prevKeyRef.current === currentKey) {
      return;
    }
    
    // If staffMemberId changed, clear previous staff member data immediately
    const prevKey = prevKeyRef.current;
    if (prevKey && prevKey !== currentKey) {
      const prevStaffMemberId = prevKey.split('-')[1];
      if (prevStaffMemberId && Number(prevStaffMemberId) !== staffMemberId) {
        dispatch(clearStaffMember());
        dispatch(clearStaffMemberTabs());
      }
    }
    
    // Update the ref to track this fetch
    prevKeyRef.current = currentKey;
    
    // Always fetch when staffMemberId/location changes - the thunk will handle caching
    // This ensures we get fresh data when switching between staff members
    dispatch(fetchStaffMember({ location, staffMemberId }));
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, staffMemberId]); // dispatch is stable from Redux Toolkit, no need to include in deps

  // Render the client component that displays the details
  return <StaffMemberDetailClient location={location} id={id} />;
}

