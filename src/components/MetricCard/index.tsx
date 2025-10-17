"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  DollarSign, 
  BookOpen, 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Award,
  CreditCard,
  FileText,
  Star,
  Target
} from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBackgroundColor?: string;
  loading?: boolean;
  className?: string;
  variant?: "default" | "compact" | "elevated";
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
}

export function MetricCard({
  title,
  value,
  icon,
  iconBackgroundColor = "bg-blue-500",
  loading = false,
  className,
  variant = "default",
  onClick,
  trend,
}: MetricCardProps) {
  const cardClasses = cn(
    "overflow-hidden transition-all duration-200",
    {
      "hover:shadow-md cursor-pointer": onClick,
      "shadow-sm": variant === "default",
      "shadow-lg": variant === "elevated",
      "p-3": variant === "compact",
      "p-4": variant !== "compact",
    },
    className
  );

  const iconClasses = cn(
    "flex items-center justify-center",
    {
      "p-3": variant === "compact",
      "p-4": variant !== "compact",
    },
    iconBackgroundColor
  );

  const contentClasses = cn(
    "flex-1",
    {
      "p-3": variant === "compact",
      "p-4": variant !== "compact",
    }
  );

  const titleClasses = cn(
    "font-medium text-gray-600 uppercase tracking-wide",
    {
      "text-xs": variant === "compact",
      "text-sm": variant !== "compact",
    }
  );

  const valueClasses = cn(
    "font-bold text-gray-900",
    {
      "text-lg mt-1": variant === "compact",
      "text-xl mt-1": variant !== "compact",
    }
  );

  return (
    <Card className={cardClasses} onClick={onClick}>
      <div className="flex">
        {icon && (
          <div className={iconClasses}>
            {icon}
          </div>
        )}
        <div className={contentClasses}>
          <div className={titleClasses}>
            {title}
          </div>
          <div className={valueClasses}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                Loading...
              </div>
            ) : (
              value
            )}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-1",
              {
                "text-xs": variant === "compact",
                "text-sm": variant !== "compact",
              }
            )}>
              <TrendingUp className={cn(
                "h-3 w-3",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )} />
              <span className={cn(
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-gray-500 ml-1">{trend.label}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Metric card configuration interface
export interface MetricCardConfig {
  title: string;
  icon: React.ReactNode;
  iconBackgroundColor: string;
  variant?: "default" | "compact" | "elevated";
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
}

// Base props for all metric cards
export interface BaseMetricCardProps {
  value: string | number;
  loading?: boolean;
  className?: string;
}

// Generic metric card component
export function ConfigurableMetricCard({ 
  config, 
  value, 
  loading = false, 
  className 
}: { 
  config: MetricCardConfig; 
} & BaseMetricCardProps) {
  return (
    <MetricCard
      title={config.title}
      value={value}
      loading={loading}
      icon={config.icon}
      iconBackgroundColor={config.iconBackgroundColor}
      variant={config.variant}
      onClick={config.onClick}
      trend={config.trend}
      className={className}
    />
  );
}

// Entity-specific metric card configurations
export const CUSTOMER_METRIC_CONFIGS: Record<string, MetricCardConfig> = {
  lessonsDue: {
    title: "Lessons Due",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-cyan-500",
  },
  outstandingInvoice: {
    title: "Outstanding Invoice",
    icon: <FileText className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-orange-500",
  },
  credits: {
    title: "Credits",
    icon: <Star className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-green-500",
  },
  balance: {
    title: "Balance",
    icon: <DollarSign className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-orange-400",
  },
};

export const TEACHER_METRIC_CONFIGS: Record<string, MetricCardConfig> = {
  totalStudents: {
    title: "Total Students",
    icon: <Users className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-blue-500",
  },
  activeClasses: {
    title: "Active Classes",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-green-500",
  },
  hoursThisMonth: {
    title: "Hours This Month",
    icon: <Clock className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-purple-500",
  },
  rating: {
    title: "Rating",
    icon: <Star className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-yellow-500",
  },
};

export const STUDENT_METRIC_CONFIGS: Record<string, MetricCardConfig> = {
  lessonsCompleted: {
    title: "Lessons Completed",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-green-500",
  },
  attendanceRate: {
    title: "Attendance Rate",
    icon: <Target className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-blue-500",
  },
  currentLevel: {
    title: "Current Level",
    icon: <Award className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-purple-500",
  },
  nextLesson: {
    title: "Next Lesson",
    icon: <Calendar className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-orange-500",
  },
};

export const ADMIN_METRIC_CONFIGS: Record<string, MetricCardConfig> = {
  totalUsers: {
    title: "Total Users",
    icon: <Users className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-blue-500",
  },
  activeSessions: {
    title: "Active Sessions",
    icon: <UserCheck className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-green-500",
  },
  systemHealth: {
    title: "System Health",
    icon: <TrendingUp className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-purple-500",
  },
  pendingTasks: {
    title: "Pending Tasks",
    icon: <Clock className="h-6 w-6 text-white" />,
    iconBackgroundColor: "bg-orange-500",
  },
};

// Backward compatibility - keep existing components
export function LessonsDueCard({ value, loading, className }: BaseMetricCardProps) {
  return (
    <ConfigurableMetricCard
      config={CUSTOMER_METRIC_CONFIGS.lessonsDue}
      value={value}
      loading={loading}
      className={className}
    />
  );
}

export function OutstandingInvoiceCard({ value, loading, className }: BaseMetricCardProps) {
  return (
    <ConfigurableMetricCard
      config={CUSTOMER_METRIC_CONFIGS.outstandingInvoice}
      value={value}
      loading={loading}
      className={className}
    />
  );
}

export function CreditsCard({ value, loading, className }: BaseMetricCardProps) {
  return (
    <ConfigurableMetricCard
      config={CUSTOMER_METRIC_CONFIGS.credits}
      value={value}
      loading={loading}
      className={className}
    />
  );
}

export function BalanceCard({ value, loading, className }: BaseMetricCardProps) {
  return (
    <ConfigurableMetricCard
      config={CUSTOMER_METRIC_CONFIGS.balance}
      value={value}
      loading={loading}
      className={className}
    />
  );
}

// Helper function to create metric cards for any entity
export function createMetricCards(
  entityType: "customer" | "teacher" | "student" | "admin",
  metrics: Record<string, { value: string | number; loading?: boolean }>,
  className?: string
) {
  const configs = {
    customer: CUSTOMER_METRIC_CONFIGS,
    teacher: TEACHER_METRIC_CONFIGS,
    student: STUDENT_METRIC_CONFIGS,
    admin: ADMIN_METRIC_CONFIGS,
  }[entityType];

  return Object.entries(metrics).map(([key, data]) => {
    const config = configs[key];
    if (!config) return null;

    return (
      <ConfigurableMetricCard
        key={key}
        config={config}
        value={data.value}
        loading={data.loading}
        className={className}
      />
    );
  }).filter(Boolean);
}
