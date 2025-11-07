import { PaymentsClient } from "./PaymentsClient";

interface PaymentsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function PaymentsPage({ params }: PaymentsPageProps) {
  const { location } = await params;
  return <PaymentsClient location={location} />;
}
