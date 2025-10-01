import { SalesAndPaymentClient } from "./index";

interface SalesAndPaymentPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function SalesAndPaymentPage({ params }: SalesAndPaymentPageProps) {
  const { location } = await params;
  return <SalesAndPaymentClient location={location} />;
}


