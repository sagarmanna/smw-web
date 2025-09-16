interface DashboardPageProps {
  params: {
    location: string;
  };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dashboard
          </h1>
          <p className="text-lg text-red-600 mb-2">
            Hello World!
          </p>
          <p className="text-sm text-gray-500">
            Location: {params.location}
          </p>
        </div>
      </div>
    </div>
  );
}
