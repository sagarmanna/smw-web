"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { menuItems, getMenuUrl } = useMenuConfig();

  // Diagnostic logging for Next.js router state (once on mount)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextRouterExists = typeof (window as any).next !== 'undefined';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextData = window.__NEXT_DATA__ as any;
      
      // Check for service workers that might interfere with navigation
      const checkServiceWorkers = async () => {
        try {
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            return registrations.length;
          }
          return 0;
        } catch {
          return 0;
        }
      };
      
      checkServiceWorkers().then(swCount => {
        console.log('[Sidebar Router Debug]', {
          pathname,
          routerReady: typeof router !== 'undefined',
          nextRouterExists,
          nextDataExists: typeof nextData !== 'undefined',
          buildId: nextData?.buildId,
          page: nextData?.page,
          asPath: nextData?.asPath,
          serviceWorkersCount: swCount,
          userAgent: navigator.userAgent.substring(0, 80), // Truncate for readability
          timestamp: new Date().toISOString(),
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - pathname/router don't need to be dependencies

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280); // xl breakpoint
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

  // Check if a menu item is currently active
  const isMenuItemActive = (item: MenuItem): boolean => {
    if (!item.url) return false;
    
    // For modern pages, check if the current pathname matches
    if (item.source === 'modern') {
      const menuUrl = getMenuUrl(item);
      return pathname === menuUrl;
    }
    
    // For legacy pages, we can't easily check since they're external
    return false;
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.items && item.items.length > 0) {
      // Toggle submenu
      toggleExpanded(item.id);
    }
  };

  // Handle regular click for modern pages (close sidebar on mobile)
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const href = target.getAttribute('href');
    
    // Diagnostic logging for navigation clicks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextRouterExists = typeof window !== 'undefined' && typeof (window as any).next !== 'undefined';
    const nextDataExists = typeof window !== 'undefined' && typeof window.__NEXT_DATA__ !== 'undefined';
    
    console.log('[Sidebar Navigation Debug]', {
      href,
      currentPathname: pathname,
      isSamePage: href === pathname,
      isMobile,
      button: e.button,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
      nextRouterReady: nextRouterExists,
      nextDataExists,
      linkElement: target.tagName,
      linkHref: target.getAttribute('href'),
      linkHasDataNextjsLink: target.hasAttribute('data-nextjs-link'),
      timestamp: new Date().toISOString(),
    });
    
    // Monitor navigation after click to see if it happened
    // SAFE: setTimeout is fine here - just logging, no side effects
    // Even if component unmounts, this won't break anything
    setTimeout(() => {
      // This will be logged after navigation attempt
      // Check if window still exists (component might have unmounted)
      if (typeof window !== 'undefined') {
        console.log('[Sidebar Navigation Debug] Post-click check', {
          newPathname: window.location.pathname,
          navigationHappened: window.location.pathname !== pathname,
          timestamp: new Date().toISOString(),
        });
      }
    }, 500);
    
    // If clicking the same page we're already on, prevent navigation
    if (href && pathname === href) {
      if (process.env.NODE_ENV === 'production') {
        console.log('[Sidebar Navigation Debug] Preventing same-page navigation');
      }
      e.preventDefault();
      e.stopPropagation();
      // Still close sidebar on mobile
      if (isMobile) {
        onClose?.();
      }
      return;
    }
    
    // Only close sidebar on mobile for regular clicks (not right-click, middle-click, or Ctrl+Click)
    if (isMobile && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      onClose?.();
    }
    // CRITICAL: Don't prevent default or stop propagation for actual navigation
    // Let Next.js Link handle navigation natively for client-side routing
    // DO NOT call e.preventDefault() or e.stopPropagation() - this breaks Next.js navigation
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = isMenuItemActive(item);
    const paddingLeft = level * 20 + 12;
    const menuUrl = getMenuUrl(item);
    
    // Diagnostic logging for menu URL generation (only in production)
    if (process.env.NODE_ENV === 'production' && item.id === 'dashboard') {
      console.log('[Sidebar Menu URL Debug]', {
        itemId: item.id,
        itemTitle: item.title,
        itemUrl: item.url,
        itemSource: item.source,
        generatedMenuUrl: menuUrl,
        location,
        isRelative: menuUrl?.startsWith('/'),
        isAbsolute: menuUrl?.startsWith('http'),
        timestamp: new Date().toISOString(),
      });
    }

    return (
      <div key={item.id}>
        {hasChildren ? (
          <div
          className={cn(
            "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
            level > 0 && "ml-4",
            isActive && "bg-primary/10 text-primary hover:bg-primary/20"
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => handleMenuClick(item)}
        >
          <div className="flex items-center space-x-2">
            {item.icon}
            <span>{item.title}</span>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            {hasChildren && (
              <div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            )}
          </div>
        </div>
        ): item.source === 'legacy' ? (
          // Legacy pages: use regular <a> tag for full page navigation
          <a
            href={menuUrl || '#'}
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
              level > 0 && "ml-4",
              isActive && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            style={{ paddingLeft: `${paddingLeft}px` }}
            onClick={handleLinkClick}
          >
            <div className="flex items-center space-x-2">
              {item.icon}
              <span>{item.title}</span>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              {/* Legacy pages don't show NEW badge */}
            </div>
          </a>
        ) : menuUrl && menuUrl !== '#' ? (
          // Modern pages: use Next.js Link for client-side navigation
          // CRITICAL: No nested <a> tags, no conflicting onClick handlers
          // Next.js Link handles navigation - we only use onClick for sidebar closing
          // Only render Link if we have a valid URL (not '#' or empty)
          <Link
            href={menuUrl}
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
              level > 0 && "ml-4",
              isActive && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            style={{ paddingLeft: `${paddingLeft}px` }}
            onClick={handleLinkClick}
            prefetch={true}
            scroll={true}
          >
            <div className="flex items-center space-x-2">
              {item.icon}
              <span>{item.title}</span>
            </div>
            {item.source === 'modern' && (
              <div className="ml-auto">
                <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-primary text-white">
                  NEW
                </span>
              </div>
            )}
          </Link>
        ) : (
          // Fallback: if no valid URL, render as non-clickable div
          <div
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium opacity-50 cursor-not-allowed",
              level > 0 && "ml-4"
            )}
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <div className="flex items-center space-x-2">
              {item.icon}
              <span>{item.title}</span>
            </div>
          </div>
        )}
        
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
      {isOpen && isMobile && (
        <div 
        // blur also on the background and increase opacity also user should not see the ui behind the overlay

          className="fixed inset-0 z-40 bg-white/80 xl:hidden backdrop-blur-sm "
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(`
        fixed xl:relative inset-y-0 z-50 xl:z-auto left-0 transform transition-transform duration-300 ease-in-out
        w-64 bg-background border-r
        flex flex-col flex-shrink-0`,
        isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : '',
        !isMobile && !isOpen && 'hidden'
      )}>
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto overflow-x-hidden h-full">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center px-4 pb-4 xl:hidden">
            <Link href="/">
              <Image
                src={theme === "dark" ? "/admin/v2/SMW-dark.png" : "/admin/v2/SMW.png"}
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
