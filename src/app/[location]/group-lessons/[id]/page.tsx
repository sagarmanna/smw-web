'use client';

import { use, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchPrivateLesson,
  fetchPrivateLessonHistory,
  fetchPrivateLessonComments,
  clearPrivateLesson,
} from '../../private-lessons/[id]/private-lesson-details.slice';
import { GroupLessonDetailClient } from './GroupLessonDetailClient';

interface GroupLessonDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function GroupLessonDetailPage({ params }: GroupLessonDetailPageProps) {
  const { location, id } = use(params);
  const dispatch = useAppDispatch();
  const lessonId = id;

  // If data for this exact lesson is already in the store (redirected from private-lessons),
  // skip the fetch to avoid a duplicate API call.
  const currentLessonId = useAppSelector((state) => state.privateLesson?.currentPrivateLessonId);
  const hasData = useAppSelector((state) => !!state.privateLesson?.privateLessonInfo);

  const prevKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lessonId || !location) return;

    const currentKey = `${location}-${lessonId}`;

    if (prevKeyRef.current === currentKey) return;

    const prevKey = prevKeyRef.current;
    if (prevKey && prevKey !== currentKey) {
      const prevLessonId = prevKey.split('-')[1];
      if (prevLessonId && prevLessonId !== lessonId) {
        dispatch(clearPrivateLesson());
      }
    }

    prevKeyRef.current = currentKey;

    // Data already fetched for this lesson (e.g. redirected from /private-lessons/[id])
    if (currentLessonId === lessonId && hasData) return;

    dispatch(fetchPrivateLesson({ location, privateLessonId: lessonId }));
    dispatch(fetchPrivateLessonHistory({ location, privateLessonId: lessonId, page: 1 }));
    dispatch(fetchPrivateLessonComments({ location, privateLessonId: lessonId, page: 1 }));
  }, [location, lessonId, dispatch, currentLessonId, hasData]);

  return <GroupLessonDetailClient location={location} id={id} />;
}
