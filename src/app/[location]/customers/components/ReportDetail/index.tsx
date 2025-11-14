"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { getCustomerById, getCustomerInfo } from "../../customers.api";
import { getReportOutstandingInvoices, getReportPrepaidLessons, getReportAvailableCredits, OutstandingInvoiceRaw, PrepaidLessonRaw, AvailableCreditRaw } from "./report-detail-api";
import { useRouter } from "next/navigation";
import { DetailHeader } from "@/components/DetailHeader";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

// Data interfaces
interface OutstandingInvoice {
  id: string;
  date: string;
  owing: number;
}

interface PrepaidLesson {
  id: string;
  lessonDate: string;
  status: string;
  paid: number;
}

interface UnusedCredit {
  id: string;
  date: string;
  amount: number;
}

interface ReportDetailProps {
  customerId: string;
  customerName: string;
  location: string;
}

export function ReportDetail({ customerId, customerName, location }: ReportDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [customerDisplayName, setCustomerDisplayName] = React.useState<string>(customerName);
  const [outstandingInvoices, setOutstandingInvoices] = React.useState<OutstandingInvoice[]>([]);
  const [prepaidLessons, setPrepaidLessons] = React.useState<PrepaidLesson[]>([]);
  const [unusedCredits, setUnusedCredits] = React.useState<UnusedCredit[]>([]);

  // Pagination state per table
  const [outstandingPage, setOutstandingPage] = React.useState(1);
  const [outstandingLimit, setOutstandingLimit] = React.useState(10);
  const [outstandingMeta, setOutstandingMeta] = React.useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const [prepaidPage, setPrepaidPage] = React.useState(1);
  const [prepaidLimit, setPrepaidLimit] = React.useState(10);
  const [prepaidMeta, setPrepaidMeta] = React.useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const [creditsPage, setCreditsPage] = React.useState(1);
  const [creditsLimit, setCreditsLimit] = React.useState(10);
  const [creditsMeta, setCreditsMeta] = React.useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  // Column definitions for Outstanding Invoices
  const outstandingInvoicesColumns: ColumnDef<OutstandingInvoice>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.id}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => row.original.date,
    },
    {
      accessorKey: "owing",
      header: "Owing",
      cell: ({ row }) => {
        const amount = row.original.owing;
        return (
          <div className="text-right font-medium">
            {formatCurrency(amount)}
          </div>
        );
      },
    },
  ];

  // Column definitions for Prepaid Lessons
  const prepaidLessonsColumns: ColumnDef<PrepaidLesson>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.id}</div>
      ),
    },
    {
      accessorKey: "lessonDate",
      header: "Lesson Date",
      cell: ({ row }) => row.original.lessonDate,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => 
        
          row.original.status,
        
      
    },
    {
      accessorKey: "paid",
      header: "Paid",
      cell: ({ row }) => {
        const amount = row.original.paid;
        return (
          <div className="text-right font-medium">
            {formatCurrency(amount)}
          </div>
        );
      },
    },
  ];

  // Column definitions for Unused Credits
  const unusedCreditsColumns: ColumnDef<UnusedCredit>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.id}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => row.original.date,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.original.amount;
        return (
          <div className="text-right font-medium">
            {formatCurrency(amount)}
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load customer name (prefer info endpoint)
        const info = await getCustomerInfo(location, Number(customerId));
        if (info?.success && info.data?.profile?.name) {
          setCustomerDisplayName(info.data.profile.name);
        } else {
          const customerData = await getCustomerById(location, Number(customerId));
          if (customerData) {
            const fullName = [customerData.firstName, customerData.lastName].filter(Boolean).join(" ");
            setCustomerDisplayName(fullName || customerName || String(customerId));
          } else {
            setCustomerDisplayName(customerName || String(customerId));
          }
        }

        // Load outstanding invoices (Report Detail mapping)
        const outstanding = await getReportOutstandingInvoices(
          location,
          Number(customerId),
          outstandingPage,
          outstandingLimit
        );
        const formattedOutstanding = (outstanding.data || []).map((row: OutstandingInvoiceRaw) => ({
          id: row.id,
          date: row.date,
          owing: typeof row.balanceDue === 'number'
            ? row.balanceDue
            : parseCurrencyToNumber(String(row.balanceDue ?? row.owing ?? 0))
        }));
        setOutstandingInvoices(formattedOutstanding);
        setOutstandingMeta(outstanding.pagination);

        // Load prepaid lessons
        const prepaid = await getReportPrepaidLessons(
          location,
          Number(customerId),
          prepaidPage,
          prepaidLimit
        );
        const formattedPrepaid = (prepaid.data || []).map((row: PrepaidLessonRaw) => ({
          id: String(row.lessonId),
          lessonDate: row.lessonDate,
          status: row.status,
          paid: parseCurrencyToNumber(row.paid)
        }));
        setPrepaidLessons(formattedPrepaid);
        setPrepaidMeta(prepaid.pagination);

        // Load available credits (unused credits)
        const credits = await getReportAvailableCredits(
          location,
          Number(customerId),
          creditsPage,
          creditsLimit
        );
        const formattedCredits = (credits.data || []).map((row: AvailableCreditRaw) => ({
          id: row.id,
          date: row.date,
          amount: parseCurrencyToNumber(row.amount)
        }));
        setUnusedCredits(formattedCredits);
        setCreditsMeta(credits.pagination);

      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location, customerId, outstandingPage, outstandingLimit, prepaidPage, prepaidLimit, creditsPage, creditsLimit]);

  // Calculate totals
  const outstandingTotal = outstandingInvoices.reduce((sum, invoice) => sum + invoice.owing, 0);
  const prepaidTotal = prepaidLessons.reduce((sum, lesson) => sum + lesson.paid, 0);
  const unusedTotal = unusedCredits.reduce((sum, credit) => sum + credit.amount, 0);
  const netTotal = outstandingTotal - (prepaidTotal + unusedTotal);
 

  const handlePrint = async () => {
    const safe = (v: unknown) => (v === null || v === undefined ? "" : String(v));

    // Open early to avoid popup blockers and show a preparing state
    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow popups for this site to print");
      return;
    }
    try { win.opener = null; } catch {}
    win.document.open();
    win.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>Preparing…</title><style>
      body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111827}
    </style></head><body><div>Preparing print view…</div></body></html>`);
    win.document.close();

    // Fetch ALL rows for each section in one request if supported
    const outstandingLimitAll = outstandingMeta?.total ? Math.max(outstandingMeta.total, 1) : 1000;
    const prepaidLimitAll = prepaidMeta?.total ? Math.max(prepaidMeta.total, 1) : 1000;
    const creditsLimitAll = creditsMeta?.total ? Math.max(creditsMeta.total, 1) : 1000;

    const [outstandingAllResp, prepaidAllResp, creditsAllResp] = await Promise.all([
      getReportOutstandingInvoices(location, Number(customerId), 1, outstandingLimitAll),
      getReportPrepaidLessons(location, Number(customerId), 1, prepaidLimitAll),
      getReportAvailableCredits(location, Number(customerId), 1, creditsLimitAll),
    ]);

    const allOutstanding: OutstandingInvoice[] = (outstandingAllResp.data || []).map((row: OutstandingInvoiceRaw) => ({
      id: row.id,
      date: row.date,
      owing: typeof row.balanceDue === 'number'
        ? row.balanceDue
        : parseCurrencyToNumber(String(row.balanceDue ?? row.owing ?? 0))
    }));
    const allPrepaid: PrepaidLesson[] = (prepaidAllResp.data || []).map((row: PrepaidLessonRaw) => ({
      id: String(row.lessonId),
      lessonDate: row.lessonDate,
      status: row.status,
      paid: parseCurrencyToNumber(row.paid)
    }));
    const allCredits: UnusedCredit[] = (creditsAllResp.data || []).map((row: AvailableCreditRaw) => ({
      id: row.id,
      date: row.date,
      amount: parseCurrencyToNumber(row.amount)
    }));

    const outstandingTotalAll = allOutstanding.reduce((sum, r) => sum + r.owing, 0);
    const prepaidTotalAll = allPrepaid.reduce((sum, r) => sum + r.paid, 0);
    const unusedTotalAll = allCredits.reduce((sum, r) => sum + r.amount, 0);
    const netTotalAll = outstandingTotalAll - (prepaidTotalAll + unusedTotalAll);

    const section = (title: string, headers: string[], rowsHtml: string, footerHtml?: string) => `
      <h2 style="font-size:14px;font-weight:700;margin:18px 0 8px;">${title}</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            ${headers
              .map(
                (h) =>
                  `<th style="border:1px solid #000;padding:6px 8px;background:#f3f4f6;text-align:left;">${h}</th>`
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          ${footerHtml ? footerHtml : ""}
        </tbody>
      </table>
    `;
    const outstandingRows = allOutstanding
      .map(
        (r) => `
          <tr>
            <td style="border:1px solid #000;padding:6px 8px;">${safe(r.id)}</td>
            <td style="border:1px solid #000;padding:6px 8px;">${safe(r.date)}</td>
            <td style="border:1px solid #000;padding:6px 8px;text-align:right;">${formatCurrency(r.owing)}</td>
          </tr>
        `
      )
      .join("");
    const outstandingFooter = `
      <tr>
        <td style="border:1px solid #000;padding:6px 8px;font-weight:700;">Total:</td>
        <td style="border:1px solid #000;padding:6px 8px;"></td>
        <td style="border:1px solid #000;padding:6px 8px;text-align:right;font-weight:700;">${formatCurrency(outstandingTotalAll)}</td>
      </tr>
    `;
    const prepaidRows = allPrepaid
      .map(
        (r) => `
          <tr>
            <td style="border:1px solid #000;padding:6px 8px;">${safe(r.id)}</td>
            <td style="border:1px solid #000;padding:6px 8px;">${safe(r.lessonDate)}</td>
            <td style="border:1px solid #000;padding:6px 8px;">${safe(r.status)}</td>
            <td style="border:1px solid #000;padding:6px 8px;text-align:right;">${formatCurrency(r.paid)}</td>
          </tr>
        `
      )
      .join("");
    const prepaidFooter = `
      <tr>
        <td style="border:1px solid #000;padding:6px 8px;font-weight:700;">Total:</td>
        <td style="border:1px solid #000;padding:6px 8px;"></td>
        <td style="border:1px solid #000;padding:6px 8px;"></td>
        <td style="border:1px solid #000;padding:6px 8px;text-align:right;font-weight:700;">${formatCurrency(prepaidTotalAll)}</td>
      </tr>
    `;
    const creditsRows = allCredits
      .map(
        (r) => `
          <tr>
            <td style="border:1px solid #000;padding:6px 8px;">${safe(r.id)}</td>
            <td style="border:1px solid #000;padding:6px 8px;">${safe(r.date)}</td>
            <td style="border:1px solid #000;padding:6px 8px;text-align:right;">${formatCurrency(r.amount)}</td>
          </tr>
        `
      )
      .join("");
    const creditsFooter = `
      <tr>
        <td style="border:1px solid #000;padding:6px 8px;"></td>
        <td style="border:1px solid #000;padding:6px 8px;font-weight:700;">Total:</td>
        <td style="border:1px solid #000;padding:6px 8px;text-align:right;font-weight:700;">${formatCurrency(unusedTotalAll)}</td>
      </tr>
    `;
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Account - ${customerDisplayName || customerName}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color:#111827; padding:18px; }
            h1 { font-size:18px; margin:0 0 12px; }
            @media print { @page { margin: 12mm; } body { padding: 8px; } }
          </style>
        </head>
        <body>
          <h1>${safe(customerDisplayName || customerName)}</h1>
          ${section("Outstanding Invoices", ["ID", "Date", "Owing"], outstandingRows, outstandingFooter)}
          ${section("Prepaid Lessons", ["ID", "Lesson Date", "Status", "Paid"], prepaidRows, prepaidFooter)}
          ${section("Unused Credits", ["ID", "Date", "Amount"], creditsRows, creditsFooter)}
          <div style="text-align:right;margin-top:14px;font-size:14px;font-weight:800;">
            ${formatCurrency(netTotalAll)}
          </div>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { try { win.print(); } catch {} }, 200);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  const parseCurrencyToNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const cleaned = value.replace(/[$,]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading report data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      {/* Header */}
      <div className="mb-4">
        <DetailHeader
          breadcrumbItems={[
            { label: "Customers", onClick: () => router.push(`/${location}/customers`) },
            { label: customerDisplayName || customerName || String(customerId), onClick: () => router.push(`/${location}/customers/${customerId}`) },
          ]}
          currentPageTitle="Account"
          showActions={false}
          rightContent={
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9 sm:h-10 sm:w-10"
              onClick={handlePrint}
              aria-label="Print"
            >
              <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          }
        />
      </div>

      {/* Outstanding Invoices Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Outstanding Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomTable
            columns={outstandingInvoicesColumns}
            data={outstandingInvoices}
            size="compact"
            variant="striped"
            enableSorting={true}
            enableExport={false}
            enablePrint={false}
            enableSearch={false}
            enableFilter={false}
            enableRowsPerPage={true}
            rowsPerPage={outstandingLimit}
            onRowsPerPageChange={(n) => { setOutstandingLimit(n); setOutstandingPage(1); }}
            serverSidePagination={outstandingMeta}
            onServerSidePageChange={(p) => setOutstandingPage(p)}
            hideRecordCount={false}
            footerRow={{
              id: "Total:",
              date: "",
              owing: outstandingTotal
            }}
            isLoading={loading}
          />
        </CardContent>
      </Card>

      {/* Prepaid Lessons Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Prepaid Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomTable
            columns={prepaidLessonsColumns}
            data={prepaidLessons}
            size="compact"
            variant="striped"
            enableSorting={true}
            enableExport={false}
            enablePrint={false}
            enableSearch={false}
            enableFilter={false}
            enableRowsPerPage={true}
            rowsPerPage={prepaidLimit}
            onRowsPerPageChange={(n) => { setPrepaidLimit(n); setPrepaidPage(1); }}
            serverSidePagination={prepaidMeta}
            onServerSidePageChange={(p) => setPrepaidPage(p)}
            hideRecordCount={false}
            footerRow={{
              id: "Total:",
              lessonDate: "",
              status: "",
              paid: prepaidTotal
            }}
            isLoading={loading}
          />
        </CardContent>
      </Card>

      {/* Unused Credits Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Unused Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomTable
            columns={unusedCreditsColumns}
            data={unusedCredits}
            size="compact"
            variant="striped"
            enableSorting={true}
            enableExport={false}
            enablePrint={false}
            enableSearch={false}
            enableFilter={false}
            enableRowsPerPage={true}
            rowsPerPage={creditsLimit}
            onRowsPerPageChange={(n) => { setCreditsLimit(n); setCreditsPage(1); }}
            serverSidePagination={creditsMeta}
            onServerSidePageChange={(p) => setCreditsPage(p)}
            hideRecordCount={false}
            footerRow={{
              id: "",
              date: "Total:",
              amount: unusedTotal
            }}
            isLoading={loading}
          />
          <div className="mt-4 text-right text-lg font-bold">
            {formatCurrency(netTotal)}
          </div>
        </CardContent>
      </Card>

        
      </div>
  );
}