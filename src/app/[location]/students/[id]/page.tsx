'use client';

import { use, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchStudent, clearStudent } from './students-details.slice';
import { StudentDetailClient } from "./StudentDetailClient";

interface StudentDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { location, id } = use(params);
  const dispatch = useAppDispatch();
  const studentId = id;
  
  // Track previous studentId/location to detect changes and prevent duplicate fetches
  const prevKeyRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only fetch if we have valid IDs
    if (!studentId || !location) return;
    
    // Create a unique key for this student/location combination
    const currentKey = `${location}-${studentId}`;
    
    // Skip if we've already fetched for this exact combination (prevents duplicate calls during re-renders)
    if (prevKeyRef.current === currentKey) {
      return;
    }
    
    // If studentId changed, clear previous student data immediately
    const prevKey = prevKeyRef.current;
    if (prevKey && prevKey !== currentKey) {
      const prevStudentId = prevKey.split('-')[1];
      if (prevStudentId && prevStudentId !== studentId) {
        dispatch(clearStudent());
      }
    }
    
    // Update the ref to track this fetch
    prevKeyRef.current = currentKey;
    
    // Always fetch when studentId/location changes - the thunk will handle caching
    // This ensures we get fresh data when switching between students
    dispatch(fetchStudent({ location, studentId }));
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, studentId]); // dispatch is stable from Redux Toolkit, no need to include in deps

  // Render the client component that displays the details
  return <StudentDetailClient location={location} id={id} />;
}