import { TeachersListingClient } from "../TeachersListingClient";

interface TeacherDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const { location, id } = await params;
  
  // For now, redirect back to teachers list
  // This can be enhanced later with actual teacher detail view
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <button 
          onClick={() => window.history.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Teachers
        </button>
      </div>
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Teacher Details</h1>
        <p className="text-muted-foreground">
          Teacher ID: {id} in {location}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Teacher detail view not implemented yet.
        </p>
      </div>
    </div>
  );
}
