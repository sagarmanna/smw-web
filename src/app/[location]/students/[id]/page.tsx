import { StudentDetailClient } from "../StudentDetailClient";

interface StudentDetailPageProps {
  params: Promise<{ location: string; id: string }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { location, id } = await params;
  return <StudentDetailClient location={location} studentId={id} />;
}