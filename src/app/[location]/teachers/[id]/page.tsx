'use client';

import { use, useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchTeacher } from './teachers.slice';
import { TeachersDetailClient } from "./TeachersDetailClient";

interface TeacherDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const { location, id } = use(params);

  // Fetch teacher details from API and store in Redux state
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchTeacher(id));
  }, [id, dispatch]);

  // Render the client component that displays the details
  return <TeachersDetailClient location={location} id={id} />;
}
