'use client';

import { use, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchTeacher, clearTeacher } from './teachers.slice';
import { TeachersDetailClient } from "./TeachersDetailClient";

interface TeacherDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const { location, id } = use(params);
  const dispatch = useAppDispatch();
  const teacherId = Number(id);
  
  // Track previous teacherId/location to detect changes and prevent duplicate fetches
  const prevKeyRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only fetch if we have valid IDs
    if (!teacherId || !location) return;
    
    // Create a unique key for this teacher/location combination
    const currentKey = `${location}-${teacherId}`;
    
    // Skip if we've already fetched for this exact combination (prevents duplicate calls during re-renders)
    if (prevKeyRef.current === currentKey) {
      return;
    }
    
    // If teacherId changed, clear previous teacher data immediately
    const prevKey = prevKeyRef.current;
    if (prevKey && prevKey !== currentKey) {
      const prevTeacherId = prevKey.split('-')[1];
      if (prevTeacherId && Number(prevTeacherId) !== teacherId) {
        dispatch(clearTeacher());
      }
    }
    
    // Update the ref to track this fetch
    prevKeyRef.current = currentKey;
    
    // Always fetch when teacherId/location changes - the thunk will handle caching
    // This ensures we get fresh data when switching between teachers
    dispatch(fetchTeacher({ location, teacherId }));
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, teacherId]); // dispatch is stable from Redux Toolkit, no need to include in deps

  // Render the client component that displays the details
  return <TeachersDetailClient location={location} id={id} />;
}
