import AdminLayout from "@/components/AdminLayout";
import { GlobalDataProvider } from "@/providers/GlobalDataProvider";

interface AdminV2LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export default async function AdminV2Layout({ children, params }: AdminV2LayoutProps) {
  const { location } = await params;
  
  return (
    <GlobalDataProvider location={location}>
      <AdminLayout>{children}</AdminLayout>
    </GlobalDataProvider>
  );
}
