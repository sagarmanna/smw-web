import { EnrolmentsListingClient } from "./EnrolmentsListingClient";

interface EnrolmentsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function EnrolmentsPage({ params }: EnrolmentsPageProps) {
  const { location } = await params;
  return <EnrolmentsListingClient location={location} />;
}

