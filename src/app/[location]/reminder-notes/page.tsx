import { ReminderNotesClient } from "./ReminderNotesClient";

interface ReminderNotesPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function ReminderNotesPage({ params }: ReminderNotesPageProps) {
  const { location } = await params;
  return <ReminderNotesClient location={location} />;
}
