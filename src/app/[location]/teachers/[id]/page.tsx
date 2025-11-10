import { TeachersDetailClient } from "./TeachersDetailClient";

interface TeacherDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const { location, id } = await params;
  
  return <TeachersDetailClient location={location} id={id} />;
}
