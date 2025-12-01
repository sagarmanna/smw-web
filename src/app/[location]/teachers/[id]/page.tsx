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
  
  // Track previous teacherId to detect changes
  const prevTeacherIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Only fetch if we have valid IDs
    if (!teacherId || !location) return;
    
    // If teacherId changed, clear previous teacher data immediately
    if (prevTeacherIdRef.current !== null && prevTeacherIdRef.current !== teacherId) {
      dispatch(clearTeacher());
    }
    
    // Update the ref
    prevTeacherIdRef.current = teacherId;
    
    // Always fetch when teacherId changes - the thunk will handle caching
    // This ensures we get fresh data when switching between teachers
    dispatch(fetchTeacher({ location, teacherId }));
    
  }, [location, teacherId, dispatch]); // Only depend on location, teacherId, and dispatch to prevent excessive re-renders

  // Render the client component that displays the details
  return <TeachersDetailClient location={location} id={id} />;
}
