'use client';

import { use, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchPrivateLesson, clearPrivateLesson } from './private-lesson-details.slice';
import { PrivateLessonDetailClient } from "./PrivateLessonDetailClient";

interface PrivateLessonDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function PrivateLessonDetailPage({ params }: PrivateLessonDetailPageProps) {
  const { location, id } = use(params);
  const dispatch = useAppDispatch();
  const privateLessonId = id;
  
  // Track previous privateLessonId/location to detect changes and prevent duplicate fetches
  const prevKeyRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only fetch if we have valid IDs
    if (!privateLessonId || !location) return;
    
    // Create a unique key for this private lesson/location combination
    const currentKey = `${location}-${privateLessonId}`;
    
    // Skip if we've already fetched for this exact combination (prevents duplicate calls during re-renders)
    if (prevKeyRef.current === currentKey) {
      return;
    }
    
    // If privateLessonId changed, clear previous private lesson data immediately
    const prevKey = prevKeyRef.current;
    if (prevKey && prevKey !== currentKey) {
      const prevPrivateLessonId = prevKey.split('-')[1];
      if (prevPrivateLessonId && prevPrivateLessonId !== privateLessonId) {
        dispatch(clearPrivateLesson());
      }
    }
    
    // Update the ref to track this fetch
    prevKeyRef.current = currentKey;
    
    // Fetch private lesson details on initial page load
    dispatch(fetchPrivateLesson({ location, privateLessonId }));
  }, [location, privateLessonId, dispatch]);

  // Render the client component that displays the details
  return <PrivateLessonDetailClient location={location} id={id} />;
}

