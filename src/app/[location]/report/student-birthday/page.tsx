import { StudentBirthdayClient } from "./StudentBirthdayClient";

interface StudentBirthdayPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function StudentBirthdayPage({ params }: StudentBirthdayPageProps) {
  const { location } = await params;
  return <StudentBirthdayClient location={location} />;
}
