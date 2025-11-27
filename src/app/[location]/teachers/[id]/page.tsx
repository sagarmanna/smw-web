'use client';

import { use, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTeacher } from './teachers.slice';
import { TeachersDetailClient } from "./TeachersDetailClient";

interface TeacherDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

// Cache configuration - data is considered fresh for 5 minutes
const STALE_TIME_MS = 5 * 60 * 1000;

export default function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const { location, id } = use(params);
  const dispatch = useAppDispatch();
  const teacherId = Number(id);
  
  // Get current state to check if we need to fetch
  const teacherState = useAppSelector((state) => state.teacher);
  
  useEffect(() => {
    // Only fetch if we have valid IDs
    if (!teacherId || !location) return;
    
    // Check if we already have fresh cached data for this teacher
    const hasFreshCache = 
      teacherState.teacherInfo !== null &&
      teacherState.currentTeacherId === teacherId &&
      teacherState.lastFetched !== null &&
      Date.now() - teacherState.lastFetched < STALE_TIME_MS;
    
    // If we don't have fresh cache and we're not already loading, fetch
    // Redux Toolkit will prevent duplicate pending requests automatically
    if (!hasFreshCache && !teacherState.isLoading) {
      dispatch(fetchTeacher({ location, teacherId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, teacherId, dispatch]); // Only depend on location, teacherId, and dispatch to prevent excessive re-renders

  // Render the client component that displays the details
  return <TeachersDetailClient location={location} id={id} />;
}
