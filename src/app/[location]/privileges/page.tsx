import { PrivilegesClient } from "./PrivilegesClient";

interface PrivilegesPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function PrivilegesPage({ params }: PrivilegesPageProps) {
  const { location } = await params;
  return <PrivilegesClient location={location} />;
}
