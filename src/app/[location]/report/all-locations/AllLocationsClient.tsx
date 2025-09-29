"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface LocationStats {
  name: string;
  activeEnrolments: number;
  revenue: number;
  royalty: number;
  advertisement: number;
  hst: number;
  total: number;
}

interface AllLocationsClientProps {
  location: string;
}

// Mock data based on the image
const mockLocationData: LocationStats[] = [
  {
    name: "Bolton",
    activeEnrolments: 175,
    revenue: 0.00,
    royalty: 0.00,
    advertisement: 0.00,
    hst: 0.00,
    total: 0.00
  },
  {
    name: "Woodbridge",
    activeEnrolments: 416,
    revenue: 33550.40,
    royalty: 2013.02,
    advertisement: 671.01,
    hst: 348.92,
    total: 3032.96
  },
  {
    name: "Maple",
    activeEnrolments: 240,
    revenue: 23565.26,
    royalty: 1413.92,
    advertisement: 471.31,
    hst: 245.08,
    total: 2130.30
  },
  {
    name: "Burlington",
    activeEnrolments: 233,
    revenue: 18934.10,
    royalty: 1136.05,
    advertisement: 378.68,
    hst: 196.91,
    total: 1711.64
  },
  {
    name: "Richmond Hill",
    activeEnrolments: 358,
    revenue: 39010.03,
    royalty: 2340.60,
    advertisement: 780.20,
    hst: 405.70,
    total: 3526.51
  },
  {
    name: "Markham",
    activeEnrolments: 239,
    revenue: 25571.18,
    royalty: 1534.27,
    advertisement: 511.42,
    hst: 265.94,
    total: 2311.63
  },
  {
    name: "Newmarket",
    activeEnrolments: 186,
    revenue: 22773.02,
    royalty: 1366.38,
    advertisement: 455.46,
    hst: 236.84,
    total: 2058.68
  },
  {
    name: "South Brampton",
    activeEnrolments: 0,
    revenue: 0.00,
    royalty: 0.00,
    advertisement: 0.00,
    hst: 0.00,
    total: 0.00
  },
  {
    name: "North Brampton",
    activeEnrolments: 392,
    revenue: 33948.35,
    royalty: 2036.90,
    advertisement: 678.97,
    hst: 353.06,
    total: 3068.93
  },
  {
    name: "West Brampton",
    activeEnrolments: 482,
    revenue: 51782.85,
    royalty: 3106.97,
    advertisement: 1035.66,
    hst: 538.54,
    total: 4681.17
  },
  {
    name: "Nobleton",
    activeEnrolments: 118,
    revenue: 9451.05,
    royalty: 567.06,
    advertisement: 189.02,
    hst: 98.29,
    total: 854.37
  }
];

// Calculate totals
const calculateTotals = (data: LocationStats[]) => {
  return data.reduce(
    (totals, location) => ({
      activeEnrolments: totals.activeEnrolments + location.activeEnrolments,
      revenue: totals.revenue + location.revenue,
      royalty: totals.royalty + location.royalty,
      advertisement: totals.advertisement + location.advertisement,
      hst: totals.hst + location.hst,
      total: totals.total + location.total
    }),
    {
      activeEnrolments: 0,
      revenue: 0,
      royalty: 0,
      advertisement: 0,
      hst: 0,
      total: 0
    }
  );
};

const totals = calculateTotals(mockLocationData);

// Add totals row to data
const dataWithTotals = [
  ...mockLocationData,
  {
    name: "TOTAL",
    activeEnrolments: totals.activeEnrolments,
    revenue: totals.revenue,
    royalty: totals.royalty,
    advertisement: totals.advertisement,
    hst: totals.hst,
    total: totals.total
  }
];

const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: { row: { original: LocationStats } }) => (
      <div className={`font-medium ${row.original.name === "TOTAL" ? "font-bold" : ""}`}>
        {row.original.name}
      </div>
    )
  },
  {
    accessorKey: "activeEnrolments",
    header: "Active Enrolments",
    cell: ({ row }: { row: { original: LocationStats } }) => (
      <div className={`${row.original.name === "TOTAL" ? "font-bold" : ""}`}>
        {row.original.activeEnrolments.toLocaleString()}
      </div>
    )
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }: { row: { original: LocationStats } }) => (
      <div className={`${row.original.name === "TOTAL" ? "font-bold" : ""}`}>
        ${row.original.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    )
  },
  {
    accessorKey: "royalty",
    header: "Royalty",
    cell: ({ row }: { row: { original: LocationStats } }) => (
      <div className={`${row.original.name === "TOTAL" ? "font-bold" : ""}`}>
        ${row.original.royalty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    )
  },
  {
    accessorKey: "advertisement",
    header: "Advertisement",
    cell: ({ row }: { row: { original: LocationStats } }) => (
      <div className={`${row.original.name === "TOTAL" ? "font-bold" : ""}`}>
        ${row.original.advertisement.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    )
  },
  {
    accessorKey: "hst",
    header: "HST",
    cell: ({ row }: { row: { original: LocationStats } }) => (
      <div className={`${row.original.name === "TOTAL" ? "font-bold" : ""}`}>
        ${row.original.hst.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    )
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }: { row: { original: LocationStats } }) => (
      <div className={`${row.original.name === "TOTAL" ? "font-bold" : ""}`}>
        ${row.original.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    )
  }
];

export function AllLocationsClient({ location: _location }: AllLocationsClientProps) {
  const [isLoading] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(2025, 7, 1), // Aug 1, 2025
    to: new Date(2025, 7, 31)   // Aug 31, 2025
  });


  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        {/* All Locations Heading Card */}
        <div className="mb-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h1 className="text-lg font-semibold text-card-foreground">All Locations</h1>
          </div>
        </div>
        
        {/* CustomTable with DateRangePicker inside */}
        <CustomTable
          data={dataWithTotals}
          columns={columns}
          
          // Feature flags - easily configurable
          enableSearch={false} // Disable search input
          enableExport={true} // Enable export icons
          enableFilter={false}
          enablePagination={false} // Show all pages by default
          enablePrint={true} // Enable print
          enableShowAll={true}
          enableDateRangePicker={true} // Enable DateRangePicker
          
          // DateRangePicker configuration
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          
          // Export configuration
          onExport={{
            html: (data) => exportToHtml(data as LocationStats[]),
            csv: (data) => exportToCsv(data as LocationStats[]),
            text: (data) => exportToText(data as LocationStats[]),
            excel: (data) => exportToExcel(data as LocationStats[]),
            pdf: (data) => exportToPdf(data as LocationStats[]),
            json: (data) => exportToJson(data as LocationStats[]),
          }}
        />
      </div>
    </div>
  );
}

// Utility functions for export
const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const exportToHtml = (data: LocationStats[]) => {
  const head = `<!doctype html><html><head><meta charset="utf-8"><title>All Locations Report</title></head><body>`;
  const tail = `</body></html>`;
  const tableRows = data.map(location => 
    `<tr><td>${location.name}</td><td>${location.activeEnrolments.toLocaleString()}</td><td>$${location.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td>$${location.royalty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td>$${location.advertisement.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td>$${location.hst.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td>$${location.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>`
  ).join("");
  const html = `${head}<h3>All Locations Report</h3><table border="1" cellspacing="0" cellpadding="4"><thead><tr><th>Name</th><th>Active Enrolments</th><th>Revenue</th><th>Royalty</th><th>Advertisement</th><th>HST</th><th>Total</th></tr></thead><tbody>${tableRows}</tbody></table>${tail}`;
  download(new Blob([html], { type: "text/html;charset=utf-8;" }), "all-locations.html");
};

const exportToCsv = (data: LocationStats[]) => {
  const headers = ["Name", "Active Enrolments", "Revenue", "Royalty", "Advertisement", "HST", "Total"];
  const lines = data.map(location => 
    [location.name, location.activeEnrolments, location.revenue, location.royalty, location.advertisement, location.hst, location.total]
      .map(field => `"${String(field).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csvContent = [headers.join(","), ...lines].join("\r\n");
  download(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), "all-locations.csv");
};

const exportToText = (data: LocationStats[]) => {
  const lines = data.map(location => 
    `${location.name}\t${location.activeEnrolments}\t${location.revenue}\t${location.royalty}\t${location.advertisement}\t${location.hst}\t${location.total}`
  );
  download(new Blob([lines.join("\r\n")], { type: "text/plain;charset=utf-8;" }), "all-locations.txt");
};

const exportToExcel = (data: LocationStats[]) => {
  const headers = ["Name", "Active Enrolments", "Revenue", "Royalty", "Advertisement", "HST", "Total"];
  const lines = data.map(location => 
    [location.name, location.activeEnrolments, location.revenue, location.royalty, location.advertisement, location.hst, location.total]
      .map(field => `"${String(field).replace(/"/g, '""')}"`)
      .join(",")
  );
  const excelContent = [headers.join(","), ...lines].join("\r\n");
  download(new Blob([excelContent], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;" }), "all-locations.xlsx");
};

const exportToPdf = (data: LocationStats[]) => {
  const tableRows = data.map(location => 
    `<tr><td>${location.name}</td><td>${location.activeEnrolments.toLocaleString()}</td><td>$${location.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td>$${location.royalty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td>$${location.advertisement.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td>$${location.hst.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td>$${location.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>`
  ).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>All Locations Report PDF</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px;text-align:left}</style></head><body><h3>All Locations Report</h3><table><thead><tr><th>Name</th><th>Active Enrolments</th><th>Revenue</th><th>Royalty</th><th>Advertisement</th><th>HST</th><th>Total</th></tr></thead><tbody>${tableRows}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url);
  if (!w) download(blob, "all-locations.html");
};

const exportToJson = (data: LocationStats[]) => {
  download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" }), "all-locations.json");
};
