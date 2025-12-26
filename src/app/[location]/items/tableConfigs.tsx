import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ItemRow } from "./itemsListing.api";
import { formatCurrency } from "@/utils/formatCurrency";

export const itemColumns: ColumnDef<ItemRow>[] = [
  {
    accessorKey: "code",
    header: () => <span>Code</span>,
    cell: ({ row }: { row: { original: ItemRow } }) => (
      <span className="truncate block max-w-[150px]" title={row.original.code}>
        {row.original.code}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Code" },
  } as ColumnDef<ItemRow> & { filter: { type: string } },
  {
    accessorKey: "itemCategory",
    header: () => <span>Item Category</span>,
    cell: ({ row }: { row: { original: ItemRow } }) => (
      <span className="truncate block max-w-[200px]" title={row.original.itemCategory}>
        {row.original.itemCategory}
      </span>
    ),
    enableSorting: false,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Item Category" },
  } as ColumnDef<ItemRow> & { filter: { type: string } },
  {
    accessorKey: "description",
    header: () => <span>Description</span>,
    cell: ({ row }: { row: { original: ItemRow } }) => (
      <span className="truncate block max-w-[300px]" title={row.original.description}>
        {row.original.description}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Description" },
  } as ColumnDef<ItemRow> & { filter: { type: string } },
  {
    accessorKey: "price",
    header: () => <span>Price</span>,
    cell: ({ getValue }) => {
      const price = getValue() as number;
      return (
        <span className="truncate block max-w-[100px] font-medium">
          {formatCurrency(price)}
        </span>
      );
    },
    enableSorting: false,
    filter: undefined,
    meta: { printable: true, printableName: "Price" },
  } as ColumnDef<ItemRow> & { filter?: { type: string } },
  {
    accessorKey: "royaltyFree",
    header: () => <span>Royalty Free</span>,
    cell: ({ getValue }) => {
      const royaltyFree = getValue() as string;
      return (
        <span className="truncate block max-w-[120px]">
          {royaltyFree || "-"}
        </span>
      );
    },
    enableSorting: false,
    filter: undefined,
    meta: { printable: true, printableName: "Royalty Free" },
  } as ColumnDef<ItemRow> & { filter?: { type: string } },
  {
    accessorKey: "tax",
    header: () => <span>Tax</span>,
    cell: ({ getValue }) => {
      const tax = getValue() as string;
      return (
        <span className="truncate block max-w-[120px]">
          {tax || "-"}
        </span>
      );
    },
    enableSorting: false,
    filter: undefined,
    meta: { printable: true, printableName: "Tax" },
  } as ColumnDef<ItemRow> & { filter?: { type: string } },
  {
    accessorKey: "status",
    header: () => <span>Status</span>,
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const statusLower = status?.toLowerCase();
      const statusColor = statusLower === "enable"
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {status || "-"}
        </span>
      );
    },
    enableSorting: false,
    filter: undefined,
    meta: { printable: true, printableName: "Status" },
  } as ColumnDef<ItemRow> & { filter?: { type: string } },
];

