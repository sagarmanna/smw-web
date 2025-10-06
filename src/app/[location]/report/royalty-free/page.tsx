import { RoyaltyFreeClient } from "./RoyaltyFreeClient";

interface RoyaltyFreePageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function RoyaltyFreePage({ params }: RoyaltyFreePageProps) {
  const { location } = await params;
  return <RoyaltyFreeClient location={location} />;
}
