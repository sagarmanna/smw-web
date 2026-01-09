import { CalendarEventColorClient } from "./CalendarEventColorClient";

interface CalendarEventColorPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function CalendarEventColorPage({ params }: CalendarEventColorPageProps) {
  const { location } = await params;
  return <CalendarEventColorClient location={location} />;
}
