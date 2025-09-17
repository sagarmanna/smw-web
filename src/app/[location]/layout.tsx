import AdminLayout from "@/components/AdminLayout";

interface AdminV2LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export default async function AdminV2Layout({ children }: AdminV2LayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
