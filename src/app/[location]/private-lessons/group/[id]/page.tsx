"use client";

import { use } from "react";
import { GroupLessonDetailClient } from "./GroupLessonDetailClient";

interface GroupLessonDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function GroupLessonDetailPage({ params }: GroupLessonDetailPageProps) {
  const { location, id } = use(params);
  return <GroupLessonDetailClient location={location} id={id} />;
}

