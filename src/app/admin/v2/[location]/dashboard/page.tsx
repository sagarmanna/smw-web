import { Button } from "@/components/ui/button";

interface DashboardPageProps {
  params: {
    location: string;
  };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  return (
    <div className="p-4">
      <Button>Dashboard Button</Button>
    </div>
  );
}
