/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as React from "react";
import { format } from "date-fns";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { Card } from "@/components/ui/card";
import { getDiscounts, DiscountRow } from "./discount.api";
import { useExportableData } from "@/hooks/useExportableData";

interface DiscountClientProps {
  location: string;
}

const columns = [
  {
    accessorKey: "customer",
    header: "Customer",
    meta: {
      printable: true,
      printableName: "Customer",
    },
    cell: ({ row }: { row: { original: DiscountRow } }) => {
      const value = row.original.customer;
      return (
        <span className="font-semibold whitespace-normal break-words">{value || '-'}</span>
      );
    }
  },
  {
    accessorKey: "code",
    header: "Code",
    meta: {
      printable: true,
      printableName: "Code",
    },
    cell: ({ row }: { row: { original: DiscountRow } }) => {
      const value = row.original.code;
      return value || '-';
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    meta: {
      printable: true,
      printableName: "Description",
    },
    cell: ({ row }: { row: { original: DiscountRow } }) => {
      const value = row.original.description;
      return <span className="truncate max-w-[150px] block" title={value || ''}>{value || '-'}</span>;
    },
  },
  {
    accessorKey: "pf",
    header: "PF",
    meta: {
      printable: true,
      printableName: "PF",
    },
    cell: ({ row }: { row: { original: DiscountRow } }) => {
      const value = row.original.pf;
      return <span className="text-right block">{value || '-'}</span>;
    },
  },
  {
    accessorKey: "qty",
    header: "Qty",
    meta: {
      printable: true,
      printableName: "Qty",
    },
    cell: ({ row }: { row: { original: DiscountRow } }) => {
      const value = row.original.qty;
      return <span className="text-right block">{value || '-'}</span>;
    },
  },
  {
    accessorKey: "pfPercent",
    header: "PF(%)",
    meta: {
      printable: true,
      printableName: "PF(%)",
    },
    cell: ({ row }: { row: { original: DiscountRow } }) => {
      const value = row.original.pfPercent;
      return <span className="text-right block">{value || '-'}</span>;
    },
  },
  {
    accessorKey: "enrolDollar",
    header: "Enrol($)",
    meta: {
      printable: true,
      printableName: "Enrol($)",
    },
    cell: ({ row }: { row: { original: DiscountRow } }) => {
      const value = row.original.enrolDollar;
      return <span className="text-right block">{value || '-'}</span>;
    },
  },
  {
    accessorKey: "customerPercent",
    header: "Customer(%)",
    meta: {
      printable: true,
      printableName: "Customer(%)",
    },
    cell: ({ row }: { row: { original: DiscountRow } }) => {
      const value = row.original.customerPercent;
      return <span className="text-right block">{value || '-'}</span>;
    },
  },
  {
    accessorKey: "itemDollar",
    header: "Item($)",
    meta: {
      printable: true,
      printableName: "Item($)",
    },
    cell: ({ row }: { row: { original: DiscountRow } }) => {
      const value = row.original.itemDollar;
      return <span className="text-right block">{value || '-'}</span>;
    },
  },
  {
    accessorKey: "netDollar",
    header: "Net($)",
    meta: {
      printable: true,
      printableName: "Net($)",
    },
    cell: ({ row }: { row: { original: DiscountRow } }) => {
      const value = row.original.netDollar;
      return <span className="text-right block">{value || '-'}</span>;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    meta: {
      printable: true,
      printableName: "Price",
    },
    cell: ({ row }: { row: { original: DiscountRow } }) => {
      const value = row.original.price;
      return <span className="text-right block">{value || '-'}</span>;
    },
  },
];

export function DiscountClient({ location }: DiscountClientProps) {
  const [discounts, setDiscounts] = React.useState<DiscountRow[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const [range, setRange] = React.useState<{ from: Date; to: Date }>(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from, to };
  });

  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);

  const formatRangeParam = (d: Date) => format(d, "yyyy-MM-dd");

  const dateLabel = (() => {
    const from = range.from;
    const to = range.to;
    const sameDay = from.toDateString() === to.toDateString();
    if (sameDay) return format(from, "MMMM do, yyyy");
    const fromStr = format(from, "MMM do, yyyy");
    const toStr = format(to, "MMM do, yyyy");
    return `${fromStr} - ${toStr}`;
  })();

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData({
    reportTitle: `Discount Report - ${dateLabel}`,
    columns,
    data: discounts,
  });

  const load = React.useCallback(async (page = 1, limit = 20) => {
    try {
      setIsLoading(true);
      setError(null);
      const startDate = formatRangeParam(range.from);
      const endDate = formatRangeParam(range.to);
      const discountsRes = await getDiscounts(location, startDate, endDate, page, limit);
      
      if (discountsRes.success) {
        setDiscounts(discountsRes.data || []);
        setPagination({
          page: page,
          limit: limit,
          total: discountsRes.pagination?.total || (discountsRes.data || []).length,
          totalPages: discountsRes.pagination?.totalPages || 1
        });
      } else {
        setError(discountsRes.message || "Failed to fetch discounts");
        setDiscounts([]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setError(msg);
      setDiscounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [location, range.from, range.to]);

  React.useEffect(() => {
    load(1, rowsPerPage);
  }, [load]);

  const handlePageChange = React.useCallback((page: number) => {
    load(page, rowsPerPage);
  }, [load, rowsPerPage]);

  const handleRowsPerPageChange = React.useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    const actualLimit = newRowsPerPage === -1 ? 999999 : newRowsPerPage;
    load(1, actualLimit);
  }, [load]);

  const handleDateRangeChange = React.useCallback((newRange: { from: Date; to: Date }) => {
    setRange(newRange);
    load(1, rowsPerPage);
  }, [load, rowsPerPage]);

  // helper: parse currency/number-like strings safely
  const toNumber = (s: string): number => {
    if (!s) return 0;
    const n = Number.parseFloat(String(s).replace(/[$,]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading discount report..." className="text-center" />
      </div>
    );
  }

  // Create table data for UI (flat structure)
  const netTotal = discounts.reduce((sum, r) => sum + toNumber(r.netDollar), 0);
  const priceTotal = discounts.reduce((sum, r) => sum + toNumber(r.price), 0);

  const tableData = [
    ...discounts,
    {
      customer: '',
      code: '',
      description: '',
      pf: '',
      qty: '',
      pfPercent: '',
      enrolDollar: '',
      customerPercent: '',
      itemDollar: '',
      netDollar: `$${netTotal.toFixed(2)}`,
      price: `$${priceTotal.toFixed(2)}`,
      isTotal: true,
    } as DiscountRow & { isTotal?: boolean },
  ];

  const discountColumns = [
    { 
      accessorKey: "customer", 
      header: "Customer",
      cell: ({ row }: { row: { original: DiscountRow & { isTotal?: boolean } } }) => {
        const value = row.original.customer;
        return row.original.isTotal ? '' : (
          <span className="font-semibold whitespace-normal break-words">{value || '-'}</span>
        );
      }
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }: { row: { original: DiscountRow & { isTotal?: boolean } } }) => {
        const value = row.original.code;
        return row.original.isTotal ? '' : (value || '-');
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: { row: { original: DiscountRow & { isTotal?: boolean } } }) => {
        const value = row.original.description;
        return row.original.isTotal ? '' : <span className="truncate max-w-[150px] block" title={value || ''}>{value || '-'}</span>;
      },
    },
    {
      accessorKey: "pf",
      header: "PF",
      cell: ({ row }: { row: { original: DiscountRow & { isTotal?: boolean } } }) => {
        const value = row.original.pf;
        return row.original.isTotal ? '' : <span className="text-right block">{value || '-'}</span>;
      },
    },
    {
      accessorKey: "qty",
      header: "Qty",
      cell: ({ row }: { row: { original: DiscountRow & { isTotal?: boolean } } }) => {
        const value = row.original.qty;
        return row.original.isTotal ? '' : <span className="text-right block">{value || '-'}</span>;
      },
    },
    {
      accessorKey: "pfPercent",
      header: "PF(%)",
      cell: ({ row }: { row: { original: DiscountRow & { isTotal?: boolean } } }) => {
        const value = row.original.pfPercent;
        return row.original.isTotal ? '' : <span className="text-right block">{value || '-'}</span>;
      },
    },
    {
      accessorKey: "enrolDollar",
      header: "Enrol($)",
      cell: ({ row }: { row: { original: DiscountRow & { isTotal?: boolean } } }) => {
        const value = row.original.enrolDollar;
        return row.original.isTotal ? '' : <span className="text-right block">{value || '-'}</span>;
      },
    },
    {
      accessorKey: "customerPercent",
      header: "Customer(%)",
      cell: ({ row }: { row: { original: DiscountRow & { isTotal?: boolean } } }) => {
        const value = row.original.customerPercent;
        return row.original.isTotal ? '' : <span className="text-right block">{value || '-'}</span>;
      },
    },
    {
      accessorKey: "itemDollar",
      header: "Item($)",
      cell: ({ row }: { row: { original: DiscountRow & { isTotal?: boolean } } }) => {
        const value = row.original.itemDollar;
        return row.original.isTotal ? '' : <span className="text-right block">{value || '-'}</span>;
      },
    },
    {
      accessorKey: "netDollar",
      header: "Net($)",
      cell: ({ row }: { row: { original: DiscountRow & { isTotal?: boolean } } }) => {
        const value = row.original.netDollar;
        return <span className={`text-right block ${row.original.isTotal ? 'font-bold' : ''}`}>{value || '-'}</span>;
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: { row: { original: DiscountRow & { isTotal?: boolean } } }) => {
        const value = row.original.price;
        return <span className={`text-right block ${row.original.isTotal ? 'font-bold' : ''}`}>{value || '-'}</span>;
      },
    },
  ];

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Group discounts by customer for print view
    const groupedDiscounts = discounts.reduce((acc, discount) => {
      const customer = discount.customer || 'Unknown';
      if (!acc[customer]) {
        acc[customer] = [];
      }
      acc[customer].push(discount);
      return acc;
    }, {} as Record<string, DiscountRow[]>);

    // Build print rows with customer grouping and subtotals
    const printRows: string[] = [];
    let grandTotal = 0;
    let grandPriceTotal = 0;

    Object.entries(groupedDiscounts).forEach(([customer, customerDiscounts]) => {
      // Add customer group header
      printRows.push(`
        <tr style="background-color: #f8f9fa; font-weight: bold;">
          <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;" colspan="11">${customer}</td>
        </tr>
      `);

      // Add customer's discount rows
      customerDiscounts.forEach((discount) => {
        printRows.push(`
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${discount.code || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${discount.description || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${discount.pf || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${discount.qty || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${discount.pfPercent || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${discount.enrolDollar || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${discount.customerPercent || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${discount.itemDollar || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${discount.netDollar || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${discount.price || ''}</td>
          </tr>
        `);
      });

      // Calculate and add customer subtotal
      const customerSubtotal = customerDiscounts.reduce((sum, discount) => sum + toNumber(discount.netDollar), 0);
      const customerPriceSubtotal = customerDiscounts.reduce((sum, discount) => sum + toNumber(discount.price), 0);
      grandTotal += customerSubtotal;
      grandPriceTotal += customerPriceSubtotal;
      
      printRows.push(`
        <tr style="background-color: #f0f0f0;">
          <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; text-align: right;" colspan="9">Subtotal:</td>
          <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; text-align: right;">$${customerSubtotal.toFixed(2)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; text-align: right;">$${customerPriceSubtotal.toFixed(2)}</td>
        </tr>
      `);
    });

    // Add grand total row
    printRows.push(`
      <tr style="background-color: #e0e0e0; font-weight: bold;">
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; text-align: right;" colspan="9">Total:</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; text-align: right;">$${grandTotal.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; text-align: right;">$${grandPriceTotal.toFixed(2)}</td>
      </tr>
    `);

    const discountTableRows = printRows.join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Discount Report - ${dateLabel}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 5px;
            }
            .date {
              font-size: 16px;
              margin-bottom: 20px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f0f0f0;
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
              font-weight: bold;
            }
            td {
              border: 1px solid #ddd;
              padding: 8px;
            }
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>Discount Report</h1>
          <div class="date">${dateLabel}</div>
          
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Code</th>
                <th>Description</th>
                <th style="text-align: right;">PF</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">PF(%)</th>
                <th style="text-align: right;">Enrol($)</th>
                <th style="text-align: right;">Customer(%)</th>
                <th style="text-align: right;">Item($)</th>
                <th style="text-align: right;">Net($)</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${discountTableRows}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Discount Report</h1>
            <p className="text-sm text-muted-foreground mt-1">Period: {dateLabel}</p>
          </div>
        </div>

        {/* Discount Table */}
        <Card className="p-3 md:p-4">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <CustomTable
                data={tableData}
                columns={discountColumns}
                enableSearch={false}
                enableExport={true}
                enableFilter={false}
                enablePrint={true}
                enableRowsPerPage={true}
                enableSorting={false}
                enableDateRangePicker={true}
                dateRange={range}
                onDateRangeChange={handleDateRangeChange}
                title={undefined}
                onPrint={handlePrint}
                onExport={{
                  html: exportToHtml,
                  csv: exportToCsv,
                  text: exportToText,
                  excel: exportToExcel,
                  pdf: exportToPdf,
                  json: exportToJson,
                }}
                initialRowsPerPage={rowsPerPage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                onRowsPerPageChange={handleRowsPerPageChange}
                serverSidePagination={pagination}
                onServerSidePageChange={handlePageChange}
              />
            </div>
          </div>
        </Card>
        
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
}