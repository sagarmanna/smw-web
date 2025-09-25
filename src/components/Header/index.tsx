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
import { Menu, User, LogOut, Sun, Moon, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { useLocations } from "@/hooks/useLocations";
import { useLocationChange } from "@/hooks/useLocationChange";
import { useLocationAccess } from "@/hooks/useLocationAccess";
import { useLocationFeatures } from "@/hooks/useLocationFeatures";
import { getCurrentPageFeature, getLegacyUrl } from "@/utils/pageFeatureDetection";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLegacyMode, setIsLegacyMode] = useState(false);
  const { theme, setTheme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const location = params.location as string;
  const { userInfo, isLoading } = useAppSelector((state) => state.user);
  const { locations, changeLocation } = useLocations();
  
  // Handle location changes for staff permissions
  useLocationChange(location);
  
  // Check location access permissions
  const { hasLocationAccess } = useLocationAccess(location);
  
  // Check feature availability for location
  const { getFeatureSourceForLocation } = useLocationFeatures();

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
    onMenuClick?.();
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLocationChange = (newLocation: string) => {
    // Check if user has access to the new location
    if (!hasLocationAccess(newLocation)) {
      console.warn('User does not have access to this location');
      return;
    }
    
    // Get the current page feature from pathname
    const currentFeature = getCurrentPageFeature(pathname);
    
    // Check if the new location has modern version of the current feature
    const featureSource = getFeatureSourceForLocation(newLocation, currentFeature);
    
    if (featureSource === 'legacy') {
      // Redirect to legacy page for this feature with the new location
      const legacyUrl = getLegacyUrl(currentFeature, newLocation);
      window.location.href = legacyUrl;
      return;
    }
    
    // If modern feature, proceed with normal location change
    changeLocation(newLocation);
    // Update the URL path
    const newPath = pathname.replace(`/${location}`, `/${newLocation}`);
    router.push(newPath);
  };

  const handleLegacyToggle = () => {
    if (!isLegacyMode) {
      // Switch to legacy mode
      setIsLegacyMode(true);
      
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
    }
    // Note: We don't handle switching back to modern mode since that would require
    // the user to be on the legacy page, which would be handled by the legacy system
  };

  const handleProfileClick = () => {
    if (userInfo) {
      const profileUrl = `${process.env.NEXT_PUBLIC_LEGACY_URL}/user/view?UserSearch%5Brole_name%5D=${encodeURIComponent(userInfo.role)}&id=${userInfo.id}`;
      window.location.href = profileUrl;
    }
  };

  const handleLogout = async () => {
    if (userInfo) {
      try {
        // First, call the new app logout API
        // await logout(userInfo.id);
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('location');
        localStorage.removeItem('id');
        
        // Call the cross-domain logout endpoint to clear legacy session
        // This will redirect to the legacy login page after clearing the session
        window.location.href = `${process.env.NEXT_PUBLIC_LEGACY_URL}/sign-in/cross-domain-logout`;
        
      } catch (error) {
        console.error('Logout error:', error);
        // Fallback: redirect to legacy login page
        window.location.href = `${process.env.NEXT_PUBLIC_LEGACY_URL}/sign-in/login`;
      }
    }
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
              {locations.map((loc) => {
                const hasAccess = hasLocationAccess(loc.slug);
                return (
                  <SelectItem 
                    key={loc.id} 
                    value={loc.slug}
                    disabled={!hasAccess}
                    className={`data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-medium ${
                      !hasAccess ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loc.name}
                  </SelectItem>
                );
              })}
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
              {locations.map((loc) => {
                const hasAccess = hasLocationAccess(loc.slug);
                return (
                  <SelectItem 
                    key={loc.id} 
                    value={loc.slug}
                    disabled={!hasAccess}
                    className={`data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-medium ${
                      !hasAccess ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loc.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop navigation */}
        {/* <div className="w-full border border-red-500 "> */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end mr-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other content can go here */}
          </div>
          
          {/* Legacy Mode Switch - Only show on modern pages */}
          {isModernPage && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLegacyToggle}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mr-2
                      ${isLegacyMode 
                        ? 'bg-primary' 
                        : 'bg-gray-200 dark:bg-gray-700'
                      }
                    `}
                    role="switch"
                    aria-checked={isLegacyMode}
                    aria-label="Toggle legacy mode"
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out
                        ${isLegacyMode ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Back to Legacy</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
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
