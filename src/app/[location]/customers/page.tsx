import { CustomersClient } from "./CustomersClient";
import { CustomerDetailClient } from "./CustomerDetailClient";
import CustomersPageClient from "./CustomersPageClient";

interface CustomersPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function CustomersPage({ params }: CustomersPageProps) {
  const { location } = await params;
  return <CustomersPageClient location={location} />;
}


