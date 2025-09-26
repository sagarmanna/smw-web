"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface RentalRow {
  id: string;
  customer: string;
  student: string;
  startDate: string;
  returnDate: string;
  rentalTerm: string;
  equipmentReturned: "Yes" | "No";
  equipmentReturnedDate?: string;
}

interface RentalClientProps {
  location: string;
}

const columns = [
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "student", header: "Student" },
  { accessorKey: "startDate", header: "Start Date" },
  { accessorKey: "returnDate", header: "Return Date" },
  { accessorKey: "rentalTerm", header: "Rental Term" },
  { accessorKey: "equipmentReturned", header: "Equipment Returned" },
  {
    accessorKey: "equipmentReturnedDate",
    header: "Equipment Returned Date",
    cell: ({ row }: { row: { original: RentalRow } }) => 
      row.original.equipmentReturned === "Yes" 
        ? (row.original.equipmentReturnedDate ?? "") 
        : "",
  },
];

// Mock data - replace with actual API call
const mockRentals: RentalRow[] = [
  {
    id: "1",
    customer: "John Smith",
    student: "Alice Smith",
    startDate: "2024-01-15",
    returnDate: "2024-02-15",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "2",
    customer: "Jane Doe",
    student: "Bob Doe",
    startDate: "2024-01-20",
    returnDate: "2024-01-25",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-01-25",
  },
  {
    id: "3",
    customer: "Mike Johnson",
    student: "Sarah Johnson",
    startDate: "2024-01-10",
    returnDate: "2024-02-10",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "4",
    customer: "Lisa Brown",
    student: "Tom Brown",
    startDate: "2024-01-05",
    returnDate: "2024-01-12",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-01-12",
  },
  {
    id: "5",
    customer: "David Wilson",
    student: "Emma Wilson",
    startDate: "2024-01-01",
    returnDate: "2024-01-31",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "6",
    customer: "Sarah Davis",
    student: "James Davis",
    startDate: "2024-01-08",
    returnDate: "2024-01-22",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-01-22",
  },
  {
    id: "7",
    customer: "Robert Miller",
    student: "Sophia Miller",
    startDate: "2024-01-12",
    returnDate: "2024-02-12",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "8",
    customer: "Emily Garcia",
    student: "Lucas Garcia",
    startDate: "2024-01-03",
    returnDate: "2024-01-17",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-01-17",
  },
  {
    id: "9",
    customer: "Michael Rodriguez",
    student: "Isabella Rodriguez",
    startDate: "2024-01-18",
    returnDate: "2024-02-18",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "10",
    customer: "Jennifer Martinez",
    student: "Alexander Martinez",
    startDate: "2024-01-14",
    returnDate: "2024-01-28",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-01-28",
  },
  {
    id: "11",
    customer: "Christopher Lee",
    student: "Mia Lee",
    startDate: "2024-01-25",
    returnDate: "2024-02-25",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "12",
    customer: "Amanda White",
    student: "Noah White",
    startDate: "2024-01-07",
    returnDate: "2024-01-21",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-01-21",
  },
  {
    id: "13",
    customer: "Daniel Taylor",
    student: "Ava Taylor",
    startDate: "2024-01-30",
    returnDate: "2024-02-29",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "14",
    customer: "Jessica Anderson",
    student: "William Anderson",
    startDate: "2024-01-11",
    returnDate: "2024-01-25",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-01-25",
  },
  {
    id: "15",
    customer: "Matthew Thomas",
    student: "Charlotte Thomas",
    startDate: "2024-01-22",
    returnDate: "2024-02-22",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "16",
    customer: "Ashley Jackson",
    student: "Benjamin Jackson",
    startDate: "2024-01-16",
    returnDate: "2024-01-30",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-01-30",
  },
  {
    id: "17",
    customer: "Andrew Harris",
    student: "Amelia Harris",
    startDate: "2024-01-04",
    returnDate: "2024-02-04",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "18",
    customer: "Stephanie Clark",
    student: "Liam Clark",
    startDate: "2024-01-19",
    returnDate: "2024-02-02",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-02-02",
  },
  {
    id: "19",
    customer: "Kevin Lewis",
    student: "Harper Lewis",
    startDate: "2024-01-26",
    returnDate: "2024-02-26",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "20",
    customer: "Nicole Walker",
    student: "Ethan Walker",
    startDate: "2024-01-09",
    returnDate: "2024-01-23",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-01-23",
  },
  {
    id: "21",
    customer: "Ryan Hall",
    student: "Evelyn Hall",
    startDate: "2024-01-13",
    returnDate: "2024-02-13",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "22",
    customer: "Rachel Allen",
    student: "Mason Allen",
    startDate: "2024-01-06",
    returnDate: "2024-01-20",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-01-20",
  },
  {
    id: "23",
    customer: "Brandon Young",
    student: "Abigail Young",
    startDate: "2024-01-27",
    returnDate: "2024-02-27",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "24",
    customer: "Lauren King",
    student: "Logan King",
    startDate: "2024-01-17",
    returnDate: "2024-01-31",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-01-31",
  },
  {
    id: "25",
    customer: "Tyler Wright",
    student: "Elizabeth Wright",
    startDate: "2024-01-02",
    returnDate: "2024-02-02",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "26",
    customer: "Samantha Lopez",
    student: "Sebastian Lopez",
    startDate: "2024-01-24",
    returnDate: "2024-02-07",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-02-07",
  },
  {
    id: "27",
    customer: "Justin Hill",
    student: "Madison Hill",
    startDate: "2024-01-21",
    returnDate: "2024-02-21",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "28",
    customer: "Brittany Scott",
    student: "Jackson Scott",
    startDate: "2024-01-28",
    returnDate: "2024-02-11",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-02-11",
  },
  {
    id: "29",
    customer: "Nathan Green",
    student: "Avery Green",
    startDate: "2024-01-31",
    returnDate: "2024-02-28",
    rentalTerm: "Monthly",
    equipmentReturned: "No",
  },
  {
    id: "30",
    customer: "Megan Adams",
    student: "Sofia Adams",
    startDate: "2024-01-23",
    returnDate: "2024-02-06",
    rentalTerm: "Weekly",
    equipmentReturned: "Yes",
    equipmentReturnedDate: "2024-02-06",
  },
];

export function RentalClient({ location }: RentalClientProps) {
  const [rows, setRows] = React.useState<RentalRow[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setRows(mockRentals);
      setLoading(false);
    };
    loadData();
  }, [location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation 
          size="xl" 
          text="Loading rental data..." 
          className="text-center"
        />
      </div>  
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        {/* Rental Heading Card */}
        <div className="mb-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h1 className="text-lg font-semibold text-card-foreground">Rental</h1>
          </div>
        </div>
        
        {/* CustomTable with feature flags */}
        <CustomTable
          data={rows}
          columns={columns}
          
          // Feature flags - easily configurable
          enableSearch={true}
          enableExport={true}
          enableFilter={true}
          enablePagination={true}
          enablePrint={true}
          enableShowAll={true}
          
          // Search configuration
          searchPlaceholder="Search rentals..."
          getSearchValue={(r) => `${r.customer} ${r.student} ${r.rentalTerm}`}
          
          // Filter configuration
          filterOptions={[
            { 
              key: 'current', 
              label: 'Active and Current', 
              predicate: (r) => {
                const due = parseDate(r.returnDate);
                if (!due || r.equipmentReturned === 'Yes') return false;
                const delta = due.getTime() - new Date().getTime();
                return delta > 7 * 24 * 60 * 60 * 1000;
              }
            },
            { 
              key: 'overdue', 
              label: 'Active and Overdue', 
              predicate: (r) => {
                const due = parseDate(r.returnDate);
                if (!due || r.equipmentReturned === 'Yes') return false;
                const delta = due.getTime() - new Date().getTime();
                return delta < 0;
              }
            },
            { 
              key: 'expiring', 
              label: 'Active and Expiring', 
              predicate: (r) => {
                const due = parseDate(r.returnDate);
                if (!due || r.equipmentReturned === 'Yes') return false;
                const delta = due.getTime() - new Date().getTime();
                return delta >= 0 && delta <= 7 * 24 * 60 * 60 * 1000;
              }
            },
          ]}
          
          // Export configuration
          onExport={{
            html: (data) => exportToHtml(data as RentalRow[]),
            csv: (data) => exportToCsv(data as RentalRow[]),
            text: (data) => exportToText(data as RentalRow[]),
            excel: (data) => exportToExcel(data as RentalRow[]),
            pdf: (data) => exportToPdf(data as RentalRow[]),
            json: (data) => exportToJson(data as RentalRow[]),
          }}
          
          // Pagination configuration
          pageSize={10}
        />
      </div>
    </div>
  );
}

// Utility functions
const parseDate = (value?: string): Date | null => {
  if (!value || value === "-") return null;
  const normalized = value.replace(/,(?=\d)/, ", ");
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
};

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const exportToHtml = (data: RentalRow[]) => {
  const head = `<!doctype html><html><head><meta charset="utf-8"><title>Rentals</title></head><body>`;
  const tail = `</body></html>`;
  const tableRows = data.map(r => 
    `<tr><td>${r.customer}</td><td>${r.student}</td><td>${r.startDate}</td><td>${r.returnDate}</td><td>${r.rentalTerm}</td><td>${r.equipmentReturned}</td><td>${r.equipmentReturnedDate ?? ""}</td></tr>`
  ).join("");
  const html = `${head}<h3>Rentals</h3><table border="1" cellspacing="0" cellpadding="4"><thead><tr><th>Customer</th><th>Student</th><th>Start Date</th><th>Return Date</th><th>Rental Term</th><th>Equipment Returned</th><th>Equipment Returned Date</th></tr></thead><tbody>${tableRows}</tbody></table>${tail}`;
  download(new Blob([html], { type: "text/html;charset=utf-8;" }), "rentals.html");
};

const exportToCsv = (data: RentalRow[]) => {
  const headers = ["Customer", "Student", "Start Date", "Return Date", "Rental Term", "Equipment Returned", "Equipment Returned Date"];
  const lines = data.map(r => 
    [r.customer, r.student, r.startDate, r.returnDate, r.rentalTerm, r.equipmentReturned, r.equipmentReturnedDate ?? ""]
      .map(field => `"${String(field).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csvContent = [headers.join(","), ...lines].join("\r\n");
  download(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), "rentals.csv");
};

const exportToText = (data: RentalRow[]) => {
  const lines = data.map(r => 
    `${r.customer}\t${r.student}\t${r.startDate}\t${r.returnDate}\t${r.rentalTerm}\t${r.equipmentReturned}\t${r.equipmentReturnedDate ?? ""}`
  );
  download(new Blob([lines.join("\r\n")], { type: "text/plain;charset=utf-8;" }), "rentals.txt");
};

const exportToExcel = (data: RentalRow[]) => {
  const headers = ["Customer", "Student", "Start Date", "Return Date", "Rental Term", "Equipment Returned", "Equipment Returned Date"];
  const lines = data.map(r => 
    [r.customer, r.student, r.startDate, r.returnDate, r.rentalTerm, r.equipmentReturned, r.equipmentReturnedDate ?? ""]
      .map(field => `"${String(field).replace(/"/g, '""')}"`)
      .join(",")
  );
  const excelContent = [headers.join(","), ...lines].join("\r\n");
  download(new Blob([excelContent], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;" }), "rentals.xlsx");
};

const exportToPdf = (data: RentalRow[]) => {
  const tableRows = data.map(r => 
    `<tr><td>${r.customer}</td><td>${r.student}</td><td>${r.startDate}</td><td>${r.returnDate}</td><td>${r.rentalTerm}</td><td>${r.equipmentReturned}</td><td>${r.equipmentReturnedDate ?? ""}</td></tr>`
  ).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Rentals PDF</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px;text-align:left}</style></head><body><h3>Rentals</h3><table><thead><tr><th>Customer</th><th>Student</th><th>Start Date</th><th>Return Date</th><th>Rental Term</th><th>Equipment Returned</th><th>Equipment Returned Date</th></tr></thead><tbody>${tableRows}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url);
  if (!w) download(blob, "rentals.html");
};

const exportToJson = (data: RentalRow[]) => {
  download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" }), "rentals.json");
};
