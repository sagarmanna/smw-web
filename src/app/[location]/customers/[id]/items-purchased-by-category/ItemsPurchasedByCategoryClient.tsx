"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components/CustomTable";
import { DetailHeader } from "@/components/DetailHeader";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatCurrency";
import { usePrintReport } from "@/hooks/usePrintReport";
import { getItemsPurchasedReport } from "./Items-purchase-category-api";
import { getCustomerById, getCustomerInfo } from "../../customers.api";

interface ItemsPurchasedRow {
  category: string;
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
  const [loading, setLoading] = React.useState<boolean>(true);
  const [rows, setRows] = React.useState<ItemsPurchasedRow[]>([]);
  const [customerName, setCustomerName] = React.useState<string>("");

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

  // Pagination state (server-side)
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const toNumber = (value: unknown): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    const cleaned = String(value).replace(/[$,]/g, "").trim();
    const n = Number.parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const formatDateForApi = (date: Date): string => {
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`; // e.g., Nov 07, 2025
  };

  React.useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = {
          page: pagination.page,
          limit: rowsPerPage < 0 ? 99999 : rowsPerPage,
          startDate: formatDateForApi(range.from),
          endDate: formatDateForApi(range.to),
        };
        const resp = await getItemsPurchasedReport(location, customerId, params);

        const d = resp as unknown;
        let body: unknown[] = [];
        if (Array.isArray(d)) {
          body = d as unknown[];
        } else if (typeof d === "object" && d !== null) {
          const obj = d as { data?: unknown; body?: unknown; pagination?: unknown };
          if (obj.data && typeof obj.data === "object" && obj.data !== null && Array.isArray((obj.data as { body?: unknown }).body as unknown[])) {
            body = ((obj.data as { body?: unknown }).body as unknown[]) || [];
          } else if (Array.isArray(obj.data as unknown[])) {
            body = (obj.data as unknown[]) || [];
          } else if (Array.isArray(obj.body as unknown[])) {
            body = (obj.body as unknown[]) || [];
          }
        }

        type PaginationLike = { page?: unknown; limit?: unknown; total?: unknown; totalPages?: unknown };
        let p: PaginationLike | undefined;
        if (typeof d === "object" && d !== null) {
          const obj = d as { data?: unknown; pagination?: unknown };
          if (obj.data && typeof obj.data === "object" && obj.data !== null && (obj.data as { pagination?: unknown }).pagination && typeof (obj.data as { pagination?: unknown }).pagination === "object") {
            p = (obj.data as { pagination?: unknown }).pagination as PaginationLike;
          } else if (obj.pagination && typeof obj.pagination === "object") {
            p = obj.pagination as PaginationLike;
          }
        }

        const mappedRows: ItemsPurchasedRow[] = ((body || []) as Array<Record<string, unknown>>).map((row) => {
          const r = row as Record<string, unknown>;
          const category = String(
            r["category"] ?? r["Category"] ?? r["itemCategory"] ?? r["itemCategoryName"] ?? r["category_name"] ?? r["categoryName"] ?? r["type"] ?? ""
          );
          const description = String(
            r["description"] ?? r["Description"] ?? r["itemDescription"] ?? r["activity"] ?? ""
          );
          const price = toNumber(
            r["price"] ?? r["Price"] ?? r["amount"] ?? r["total"] ?? r["Total"] ?? 0
          );
          return { category, description, price };
        });

        if (!isCancelled) {
          setRows(mappedRows);
          setPagination({
            page: Number(p?.page) || 1,
            limit: Number(p?.limit) || rowsPerPage,
            total: Number(p?.total) || mappedRows.length,
            totalPages: Number(p?.totalPages) || 1,
          });
        }
      } catch (_err) {
        if (!isCancelled) {
          setRows([]);
          setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    load();
    return () => {
      isCancelled = true;
    };
  }, [location, customerId, pagination.page, rowsPerPage, range.from, range.to]);

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

  const { handlePrint } = usePrintReport<ItemsPurchasedRow>();

  // Fetch customer name for breadcrumb
  React.useEffect(() => {
    let cancelled = false;
    const loadCustomer = async () => {
      try {
        const info = await getCustomerInfo(location, Number(customerId));
        if (!cancelled && info?.success && info.data?.profile?.name) {
          setCustomerName(info.data.profile.name);
          return;
        }
        const c = await getCustomerById(location, Number(customerId));
        if (!cancelled && c) {
          const fullName = [c.firstName, c.lastName].filter(Boolean).join(" ");
          setCustomerName(fullName || String(customerId));
        }
      } catch {
        if (!cancelled) setCustomerName(String(customerId));
      }
    };
    loadCustomer();
    return () => {
      cancelled = true;
    };
  }, [location, customerId]);

  const onPrintClick = React.useCallback(() => {
    handlePrint({
      reportTitle: "Customer Items Report",
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
      <div className="px-2 pt-2">
        <DetailHeader
          breadcrumbItems={[
            { label: "Customers", onClick: () => router.push(`/${location}/customers`) },
            { label: customerName || customerId, onClick: () => router.push(`/${location}/customers/${customerId}`) },
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
          data={rows}
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
          onDateRangeChange={(r) => {
            if (r) {
              setRange(r);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }
          }}
          size="compact"
          variant="striped"
        />
      </div>
    </div>
  );
}


