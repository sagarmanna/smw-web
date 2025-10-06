import { ItemsClient } from "./ItemsClient";

interface ItemsPageProps {
  params: Promise<{
    location:string;
  }>;
}

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { location } = await params;

  return (
    <ItemsClient location={location} />
  )
}
