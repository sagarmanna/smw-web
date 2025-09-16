"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Home, Users, Settings, BarChart3, FileText, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

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

  if (!isOpen) return null;

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-background border-r">
        <div className="flex items-center flex-shrink-0 px-4">
          <h2 className="text-lg font-semibold">Navigation</h2>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
