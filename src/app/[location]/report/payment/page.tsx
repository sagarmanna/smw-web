import { PaymentClient } from "./PaymentClient";

interface PaymentPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { location } = await params;

  return (
    <PaymentClient location={location} />
  )
}
