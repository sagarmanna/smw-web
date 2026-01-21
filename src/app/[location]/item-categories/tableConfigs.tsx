import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ItemCategoryRow } from "./itemCategories.api";

export const itemCategoryColumns: ColumnDef<ItemCategoryRow>[] = [
  {
    accessorKey: "name",
    header: () => <span>Name</span>,
    cell: ({ row }: { row: { original: ItemCategoryRow } }) => (
      <span className="truncate block max-w-[520px]" title={row.original.name}>
        {row.original.name}
      </span>
    ),
    enableSorting: true,
    meta: { printable: true, printableName: "Name" },
  },
];


