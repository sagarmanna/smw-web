// DefaultProfileIcon.tsx - Reusable Component

import { User } from "lucide-react";

interface DefaultProfileIconProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function DefaultProfileIcon({ 
  size = "md", 
  className = "" 
}: DefaultProfileIconProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
    xl: "h-8 w-8"
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center ${className}`}
    >
      <User className={`${iconSizes[size]} text-white`} />
    </div>
  );
}