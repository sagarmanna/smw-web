import { ScheduleClient } from "./ScheduleClient";

interface SchedulePageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function SchedulePage({ params }: SchedulePageProps) {
  const { location } = await params;
  
  return <ScheduleClient location={location} />;
}
