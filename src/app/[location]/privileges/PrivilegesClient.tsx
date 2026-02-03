"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components/CustomTable";
import { Check, X } from "lucide-react";

export interface PrivilegeRow {
  privilege: string;
  staff: boolean;
}

const INITIAL_PRIVILEGES: PrivilegeRow[] = [
  { privilege: "Manage Account Receivable Report", staff: false },
  { privilege: "Manage birthdays", staff: true },
  { privilege: "Manage discount report", staff: false },
  { privilege: "Manage Enrolment Gains", staff: false },
  { privilege: "Manage Enrolment Losses", staff: false },
  { privilege: "Manage Instruction Hours", staff: false },
  { privilege: "Manage item category Report", staff: true },
  { privilege: "Manage item report", staff: true },
  { privilege: "Manage items by customer report", staff: true },
  { privilege: "Manage Monthly Revenue", staff: false },
  { privilege: "Manage Payment report", staff: true },
  { privilege: "Manage Recurring Payment", staff: false },
  { privilege: "Manage reports", staff: true },
  { privilege: "Manage royalty report", staff: false },
  { privilege: "Manage Royalty free item report", staff: true },
];

interface PrivilegesClientProps {
  location: string;
}

export function PrivilegesClient({ location }: PrivilegesClientProps) {
  const [data, setData] = React.useState<PrivilegeRow[]>(INITIAL_PRIVILEGES);

  const handleToggleStaff = React.useCallback((privilege: string) => {
    setData((prev) =>
      prev.map((row) =>
        row.privilege === privilege ? { ...row, staff: !row.staff } : row
      )
    );
  }, []);

  const columns = React.useMemo(
    (): ColumnDef<PrivilegeRow>[] => [
      {
        accessorKey: "privilege",
        header: () => <span>Privilege</span>,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.privilege}</span>
        ),
        size: 400,
      },
      {
        accessorKey: "staff",
        header: () => <span className="block text-center">Staff</span>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStaff(row.original.privilege);
              }}
              className="p-1 rounded hover:bg-muted focus:outline-none focus:ring-0 border-0 border-none"
              aria-label={row.original.staff ? "Granted (click to deny)" : "Denied (click to grant)"}
            >
              {row.original.staff ? (
                <Check className="h-5 w-5 text-foreground" />
              ) : (
                <X className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        ),
        size: 120,
      },
    ],
    [handleToggleStaff]
  );

  return (
    <div className="w-full">
      <CustomTable<PrivilegeRow, unknown>
        data={data}
        columns={columns}
        title="Permissions"
        size="compact"
        variant="default"
        enableSearch={false}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={false}
        enableColumnFilters={false}
        enableSorting={false}
      />
    </div>
  );
}
