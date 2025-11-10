"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { proformaInvoiceDetailColumns, ProformaInvoiceDetailData } from "../../tabConfigs";
import { mockCustomerTabData } from "../../mockData/customersMockData";

interface ProformaInvoiceClientProps {
  location: string;
  customerId: string;
}

export function ProformaInvoiceClient({
  location: _location,
  customerId: _customerId,
}: ProformaInvoiceClientProps) {
  const [loading] = React.useState<boolean>(false);

  // Get detailed mock data for the standalone page
  const proformaInvoiceData = React.useMemo(() => {
    return mockCustomerTabData.proformaInvoiceDetailData as ProformaInvoiceDetailData[];
  }, []);


  // Pagination: 20 rows per page by default; show controls only if needed
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: proformaInvoiceData.length,
    totalPages: Math.ceil(proformaInvoiceData.length / 20) || 1,
  });

  React.useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: proformaInvoiceData.length,
      totalPages: Math.ceil(proformaInvoiceData.length / prev.limit) || 1,
      page: Math.min(prev.page, Math.ceil(proformaInvoiceData.length / prev.limit) || 1),
    }));
  }, [proformaInvoiceData.length]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setPagination((prev) => ({
      ...prev,
      limit: rowsPerPage,
      page: 1,
      totalPages: Math.ceil(prev.total / rowsPerPage) || 1,
    }));
  };

  const showPagination = pagination.total > pagination.limit;
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const pageData = showPagination ? proformaInvoiceData.slice(startIndex, endIndex) : proformaInvoiceData;

  return (
    <div className="bg-white dark:bg-black -mt-2">
     

      <div className="m-4">
        <CustomTable
          title="Proforma Invoice"
          columns={proformaInvoiceDetailColumns}
          data={pageData}
          isLoading={loading}
          enableSearch={false}
          enableExport={false}
          enableFilter={false}
          enablePrint={false}
          enableSorting={true}
          enableRowsPerPage={true}
          initialRowsPerPage={20}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={handleRowsPerPageChange}
          serverSidePagination={showPagination ? pagination : undefined}
          onServerSidePageChange={showPagination ? handlePageChange : undefined}
          size="compact"
          variant="striped"
        />
      </div>
    </div>
  );
}

