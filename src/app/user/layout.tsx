import { TokenGuard } from "@/components/TokenGuard";
import UserHeader from "./components/UserHeader";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <TokenGuard>
      <div className="min-h-screen bg-background">
        <UserHeader />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-4">{children}</main>
      </div>
    </TokenGuard>
  );
}

