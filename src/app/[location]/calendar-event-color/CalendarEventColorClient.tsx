"use client";

import * as React from "react";
import { CalendarEventColorForm } from "./components/CalendarEventColorForm";
import { getCalendarEventColors, saveCalendarEventColors, type CalendarEventColorItem, type CalendarEventColorUpdateItem } from "./calendarEventColor.api";

interface CalendarEventColorClientProps {
  location: string;
}

export function CalendarEventColorClient({ location }: CalendarEventColorClientProps) {
  const [items, setItems] = React.useState<CalendarEventColorItem[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchColors = async () => {
      setIsLoading(true);
      try {
        const fetched = await getCalendarEventColors(location);
        setItems(fetched);
      } catch (error) {
        console.error("Failed to fetch calendar event colors:", error);
        setItems(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColors();
  }, [location]);

  const handleSubmit = async (nextItems: CalendarEventColorItem[]) => {
    const colorsPayload: CalendarEventColorUpdateItem[] = nextItems.map((it) => ({
      id: it.id,
      code: it.color,
    }));

    const result = await saveCalendarEventColors(location, colorsPayload);
    if (!result.success) {
      throw new Error(result.message);
    }
    
    // Refresh data after successful save
    const refreshed = await getCalendarEventColors(location);
    setItems(refreshed);
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-6 px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Calendar Event Color
        </h1>
      </div>

      {/* Form */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">Loading calendar event colors...</div>
          </div>
        ) : !items ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">No calendar event colors found.</div>
          </div>
        ) : (
          <CalendarEventColorForm items={items} onSubmit={handleSubmit} isLoading={false} />
        )}
      </div>
    </div>
  );
}

