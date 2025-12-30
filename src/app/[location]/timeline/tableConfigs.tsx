/**
 * Timeline table column configurations
 */

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TimelineRow } from "./timelineListing.api";
import { formatISOToDisplay } from "@/utils/dateUtils";
import { startOfDay, endOfDay } from "date-fns";
import {
  processTimelineMessage,
  createTimelineLinkClickHandler,
} from "./utils/timelineMessageUtils";

interface MessageCellProps {
  row: { original: TimelineRow };
  location: string;
}

const MessageCell: React.FC<MessageCellProps> = ({ row, location }) => {
  const legacyBaseUrl = React.useMemo(() => process.env.NEXT_PUBLIC_LEGACY_URL || "", []);

  const handleLinkClick = React.useMemo(
    () => createTimelineLinkClickHandler(location, legacyBaseUrl),
    [location, legacyBaseUrl]
  );

  // Process message: make student names clickable and style invoice links
  const processedMessage = React.useMemo(() => {
    return processTimelineMessage(
      row.original.message,
      row.original.studentName,
      row.original.customerId
    );
  }, [row.original.message, row.original.customerId, row.original.studentName]);

  return (
    <div
      className="text-sm break-words"
      dangerouslySetInnerHTML={{ __html: processedMessage }}
      onClick={handleLinkClick}
      role="textbox"
      aria-label="Timeline message"
    />
  );
};

export const getTimelineColumns = (location: string): (ColumnDef<TimelineRow> & { filter?: { type: "date" | "date-range" | "string" | "dropdown"; initialValue?: unknown; options?: { value: string; label: string }[]; quickPreset?: "default" | "payments" | "timeVoucher" | "receivePayment" | "privateLessons" } })[] => [
  {
    accessorKey: "date",
    header: () => <span>Date</span>,
    cell: ({ row }: { row: { original: TimelineRow } }) => (
      <span className="text-sm whitespace-nowrap">
        {formatISOToDisplay(row.original.date)}
      </span>
    ),
    size: 180,
    filter: {
      type: "date-range",
      quickPreset: "default",
      initialValue: {
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
      },
    },
    meta: { printable: true, printableName: "Date" },
  },
  {
    accessorKey: "createdUser",
    header: () => <span>Created User</span>,
    cell: ({ row }: { row: { original: TimelineRow } }) => (
      <span className="text-sm">{row.original.createdUser}</span>
    ),
    size: 150,
    filter: {
      type: "dropdown",
      initialValue: "all",
    },
    meta: { printable: true, printableName: "Created User" },
  },
  {
    accessorKey: "message",
    header: () => <span>Message</span>,
    cell: ({ row }: { row: { original: TimelineRow } }) => {
      return <MessageCell row={row} location={location} />;
    },
    size: 500,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Message" },
  },
];

