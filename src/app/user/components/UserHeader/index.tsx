"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { User, LogOut, Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/redux/hooks";

const NAV_ITEMS = [
  { href: "/user/schedule", label: "Schedule" },
  { href: "/user/invoiced-lessons", label: "Invoiced Lessons" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function UserHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { userInfo, isLoading } = useAppSelector((state) => state.user);

  const displayName = isLoading
    ? "Loading..."
    : userInfo?.fullName || "User";

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("location");
      localStorage.removeItem("id");
    } finally {
      const legacyUrl = process.env.NEXT_PUBLIC_LEGACY_URL;
      // Default to a safe relative path if env isn't set (prevents crash in dev)
      window.location.href = legacyUrl
        ? `${legacyUrl}/sign-in/cross-domain-logout`
        : "/login";
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center px-4">
        <Link
          href="/user/schedule"
          className="mr-6 flex items-center space-x-2"
          aria-label="User Portal Home"
        >
          <Image
            src={theme === "dark" ? "/admin/v2/SMW-dark.png" : "/admin/v2/SMW.png"}
            alt="SMW Logo"
            width={160}
            height={50}
            className="h-12 w-auto"
          />
        </Link>

        <nav className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 px-0"
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="ml-1 h-9 gap-2 px-2 hover:bg-muted"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[180px] truncate text-sm font-medium">
                    {displayName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userInfo?.primaryEmail || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/user/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
      </div>
    </header>
  );
}

