'use client';

import { use, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchGroupCourse, clearGroupCourse } from './groupCourseDetails.slice';
import { GroupCourseDetailClient } from "./GroupCourseDetailClient";

interface GroupCourseDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function GroupCourseDetailPage({ params }: GroupCourseDetailPageProps) {
  const { location, id } = use(params);
  const dispatch = useAppDispatch();
  const courseId = Number(id);
  
  // Track previous courseId/location to detect changes and prevent duplicate fetches
  const prevKeyRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only fetch if we have valid IDs
    if (!courseId || !location) return;
    
    // Create a unique key for this course/location combination
    const currentKey = `${location}-${courseId}`;
    
    // Skip if we've already fetched for this exact combination (prevents duplicate calls during re-renders)
    if (prevKeyRef.current === currentKey) {
      return;
    }
    
    // If courseId changed, clear previous course data immediately
    const prevKey = prevKeyRef.current;
    if (prevKey && prevKey !== currentKey) {
      const prevCourseId = prevKey.split('-')[1];
      if (prevCourseId && Number(prevCourseId) !== courseId) {
        dispatch(clearGroupCourse());
      }
    }
    
    // Update the ref to track this fetch
    prevKeyRef.current = currentKey;
    
    // Always fetch when courseId/location changes - the thunk will handle caching
    // This ensures we get fresh data when switching between courses
    dispatch(fetchGroupCourse({ location, courseId }));
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, courseId]); // dispatch is stable from Redux Toolkit, no need to include in deps

  // Render the client component that displays the details
  return <GroupCourseDetailClient location={location} id={id} />;
}

