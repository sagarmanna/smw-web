import { TermsOfServiceClient } from "./TermsOfServiceClient";

interface TermsOfServicePageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function TermsOfServicePage({ params }: TermsOfServicePageProps) {
  const { location } = await params;
  return <TermsOfServiceClient location={location} />;
}
