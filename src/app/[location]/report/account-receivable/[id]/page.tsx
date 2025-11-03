import React from "react";
import { ReportDetail } from "../../../customers/components/ReportDetail";

interface AccountReceivablePageProps {
  params: Promise<{ id: string; location: string }>;
}

const AccountReceivablePage = async ({ params }: AccountReceivablePageProps) => {
  // ✅ Await the params (Next.js 15 requirement)
  const { id, location } = await params;

  return (
    <ReportDetail
      customerId={id}
      customerName={`Customer ${id}`}
      location={location}
    />
  );
};

export default AccountReceivablePage;
