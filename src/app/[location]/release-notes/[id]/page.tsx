'use client';

import { use } from 'react';
import { ReleaseNoteDetailClient } from './ReleaseNoteDetailClient';

interface ReleaseNoteDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function ReleaseNoteDetailPage({ params }: ReleaseNoteDetailPageProps) {
  const { location, id } = use(params);

  // Render the client component that displays the details
  return <ReleaseNoteDetailClient location={location} id={id} />;
}

