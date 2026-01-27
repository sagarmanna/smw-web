/**
 * Classrooms table column configurations
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ClassroomRow } from "./classrooms.api";

export const classroomColumns: ColumnDef<ClassroomRow>[] = [
  {
    accessorKey: "name",
    header: () => <span>Shortname</span>,
    cell: ({ row }: { row: { original: ClassroomRow } }) => (
      <span className="text-sm">{row.original.name}</span>
    ),
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Shortname" },
  } as ColumnDef<ClassroomRow> & { filter: { type: string; initialValue?: string } },
  {
    accessorKey: "description",
    header: () => <span>Longname</span>,
    cell: ({ row }: { row: { original: ClassroomRow } }) => (
      <span className="text-sm">{row.original.description || ""}</span>
    ),
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Longname" },
  } as ColumnDef<ClassroomRow> & { filter: { type: string; initialValue?: string } },
];

