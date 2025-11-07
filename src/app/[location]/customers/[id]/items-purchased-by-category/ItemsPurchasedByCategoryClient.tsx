"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components/CustomTable";
import { DetailHeader } from "@/components/DetailHeader";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatCurrency";
import { usePrintReport } from "@/hooks/usePrintReport";

interface ItemsPurchasedRow {
  category: string; // e.g., Lesson, Rentals
  description: string;
  price: number;
}

interface ItemsPurchasedByCategoryClientProps {
  location: string;
  customerId: string;
}

export function ItemsPurchasedByCategoryClient({
  location,
  customerId,
}: ItemsPurchasedByCategoryClientProps) {
  const router = useRouter();
  const [loading] = React.useState<boolean>(false);

  // Mock data (based on provided screenshot)
  const rows = React.useMemo<ItemsPurchasedRow[]>(
    () => [
      { category: "Lesson", description: "xPiano Contemporary for Test student07 with siva teacher on Oct. 14th, 2025", price: 28.75 },
      { category: "Lesson", description: "xPiano Hybrid for Test student22 with teacher test on Nov. 3rd, 2025", price: 29.25 },
      { category: "Lesson", description: "xPiano Contemporary for Test student07 with siva teacher on Oct. 28th, 2025", price: 25.88 },
      { category: "Lesson", description: "xPiano Hybrid for Test student22 with teacher test on Oct. 27th, 2025", price: 29.25 },
      { category: "Lesson", description: "xClassical Guitar for Test student22 with Test teacherseng on Oct. 22nd, 2025", price: 28.75 },
      { category: "Lesson", description: "xGuitar Contemporary for Test student22 with Thomas karenshia on Oct. 22nd, 2025", price: 28.75 },
      { category: "Lesson", description: "xPiano Contemporary for Test student07 with siva teacher on Oct. 21st, 2025", price: 28.75 },
      { category: "Lesson", description: "xPiano Hybrid for Test student22 with teacher test on Oct. 20th, 2025", price: 32.50 },
      { category: "Lesson", description: "xClassical Guitar for Test student22 with Test teacherseng on Oct. 15th, 2025", price: 28.75 },
      { category: "Lesson", description: "xGuitar Contemporary for Test student22 with Thomas karenshia on Oct. 15th, 2025", price: 28.75 },
      { category: "Lesson", description: "xPiano Hybrid for Test student22 with teacher test on Sep. 22nd, 2025", price: 32.50 },
      { category: "Lesson", description: "xPiano Hybrid for Test student22 with teacher test on Oct. 13th, 2025", price: 32.50 },
      { category: "Lesson", description: "xClassical Guitar for Test student22 with Test teacherseng on Oct. 8th, 2025", price: 28.75 },
      { category: "Lesson", description: "xGuitar Contemporary for Test student22 with Thomas karenshia on Oct. 8th, 2025", price: 28.75 },
      { category: "Lesson", description: "xPiano Contemporary for Test student07 with siva teacher on Oct. 7th, 2025", price: 28.75 },
      { category: "Lesson", description: "xPiano Hybrid for Test student22 with teacher test on Oct. 6th, 2025", price: 32.50 },
      { category: "Lesson", description: "xClassical Guitar for Test student22 with Test teacherseng on Oct. 1st, 2025", price: 28.75 },
      { category: "Lesson", description: "xGuitar Contemporary for Test student22 with Thomas karenshia on Oct. 1st, 2025", price: 28.75 },
      { category: "Lesson", description: "xClassical Guitar for Test student22 with Test teacherseng on Sep. 24th, 2025", price: 28.75 },
      { category: "Lesson", description: "xGuitar Contemporary for Test student22 with Thomas karenshia on Sep. 24th, 2025", price: 28.75 },
      { category: "Rentals", description: "Rental Charge", price: 2.00 },
    ],
    []
  );

  const totalPrice = React.useMemo(
    () => rows.reduce((sum, r) => sum + (Number.isFinite(r.price) ? r.price : 0), 0),
    [rows]
  );

  const columns = React.useMemo<ColumnDef<ItemsPurchasedRow>[]>(
    () => [
      {
        accessorKey: "category",
        header: "Category",
        size: 140,
        meta: { printable: true, printableName: "Category" },
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 600,
        meta: { printable: true, printableName: "Description" },
        cell: ({ row }) => (
          <div className="text-left whitespace-pre-wrap">{row.original.description}</div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        size: 120,
        meta: { printable: true, printableName: "Price", exportFormatter: (v: unknown) => formatCurrency(v as number) },
        cell: ({ row }) => (
          <div className="text-right whitespace-nowrap">{formatCurrency(row.original.price)}</div>
        ),
      },
    ],
    []
  );

  const footerRow: ItemsPurchasedRow = React.useMemo(
    () => ({ category: "", description: "", price: totalPrice }),
    [totalPrice]
  );

  // Date range state
  const [range, setRange] = React.useState<{ from: Date; to: Date }>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return { from: start, to: end };
  });

  // Pagination state (client-side slicing, table expects server-style props)
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: rows.length,
    totalPages: Math.ceil(rows.length / 20) || 1,
  });

  React.useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: rows.length,
      totalPages: Math.ceil(rows.length / prev.limit) || 1,
      page: Math.min(prev.page, Math.ceil(rows.length / prev.limit) || 1),
    }));
  }, [rows.length]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPagination((prev) => ({
      ...prev,
      limit: newRowsPerPage,
      page: 1,
      totalPages: Math.ceil(prev.total / newRowsPerPage) || 1,
    }));
  };

  const showPagination = pagination.total > pagination.limit;
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const pageData = showPagination ? rows.slice(startIndex, endIndex) : rows;

  const { handlePrint } = usePrintReport<ItemsPurchasedRow>();

  const onPrintClick = React.useCallback(() => {
    handlePrint({
      reportTitle: "Items Purchased By Category",
      columns,
      data: rows,
      footer: footerRow,
      location,
      dateRange: range,
      rightAlignedColumns: ["Price"],
    });
  }, [columns, rows, footerRow, location, range, handlePrint]);

  return (
    <div className="bg-white dark:bg-black -mt-2">
      <div className="px-4 pt-4">
        <DetailHeader
          breadcrumbItems={[
            { label: "Customers", onClick: () => router.push(`/${location}/customers`) },
            { label: customerId, onClick: () => router.push(`/${location}/customers/${customerId}`) },
          ]}
          currentPageTitle="Items Purchased by Category"
          showActions={false}
          actionMenuGroups={[]}
        />
      </div>

      <div className="m-4">
        <CustomTable
          title=""
          columns={columns}
          data={pageData}
          footerRow={footerRow}
          isLoading={loading}
          enableSearch={false}
          enableExport={false}
          enableFilter={false}
          enablePrint={true}
          onPrint={onPrintClick}
          enableSorting={true}
          enableRowsPerPage={true}
          initialRowsPerPage={20}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 20, 50, 100]}
          onRowsPerPageChange={handleRowsPerPageChange}
          serverSidePagination={showPagination ? pagination : undefined}
          onServerSidePageChange={showPagination ? handlePageChange : undefined}
          showRecordCountInToolbar={false}
          // Date range
          enableDateRangePicker={true}
          dateRange={range}
          onDateRangeChange={(r) => r && setRange(r)}
          size="compact"
          variant="striped"
        />
      </div>
    </div>
  );
}


