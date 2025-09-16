import AdminLayout from "@/components/AdminLayout";

interface AdminV2LayoutProps {
  children: React.ReactNode;
  params: {
    location: string;
  };
}

export default function AdminV2Layout({ children, params }: AdminV2LayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
