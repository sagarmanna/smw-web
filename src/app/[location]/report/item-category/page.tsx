import { ItemCategoryClient } from "./ItemCategoryClient";

interface ItemCategoryPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function ItemCategoryPage({ params }: ItemCategoryPageProps) {
  const { location } = await params;
  return <ItemCategoryClient location={location} />;
}

