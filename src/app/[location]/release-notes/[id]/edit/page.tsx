'use client';

import { use } from 'react';
import { EditReleaseNoteClient } from './EditReleaseNoteClient';

interface EditReleaseNotePageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function EditReleaseNotePage({ params }: EditReleaseNotePageProps) {
  const { location, id } = use(params);

  return <EditReleaseNoteClient location={location} id={id} />;
}

