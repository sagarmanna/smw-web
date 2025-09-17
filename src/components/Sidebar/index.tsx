"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMenuConfig } from "@/hooks/useMenuConfig";
import type { MenuItem } from "@/config/menuConfig";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const { menuItems, getMenuUrl } = useMenuConfig();

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.items && item.items.length > 0) {
      // Toggle submenu
      toggleExpanded(item.id);
    } else if (item.url) {
      // Handle navigation
      const url = getMenuUrl(item);
      
      if (item.source === 'legacy') {
        // Redirect to legacy app (full page reload)
        window.location.href = url;
      } else {
        // Use Next.js client-side routing for modern pages
        router.push(url);
        // Close sidebar only on mobile after navigation
        if (isMobile) {
          onClose?.();
        }
      }
    }
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const paddingLeft = level * 20 + 12;

    return (
      <div key={item.id}>
        <div
          className={cn(
            "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
            level > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => handleMenuClick(item)}
        >
          <div className="flex items-center space-x-2">
            {item.icon}
            <span>{item.title}</span>
            {item.source === 'modern' && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                NEW
              </span>
            )}
          </div>
          {hasChildren && (
            <div className="ml-auto">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.items?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isOpen ? 'md:flex' : 'md:hidden'} md:flex-col
      `}>
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-background border-r h-full">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center px-4 pb-4 md:hidden">
            <Link href="/">
              <Image
                src={theme === "dark" ? "/SMW-dark.png" : "/SMW.png"}
                alt="SMW Logo"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            </Link>
          </div>
          
          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {menuItems.map(item => renderMenuItem(item))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
