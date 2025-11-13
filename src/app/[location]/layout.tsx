import AdminLayout from "@/components/AdminLayout";
import { GlobalDataProvider } from "@/providers/GlobalDataProvider";
import { TokenGuard } from "@/components/TokenGuard";

interface AdminV2LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export default async function AdminV2Layout({ children, params }: AdminV2LayoutProps) {
  const { location } = await params;
  
  return (
    <TokenGuard>
      <GlobalDataProvider location={location}>
        <AdminLayout>{children}</AdminLayout>
      </GlobalDataProvider>
    </TokenGuard>
  );
}
