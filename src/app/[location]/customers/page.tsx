import { CustomersListingClient } from "./CustomersListingClient";

interface CustomersPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function CustomersPage({ params }: CustomersPageProps) {
  const { location } = await params;
  return <CustomersListingClient location={location} />;
}


