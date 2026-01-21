"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { TestEmailRow } from "./types";

export const getTestEmailColumns = (): ColumnDef<TestEmailRow>[] => {
  return [
    {
      accessorKey: "id",
      header: () => <span className="font-medium">ID</span>,
      cell: ({ row }: { row: { original: TestEmailRow } }) => (
        <div className="flex items-center h-full">
          <span className="text-sm font-medium truncate" title={String(row.original.id)}>
            {row.original.id}
          </span>
        </div>
      ),
      enableSorting: false,
      size: 120,
      meta: { printable: true, printableName: "ID" },
    },
    {
      accessorKey: "email",
      header: () => <span className="font-medium">Email</span>,
      cell: ({ row }: { row: { original: TestEmailRow } }) => (
        <div className="flex items-center h-full">
          <span className="text-sm font-medium truncate" title={row.original.email}>
            {row.original.email}
          </span>
        </div>
      ),
      enableSorting: false,
      size: 500,
      meta: { printable: true, printableName: "Email" },
    },
  ];
};

