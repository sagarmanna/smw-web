"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { getAllLocationsData, LocationStats } from "./all-locations.api";

interface AllLocationsClientProps {
  location: string;
}

// Safely parse numbers that might come as strings like "33,550.40"
function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

// Recursively find the first array of objects in any nested response shape
function findFirstArrayOfObjects(input: unknown, maxDepth = 5): Record<string, unknown>[] | null {
  if (maxDepth < 0 || input == null) return null;
  if (Array.isArray(input)) {
    if (input.length > 0 && typeof input[0] === "object" && input[0] !== null) {
      return input as Record<string, unknown>[];
    }
    return null;
  }
  if (typeof input === "object") {
    for (const value of Object.values(input as Record<string, unknown>)) {
      const found = findFirstArrayOfObjects(value, maxDepth - 1);
      if (found) return found;
    }
  }
  return null;
}

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

export function AllLocationsClient({ location }: AllLocationsClientProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [locationData, setLocationData] = React.useState<LocationStats[]>([]);
  const [dateRange, setDateRange] = React.useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(2025, 8, 1), // Sep 1, 2025
    to: new Date(2025, 8, 30)   // Sep 30, 2025
  });

  // Fetch data from API
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fromDate = dateRange.from.toISOString().split('T')[0];
      const toDate = dateRange.to.toISOString().split('T')[0];
      
      
      
      const response = await getAllLocationsData({
        location,
        fromDate,
        toDate
      });
      
      
      
      // Handle different possible response formats
      let locationDataArray: LocationStats[] = [];
      
      // Cast response to a more flexible type for checking
      const flexibleResponse = response as unknown as Record<string, unknown>;
      
      // Try multiple common response formats
      if (response?.success && response.data && Array.isArray(response.data)) {
        // Format 1: { success: true, data: [...] }
        locationDataArray = response.data;
        
      } else if (Array.isArray(response)) {
        // Format 2: Direct array [...]
        locationDataArray = response;
        
      } else if (response?.data && Array.isArray(response.data)) {
        // Format 3: { data: [...] }
        locationDataArray = response.data;
        
      } else if (flexibleResponse?.locations && Array.isArray(flexibleResponse.locations)) {
        // Format 4: { locations: [...] }
        locationDataArray = flexibleResponse.locations as LocationStats[];
        
      } else if (flexibleResponse?.results && Array.isArray(flexibleResponse.results)) {
        // Format 5: { results: [...] }
        locationDataArray = flexibleResponse.results as LocationStats[];
        
      } else if (flexibleResponse?.items && Array.isArray(flexibleResponse.items)) {
        // Format 6: { items: [...] }
        locationDataArray = flexibleResponse.items as LocationStats[];
        
      } else if (response && typeof response === 'object') {
        // Format 7: Search through all properties for arrays
        
        for (const [key, value] of Object.entries(response)) {
          if (Array.isArray(value) && value.length > 0) {
            
            // Check if it looks like location data
            if (value[0] && typeof value[0] === 'object') {
              const firstItem = value[0];
              // Check for common location data fields
              if ('name' in firstItem || 'location' in firstItem || 'locationName' in firstItem) {
                locationDataArray = value as LocationStats[];
                
                break;
              }
            }
          }
        }
      }
      
      if (locationDataArray.length > 0) {
        // Transform data to ensure consistent field names and numeric types
        const transformedData = (locationDataArray as unknown as Record<string, unknown>[]) 
          .map((item: Record<string, unknown>) => ({
            name:
              (item.name as string) ||
              (item.location as string) ||
              (item.locationName as string) ||
              (item.location_name as string) ||
              "Unknown",
            activeEnrolments: toNumber(
              item.activeEnrolments ??
                item.active_enrolments ??
                item.activeEnrollments ??
                item.active_enrollments ??
                0
            ),
            revenue: toNumber(item.revenue),
            royalty: toNumber(item.royalty),
            advertisement: toNumber(item.advertisement),
            hst: toNumber(item.hst),
            total: toNumber(item.total),
          }));

        
        setLocationData(transformedData);
        setError(null);
      } else {
        
        
        // Check if response has any array-like properties
        if (response && typeof response === 'object') {
          
          for (const [key, value] of Object.entries(response)) {
            
            if (Array.isArray(value) && value.length > 0) {
              
              // Try to use this array as data
              if (value[0] && typeof value[0] === 'object') {
                const coerced = (value as Record<string, unknown>[]) 
                  .map((item) => ({
                    name:
                      (item.name as string) ||
                      (item.location as string) ||
                      (item.locationName as string) ||
                      (item.location_name as string) ||
                      "Unknown",
                    activeEnrolments: toNumber(
                      item.activeEnrolments ??
                        item.active_enrolments ??
                        item.activeEnrollments ??
                        item.active_enrollments ??
                        0
                    ),
                    revenue: toNumber(item.revenue),
                    royalty: toNumber(item.royalty),
                    advertisement: toNumber(item.advertisement),
                    hst: toNumber(item.hst),
                    total: toNumber(item.total),
                  }));
                
                setLocationData(coerced);
                setError(null);
                return;
              }
            }
          }
        }

        // As a last attempt, recursively search any nested array of objects
        const nested = findFirstArrayOfObjects(response);
        if (nested && nested.length > 0) {
          const coerced = nested.map((item) => ({
            name:
              (item.name as string) ||
              (item.location as string) ||
              (item.locationName as string) ||
              (item.location_name as string) ||
              "Unknown",
            activeEnrolments: toNumber(
              item.activeEnrolments ??
                item.active_enrolments ??
                item.activeEnrollments ??
                item.active_enrollments ??
                0
            ),
            revenue: toNumber(item.revenue),
            royalty: toNumber(item.royalty),
            advertisement: toNumber(item.advertisement),
            hst: toNumber(item.hst),
            total: toNumber(item.total),
          }));
          
          setLocationData(coerced);
          setError(null);
          return;
        }

        setError('API returned invalid format');
      }
    } catch (err) {
      
      setError('Error fetching data');
      console.error('Error fetching all locations data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [location, dateRange.from, dateRange.to]);

  // Fetch data on component mount and when date range changes
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate totals and add to data
  const totals = calculateTotals(Array.isArray(locationData) ? locationData : []);
  const dataWithTotals = [
    ...(Array.isArray(locationData) ? locationData : []),
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

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return (
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-4">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h1 className="text-lg font-semibold text-card-foreground">All Locations</h1>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-8 shadow-sm text-center">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(locationData) || locationData.length === 0) {
    return (
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-4">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h1 className="text-lg font-semibold text-card-foreground">All Locations</h1>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-8 shadow-sm text-center">
            <p className="text-gray-600">No data available for the selected date range</p>
            <button 
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
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
