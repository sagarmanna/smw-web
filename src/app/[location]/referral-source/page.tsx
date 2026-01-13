import { ReferralSourceListingClient } from "./ReferralSourceListingClient";

interface ReferralSourcePageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function ReferralSourcePage({ params }: ReferralSourcePageProps) {
  const { location } = await params;
  return <ReferralSourceListingClient location={location} />;
}
