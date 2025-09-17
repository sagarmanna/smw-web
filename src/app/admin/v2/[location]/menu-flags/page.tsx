"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RefreshCw, AlertCircle } from "lucide-react";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useLocationFlags } from "@/hooks/useLocationFlags";
import { toast } from "sonner";

interface MenuFlag {
  id: string;
  name: string;
  description: string;
  currentValue: 'modern' | 'legacy' | 'disabled';
}

interface LocationFlags {
  [feature: string]: 'modern' | 'legacy' | 'disabled';
}

export default function MenuFlagsPage() {
  const params = useParams();
  const location = params.location as string;
  const { userInfo, isLoading: userLoading } = useUserInfo(location);
  const { flags, isLoading, updateFlags } = useLocationFlags(location);
  
  const [localFlags, setLocalFlags] = useState<LocationFlags>({});
  const [originalFlags, setOriginalFlags] = useState<LocationFlags>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if user has admin access (user ID = 694)
  const isAdmin = userInfo?.id === 694;

  const menuFlags: MenuFlag[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Modern dashboard interface with analytics and overview',
      currentValue: localFlags.dashboard || flags.dashboard || 'legacy'
    },
    {
      id: 'schedule',
      name: 'Schedule',
      description: 'Schedule management and calendar interface',
      currentValue: localFlags.schedule || flags.schedule || 'legacy'
    },
    {
      id: 'enrolments',
      name: 'Enrolments',
      description: 'Student enrollment management system',
      currentValue: localFlags.enrolments || flags.enrolments || 'legacy'
    },
    {
      id: 'students',
      name: 'Students',
      description: 'Student information and management',
      currentValue: localFlags.students || flags.students || 'legacy'
    },
    {
      id: 'customers',
      name: 'Customers',
      description: 'Customer relationship management',
      currentValue: localFlags.customers || flags.customers || 'legacy'
    },
    {
      id: 'teachers',
      name: 'Teachers',
      description: 'Teacher management and profiles',
      currentValue: localFlags.teachers || flags.teachers || 'legacy'
    },
    {
      id: 'privateLessons',
      name: 'Private Lessons',
      description: 'Private lesson scheduling and management',
      currentValue: localFlags.privateLessons || flags.privateLessons || 'legacy'
    },
    {
      id: 'groupCourses',
      name: 'Group Courses',
      description: 'Group course management and scheduling',
      currentValue: localFlags.groupCourses || flags.groupCourses || 'legacy'
    },
    {
      id: 'unscheduledLessons',
      name: 'Unscheduled Lessons',
      description: 'Unscheduled lesson tracking and management',
      currentValue: localFlags.unscheduledLessons || flags.unscheduledLessons || 'legacy'
    },
    {
      id: 'recurringPayments',
      name: 'Recurring Payments',
      description: 'Recurring payment management system',
      currentValue: localFlags.recurringPayments || flags.recurringPayments || 'legacy'
    },
    {
      id: 'paymentPreferences',
      name: 'Payment Preferences',
      description: 'Customer payment preference settings',
      currentValue: localFlags.paymentPreferences || flags.paymentPreferences || 'legacy'
    },
    {
      id: 'invoices',
      name: 'Invoices',
      description: 'Invoice generation and management',
      currentValue: localFlags.invoices || flags.invoices || 'legacy'
    },
    {
      id: 'payments',
      name: 'Payments',
      description: 'Payment processing and tracking',
      currentValue: localFlags.payments || flags.payments || 'legacy'
    },
    {
      id: 'reports',
      name: 'Reports',
      description: 'Reporting and analytics dashboard',
      currentValue: localFlags.reports || flags.reports || 'legacy'
    },
    {
      id: 'releaseNotes',
      name: 'Release Notes',
      description: 'System release notes and updates',
      currentValue: localFlags.releaseNotes || flags.releaseNotes || 'legacy'
    },
    {
      id: 'items',
      name: 'Items',
      description: 'Inventory and item management',
      currentValue: localFlags.items || flags.items || 'legacy'
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Administrative functions and settings',
      currentValue: localFlags.admin || flags.admin || 'legacy'
    },
    {
      id: 'setup',
      name: 'Setup',
      description: 'System setup and configuration',
      currentValue: localFlags.setup || flags.setup || 'legacy'
    },
    {
      id: 'timeline',
      name: 'Timeline',
      description: 'Event timeline and activity tracking',
      currentValue: localFlags.timeline || flags.timeline || 'legacy'
    }
  ];

  // Initialize local flags when Redux flags change
  useEffect(() => {
    if (Object.keys(flags).length > 0) {
      setLocalFlags(flags);
      setOriginalFlags(flags);
    }
  }, [flags]);

  // Save location flags
  const saveFlags = async () => {
    try {
      setSaving(true);
      await updateFlags(localFlags);
      setOriginalFlags(localFlags);
      setHasChanges(false);
      toast.success('Menu flags updated successfully');
    } catch (error) {
      console.error('Error saving flags:', error);
      toast.error('Failed to save menu flags');
    } finally {
      setSaving(false);
    }
  };

  // Update flag value
  const updateFlag = (flagId: string, value: 'modern' | 'legacy' | 'disabled') => {
    setLocalFlags(prev => ({
      ...prev,
      [flagId]: value
    }));
  };

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(localFlags) !== JSON.stringify(originalFlags);
    setHasChanges(changed);
  }, [localFlags, originalFlags]);

  // Show loading state
  if (userLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page. Only system administrators can manage menu flags.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Flags Management</h1>
          <p className="text-muted-foreground">
            Manage feature flags for {location.replace('-', ' ').replace(/\b\w/g, char => char.toUpperCase())} location
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={saveFlags}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menuFlags.map((flag) => (
          <Card key={flag.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{flag.name}</CardTitle>
                <Badge 
                  variant={flag.currentValue === 'modern' ? 'default' : 
                          flag.currentValue === 'legacy' ? 'secondary' : 'destructive'}
                >
                  {flag.currentValue}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {flag.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Modern</span>
                  <Switch
                    checked={flag.currentValue === 'modern'}
                    onCheckedChange={(checked) => 
                      updateFlag(flag.id, checked ? 'modern' : 'legacy')
                    }
                    disabled={flag.currentValue === 'disabled'}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Legacy</span>
                  <Switch
                    checked={flag.currentValue === 'legacy'}
                    onCheckedChange={(checked) => 
                      updateFlag(flag.id, checked ? 'legacy' : 'modern')
                    }
                    disabled={flag.currentValue === 'disabled'}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Disabled</span>
                  <Switch
                    checked={flag.currentValue === 'disabled'}
                    onCheckedChange={(checked) => 
                      updateFlag(flag.id, checked ? 'disabled' : 'legacy')
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                You have unsaved changes. Click &quot;Save Changes&quot; to apply your updates.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
