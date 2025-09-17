"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Menu, User, LogOut, Sun, Moon, MapPin, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useLocations } from "@/hooks/useLocations";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const location = params.location as string;
  const { userInfo, isLoading } = useUserInfo(location);
  const { locations, changeLocation } = useLocations();

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
    onMenuClick?.();
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLocationChange = (newLocation: string) => {
    changeLocation(newLocation);
    // Update the URL path
    const newPath = pathname.replace(`/${location}`, `/${newLocation}`);
    router.push(newPath);
  };

  const handleBackToLegacy = () => {
    // Extract the current page from the pathname
    const currentPage = pathname.split('/').pop() || 'dashboard';
    
    // Map modern pages to their legacy equivalents
    const legacyPageMap: { [key: string]: string } = {
      'dashboard': '/dashboard',
      'schedule': '/schedule',
      'menu-flags': '/admin/menu-flags', // Special case for admin pages
    };
    
    const legacyPath = legacyPageMap[currentPage] || `/${currentPage}`;
    const legacyUrl = `${process.env.NEXT_PUBLIC_LEGACY_URL || 'http://localhost:8080'}${legacyPath}`;
    
    // Redirect to legacy page
    window.location.href = legacyUrl;
  };

  // Check if we're on a modern page that has a legacy equivalent
  const isModernPage = !pathname.includes('/menu-flags');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2 ml-6" href="/">
            <Image
              src={theme === "dark" ? "/admin/v2/SMW-dark.png" : "/admin/v2/SMW.png"}
              alt="SMW Logo"
              width={160}
              height={50}
              className="h-12 w-auto"
            />
          </Link>
        </div>
        
        {/* Desktop sidebar toggle button */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex h-8 w-8 px-0 ml-6"
          onClick={handleMenuClick}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        
        {/* Location Selector */}
        <div className="hidden md:flex ml-4">
          <Select value={location} onValueChange={handleLocationChange}>
            <SelectTrigger className="w-[180px] h-8">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <SelectValue placeholder="Select location" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem 
                  key={loc.id} 
                  value={loc.slug}
                  className="data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-medium"
                >
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Mobile menu button and location selector */}
        <div className="flex items-center space-x-2 md:hidden">
          <Button
            variant="ghost"
            className="ml-6 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={handleMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          
          {/* Mobile Location Selector */}
          <Select value={location} onValueChange={handleLocationChange}>
            <SelectTrigger className="w-[140px] h-8">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <SelectValue placeholder="Location" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem 
                  key={loc.id} 
                  value={loc.slug}
                  className="data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-medium"
                >
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop navigation */}
        {/* <div className="w-full border border-red-500 "> */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end mr-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other content can go here */}
          </div>
          
          {/* Back to Legacy Button - Only show on modern pages */}
          {isModernPage && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 mr-2 md:w-auto w-8"
              onClick={handleBackToLegacy}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Back to Legacy</span>
              <span className="sr-only">Back to Legacy</span>
            </Button>
          )}

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 px-0"
            onClick={handleThemeToggle}
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Profile Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-auto px-2">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {isLoading ? '...' : userInfo ? userInfo.fullName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">
                      {isLoading ? 'Loading...' : userInfo ? userInfo.fullName : 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isLoading ? '...' : userInfo ? userInfo.displayRole : 'Role'}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {isLoading ? 'Loading...' : userInfo ? userInfo.fullName : 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {isLoading ? '...' : userInfo ? userInfo.primaryEmail : 'email@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>
    </header>
  );
}
