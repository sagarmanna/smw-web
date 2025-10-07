import { RoyaltyClient } from "./RoyaltyClient";

interface RoyaltyPageProps {
  params: Promise<{
    location:string;
  }>;
}

export default async function RoyaltyPage({ params }: RoyaltyPageProps) {
  const { location } = await params;
  return <RoyaltyClient location={location} />;
}
