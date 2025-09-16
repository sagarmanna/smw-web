"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { ChevronDown, ChevronRight, Home, Users, Settings, BarChart3, FileText, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { theme } = useTheme();

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home className="h-4 w-4" />,
      href: "/dashboard",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      children: [
        {
          id: "reports",
          label: "Reports",
          icon: <FileText className="h-4 w-4" />,
          href: "/analytics/reports",
        },
        {
          id: "metrics",
          label: "Metrics",
          icon: <BarChart3 className="h-4 w-4" />,
          href: "/analytics/metrics",
        },
      ],
    },
    {
      id: "users",
      label: "User Management",
      icon: <Users className="h-4 w-4" />,
      children: [
        {
          id: "all-users",
          label: "All Users",
          icon: <Users className="h-4 w-4" />,
          href: "/users",
        },
        {
          id: "roles",
          label: "Roles & Permissions",
          icon: <Shield className="h-4 w-4" />,
          href: "/users/roles",
        },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      children: [
        {
          id: "general",
          label: "General",
          icon: <Settings className="h-4 w-4" />,
          href: "/settings/general",
        },
        {
          id: "security",
          label: "Security",
          icon: <Shield className="h-4 w-4" />,
          href: "/settings/security",
        },
      ],
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
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
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else if (item.href) {
              // Handle navigation
              window.location.href = item.href;
            }
          }}
        >
          <div className="flex items-center space-x-2">
            {item.icon}
            <span>{item.label}</span>
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
            {item.children?.map(child => renderMenuItem(child, level + 1))}
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
