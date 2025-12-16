import { GroupCoursesListingClient } from "./GroupCoursesListingClient";

interface GroupCoursesPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function GroupCoursesPage({ params }: GroupCoursesPageProps) {
  const { location } = await params;
  return <GroupCoursesListingClient location={location} />;
}

