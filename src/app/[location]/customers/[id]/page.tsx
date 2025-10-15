import { CustomerDetailClient } from "./CustomerDetailClient";

interface CustomersPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default async function CustomersPage({ params }: CustomersPageProps) {
  const { location, id } = await params;
  return <CustomerDetailClient location={location} id={id} />;
}


