import { RentalClient } from "./RentalClient";

interface RentalPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function RentalPage({ params }: RentalPageProps) {
  const { location } = await params;
  return <RentalClient location={location} />;
}
