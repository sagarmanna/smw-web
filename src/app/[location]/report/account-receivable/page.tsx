import { AccountReceivableClient } from "./AccountReceivableClient";

interface AccountReceivablePageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function AccountReceivablePage({ params }: AccountReceivablePageProps) {
  const { location } = await params;
  return <AccountReceivableClient location={location} />;
}
