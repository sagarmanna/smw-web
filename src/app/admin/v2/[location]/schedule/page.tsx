import { Button } from "@/components/ui/button";

interface SchedulePageProps {
  params: {
    location: string;
  };
}

export default function SchedulePage({ params }: SchedulePageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">
          Manage schedules for {params.location}
        </p>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Basic Training Session</p>
              <p className="text-sm text-muted-foreground">Monday, 9:00 AM - 12:00 PM</p>
            </div>
            <Button size="sm">View Details</Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Advanced Workshop</p>
              <p className="text-sm text-muted-foreground">Wednesday, 2:00 PM - 5:00 PM</p>
            </div>
            <Button size="sm">View Details</Button>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button>Create New Schedule</Button>
        <Button variant="outline">Import Schedule</Button>
      </div>
    </div>
  );
}
