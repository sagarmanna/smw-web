import { BlogsListingClient } from "./BlogsListingClient";

interface BlogsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function BlogsPage({ params }: BlogsPageProps) {
  const { location } = await params;
  return <BlogsListingClient location={location} />;
}

