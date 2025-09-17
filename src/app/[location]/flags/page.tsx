
interface FlagsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function FlagsPage({ params }: FlagsPageProps) {
  const { location } = await params;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
        <p className="text-muted-foreground">
          Manage feature flags for {location} location
        </p>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Location: {location}</h2>
        <p className="text-muted-foreground mb-4">
          This page will allow you to manage which features are enabled for each location.
          Currently, this is managed through configuration files, but will be moved to a database in the future.
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <h3 className="font-medium">Dashboard</h3>
              <p className="text-sm text-muted-foreground">Modern dashboard interface</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${
              ['burlington', 'training-location'].includes(location)
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {['burlington', 'training-location'].includes(location) ? 'Modern' : 'Legacy'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <h3 className="font-medium">Schedule</h3>
              <p className="text-sm text-muted-foreground">Schedule management interface</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${
              ['burlington', 'training-location'].includes(location)
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {['burlington', 'training-location'].includes(location) ? 'Modern' : 'Legacy'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <h3 className="font-medium">All Other Features</h3>
              <p className="text-sm text-muted-foreground">Enrolments, Students, Customers, etc.</p>
            </div>
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
              Legacy
            </span>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h3 className="font-medium mb-2">Available Locations</h3>
          <p className="text-sm text-muted-foreground mb-3">
            The system supports {12} locations. Currently, Burlington and Training Location have modern Dashboard and Schedule pages enabled.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {['bolton', 'burlington', 'maple', 'markham', 'newmarket', 'nobleton', 'north-brampton', 'richmond-hill', 'south-brampton', 'training-location', 'west-brampton', 'woodbridge'].map((loc) => (
              <div key={loc} className={`px-2 py-1 rounded text-center ${
                loc === location 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {loc.replace('-', ' ').replace(/\b\w/g, char => char.toUpperCase())}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">Future Implementation</h3>
          <p className="text-sm text-muted-foreground">
            This page will be enhanced to allow real-time toggling of features per location,
            with the ability to enable/disable modern versions of pages as they are developed.
          </p>
        </div>
      </div>
    </div>
  );
}

