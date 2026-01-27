'use client';

import { use } from 'react';
import { ClassroomDetailClient } from "./ClassroomDetailClient";

interface ClassroomDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function ClassroomDetailPage({ params }: ClassroomDetailPageProps) {
  const { location, id } = use(params);
  return <ClassroomDetailClient location={location} id={id} />;
}

