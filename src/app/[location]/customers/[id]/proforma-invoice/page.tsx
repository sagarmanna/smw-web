import { ProformaInvoiceClient } from "./ProformaInvoiceClient";
interface ProformaInvoicePageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default async function ProformaInvoicePage({ params }: ProformaInvoicePageProps) {
  const { location, id } = await params;
  return <ProformaInvoiceClient location={location} customerId={id} />;
}

