import { DiscountClient } from "./DiscountClient";

interface DiscountPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function DiscountPage({ params }: DiscountPageProps) {
  const { location } = await params;
  return <DiscountClient location={location} />;
}
