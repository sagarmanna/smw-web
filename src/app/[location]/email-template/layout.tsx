import type { Metadata } from "next";

interface EmailTemplateLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>; 
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateMetadata(_params: EmailTemplateLayoutProps): Promise<Metadata> {
  // Params not used in metadata - layout is location-agnostic
  return {
    title: `Email Templates | SMW`,
    description: `Browse and manage email templates.`,
    keywords: ["email templates", "email", "templates"],
    openGraph: {
      title: `Email Templates`,
      description: `Email templates directory`,
      type: "website",
    },
  };
}

export default function EmailTemplateLayout({ children }: EmailTemplateLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}


