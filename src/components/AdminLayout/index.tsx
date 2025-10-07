"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PageAccessControl from "../PageAccessControl";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1280; // Use xl breakpoint
      setIsMobile(mobile);
      
      // Desktop defaults to open, mobile to closed
      setSidebarOpen(!mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={handleMenuClick} />
      <div className="flex">
        <div className={sidebarOpen ? "w-[280px]" : "w-0"}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        </div>
        <div className={sidebarOpen ? "w-[calc(100%-280px)]" : "w-full"}>
        <main className={`${sidebarOpen ? "p-2 xl:pl-0" : "p-2 xl:p-4"} transition-all duration-300 w-full `}>
          <div className="mx-auto">
            <PageAccessControl>{children}</PageAccessControl>
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}
