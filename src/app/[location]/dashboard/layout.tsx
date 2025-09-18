import type { Metadata } from "next";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export async function generateMetadata({ params }: DashboardLayoutProps): Promise<Metadata> {
  const { location } = await params;

  const formattedLocation = location.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  
  return {
    title: `Dashboard - ${formattedLocation} | SMW`,
    description: `Dashboard for ${location} location management`,
    keywords: ['dashboard', 'admin', 'management', location],
    openGraph: {
      title: `${formattedLocation} Dashboard`,
      description: `Manage ${formattedLocation} location settings and data`,
      type: 'website',
    },
  };
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <div>{children}</div>;
}

