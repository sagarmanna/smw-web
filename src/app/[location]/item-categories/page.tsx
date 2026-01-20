import { ItemCategoriesListingClient } from "./ItemCategoriesListingClient";

interface ItemCategoriesPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function ItemCategoriesPage({ params }: ItemCategoriesPageProps) {
  const { location } = await params;
  return <ItemCategoriesListingClient location={location} />;
}
