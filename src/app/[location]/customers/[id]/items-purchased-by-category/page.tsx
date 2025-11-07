import { ItemsPurchasedByCategoryClient } from "./ItemsPurchasedByCategoryClient";

interface ItemsPurchasedByCategoryPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default async function ItemsPurchasedByCategoryPage({ params }: ItemsPurchasedByCategoryPageProps) {
  const { location, id } = await params;
  return <ItemsPurchasedByCategoryClient location={location} customerId={id} />;
}


