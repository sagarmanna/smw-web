import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { BlogRow } from "./blogs.api";
import { sanitizeBasicHtml, stripHtmlTags } from "@/utils/sanitizeHtml";

// Column definitions for blogs table
export const blogColumns: ColumnDef<BlogRow>[] = [
  {
    accessorKey: "userName",
    header: () => <span>User Name</span>,
    cell: ({ row }: { row: { original: BlogRow } }) => (
      <span 
        className="truncate block max-w-[200px]" 
        title={row.original.userName || ""}
        aria-label={`User Name: ${row.original.userName || "Unknown"}`}
      >
        {row.original.userName || "-"}
      </span>
    ),
    enableSorting: false,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "User Name" },
  } as ColumnDef<BlogRow> & { filter: { type: string } },
  {
    accessorKey: "title",
    header: () => <span>Title</span>,
    cell: ({ row }: { row: { original: BlogRow } }) => (
      <span 
        className="truncate block max-w-[300px]" 
        title={row.original.title}
        aria-label={`Blog title: ${row.original.title}`}
      >
        {row.original.title}
      </span>
    ),
    enableSorting: false,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Title" },
  } as ColumnDef<BlogRow> & { filter: { type: string } },
  {
    accessorKey: "content",
    header: () => <span>Content</span>,
    cell: ({ row }: { row: { original: BlogRow } }) => {
      const content = row.original.content || "";
      // Sanitize HTML to prevent XSS attacks
      const sanitizedContent = sanitizeBasicHtml(content);
      // Strip HTML tags for text preview in tooltip
      const textContent = stripHtmlTags(content);
      const truncatedText = textContent.length > 100 
        ? textContent.substring(0, 100) + "..." 
        : textContent;
      
      return (
        <div className="max-w-[400px]" role="textbox" aria-label="Blog content">
          <div 
            className="line-clamp-2 text-sm"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            title={truncatedText}
            aria-label={truncatedText}
          />
        </div>
      );
    },
    enableSorting: false,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Content" },
  } as ColumnDef<BlogRow> & { filter: { type: string } },
  {
    accessorKey: "date",
    header: () => <span>Date</span>,
    cell: ({ row }: { row: { original: BlogRow } }) => (
      <span 
        className="truncate block max-w-[180px]" 
        title={row.original.date}
        aria-label={`Published date: ${row.original.date}`}
      >
        {row.original.date}
      </span>
    ),
    // Only Date column should be sortable
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Date" },
  } as ColumnDef<BlogRow> & { filter: { type: string } },
];

