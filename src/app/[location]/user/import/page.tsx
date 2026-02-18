import { UserImportClient } from "./UserImportClient";

interface UserImportPageProps {
  params: Promise<{ location: string }>;
}

export default async function UserImportPage({ params }: UserImportPageProps) {
  const { location } = await params;
  return <UserImportClient location={location} />;
}
