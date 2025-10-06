"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Save, RefreshCw, AlertCircle, ShieldX } from "lucide-react";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useLocationFlags } from "@/hooks/useLocationFlags";
import { toast } from "sonner";

interface MenuFlagItem {
  id: string;
  name: string;
  description: string;
}

interface MenuFlagGroup extends MenuFlagItem {
  children?: MenuFlagItem[];
}

interface LocationFlags {
  [feature: string]: 'modern' | 'legacy' | 'disabled';
}

const menuStructure: MenuFlagGroup[] = [
    { id: 'dashboard', name: 'Dashboard', description: 'Modern dashboard interface with analytics and overview' },
    { id: 'schedule', name: 'Schedule', description: 'Schedule management and calendar interface' },
    { id: 'enrolments', name: 'Enrolments', description: 'Student enrollment management system' },
    { id: 'students', name: 'Students', description: 'Student information and management' },
    { id: 'customers', name: 'Customers', description: 'Customer relationship management' },
    { id: 'teachers', name: 'Teachers', description: 'Teacher management and profiles' },
    { id: 'privateLessons', name: 'Private Lessons', description: 'Private lesson scheduling and management' },
    { id: 'groupCourses', name: 'Group Courses', description: 'Group course management and scheduling' },
    { id: 'unscheduledLessons', name: 'Unscheduled Lessons', description: 'Unscheduled lesson tracking and management' },
    { id: 'recurringPayments', name: 'Recurring Payments', description: 'Recurring payment management system' },
    { id: 'paymentPreferences', name: 'Payment Preferences', description: 'Customer payment preference settings' },
    { id: 'invoices', name: 'Invoices', description: 'Invoice generation and management' },
    { id: 'payments', name: 'Payments', description: 'Payment processing and tracking' },
    { 
        id: 'reports', name: 'Reports', description: 'Reporting and analytics dashboard',
        children: [
            { id: 'accountReceivable', name: 'Account Receivable', description: 'Sub-menu for Account Receivable' },
            { id: 'financialSummary', name: 'Financial Summary', description: 'Sub-menu for Financial Summary' },
            { id: 'birthdays', name: 'Birthdays', description: 'Sub-menu for Birthdays' },
            { id: 'paymentsReport', name: 'Payments Report', description: 'Sub-menu for Payments Report' },
            { id: 'royalty', name: 'Royalty', description: 'Sub-menu for Royalty' },
            { id: 'taxCollected', name: 'Tax Collected', description: 'Sub-menu for Tax Collected' },
            { id: 'royaltyFree', name: 'Royalty Free', description: 'Sub-menu for Royalty Free' },
            { id: 'reportItems', name: 'Report Items', description: 'Sub-menu for Report Items' },
            { id: 'itemsByCategory', name: 'Items By Category', description: 'Sub-menu for Items By Category' },
            { id: 'discount', name: 'Discount', description: 'Sub-menu for Discount' },
            { id: 'salesAndPayment', name: 'Sales and Payment', description: 'Sub-menu for Sales and Payment' },
            { id: 'allLocations', name: 'All Locations', description: 'Sub-menu for All Locations' },
            { id: 'rentals', name: 'Rentals', description: 'Sub-menu for Rentals' },
        ]
    },
    { id: 'releaseNotes', name: 'Release Notes', description: 'System release notes and updates' },
    { id: 'items', name: 'Items', description: 'Inventory and item management' },
    { 
        id: 'admin', name: 'Admin', description: 'Administrative functions and settings',
        children: [
            { id: 'administrators', name: 'Administrators', description: 'Sub-menu for Administrators' },
            { id: 'programs', name: 'Programs', description: 'Sub-menu for Programs' },
            { id: 'cities', name: 'Cities', description: 'Sub-menu for Cities' },
            { id: 'provinces', name: 'Provinces', description: 'Sub-menu for Provinces' },
            { id: 'countries', name: 'Countries', description: 'Sub-menu for Countries' },
            { id: 'taxes', name: 'Taxes', description: 'Sub-menu for Taxes' },
            { id: 'colorCode', name: 'Color Code', description: 'Sub-menu for Color Code' },
            { id: 'itemCategory', name: 'Item Category', description: 'Sub-menu for Item Category' },
            { id: 'reminderNotes', name: 'Reminder Notes', description: 'Sub-menu for Reminder Notes' },
            { id: 'blogs', name: 'Blogs', description: 'Sub-menu for Blogs' },
            { id: 'locations', name: 'Locations', description: 'Sub-menu for Locations' },
            { id: 'holidays', name: 'Holidays', description: 'Sub-menu for Holidays' },
            { id: 'emailTemplate', name: 'Email Template', description: 'Sub-menu for Email Template' },
            { id: 'testEmail', name: 'Test Email', description: 'Sub-menu for Test Email' },
            { id: 'termsOfService', name: 'Terms of Service', description: 'Sub-menu for Terms of Service' },
            { id: 'referralSources', name: 'Referral Sources', description: 'Sub-menu for Referral Sources' },
        ]
    },
    { 
        id: 'setup', name: 'Setup', description: 'System setup and configuration',
        children: [
            { id: 'privileges', name: 'Privileges', description: 'Sub-menu for Privileges' },
            { id: 'staffMembers', name: 'Staff Members', description: 'Sub-menu for Staff Members' },
            { id: 'owners', name: 'Owners', description: 'Sub-menu for Owners' },
            { id: 'classrooms', name: 'Classrooms', description: 'Sub-menu for Classrooms' },
            { id: 'import', name: 'Import', description: 'Sub-menu for Import' },
            { id: 'locationSettings', name: 'Location Settings', description: 'Sub-menu for Location Settings' },
        ]
    },
    { id: 'timeline', name: 'Timeline', description: 'Event timeline and activity tracking' }
];

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader className="text-center">
            <ShieldX className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Something Went Wrong</CardTitle>
            <CardDescription>
              We encountered an unexpected error while rendering this page. Please refresh the page to try again.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }
    return this.props.children;
  }
}

function MenuFlagsManager() {
  const params = useParams();
  const location = params.location as string;
  const { userInfo, isLoading: userLoading } = useUserInfo(location);
  const { flags, isLoading, updateFlags } = useLocationFlags(location);
  
  const [localFlags, setLocalFlags] = useState<LocationFlags>({});
  const [originalFlags, setOriginalFlags] = useState<LocationFlags>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const isAdmin = userInfo?.id === 694;

  useEffect(() => {
    if (Object.keys(flags).length > 0) {
      setLocalFlags(flags);
      setOriginalFlags(flags);
    }
  }, [flags]);

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

  const updateFlag = (flagId: string, value: 'modern' | 'legacy' | 'disabled') => {
    const newFlags: LocationFlags = { ...localFlags, [flagId]: value };

    if (value === 'disabled') {
      const parent = menuStructure.find(item => item.id === flagId);
      if (parent?.children) {
        parent.children.forEach(child => {
          newFlags[child.id] = 'disabled';
        });
      }
    }
    
    setLocalFlags(newFlags);
  };

  useEffect(() => {
    const changed = JSON.stringify(localFlags) !== JSON.stringify(originalFlags);
    setHasChanges(changed);
  }, [localFlags, originalFlags]);

  if (userLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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

  const renderFlagRow = (flag: MenuFlagItem, level: number, isParentDisabled = false) => {
    const currentValue = localFlags[flag.id] || flags[flag.id] || 'legacy';
    const isDisabled = isParentDisabled || (level > 0 && localFlags[menuStructure.find(g => g.children?.some(c => c.id === flag.id))?.id || ''] === 'disabled');

    const rowContent = (
      <TableRow key={flag.id} className={level > 0 ? "bg-muted/50" : ""}>
        <TableCell className="font-medium" style={{ paddingLeft: `${1 + level * 2}rem` }}>
          {flag.name}
        </TableCell>
        <TableCell className="text-muted-foreground">{flag.description}</TableCell>
        <TableCell className="text-center">
          <Badge variant={currentValue === 'modern' ? 'default' : currentValue === 'legacy' ? 'secondary' : 'destructive'}>
            {currentValue}
          </Badge>
        </TableCell>
        <TableCell>
          <RadioGroup
            value={currentValue}
            onValueChange={(value: 'modern' | 'legacy' | 'disabled') => updateFlag(flag.id, value)}
            className="flex items-center justify-center space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="modern" id={`${flag.id}-modern`} disabled={isDisabled} />
              <Label htmlFor={`${flag.id}-modern`}>Modern</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="legacy" id={`${flag.id}-legacy`} disabled={isDisabled} />
              <Label htmlFor={`${flag.id}-legacy`}>Legacy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="disabled" id={`${flag.id}-disabled`} disabled={isDisabled} />
              <Label htmlFor={`${flag.id}-disabled`}>Disabled</Label>
            </div>
          </RadioGroup>
        </TableCell>
      </TableRow>
    );

    if (isDisabled && level > 0) {
      const parentName = menuStructure.find(g => g.children?.some(c => c.id === flag.id))?.name;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{rowContent}</TooltipTrigger>
            <TooltipContent>
              <p>This sub-menu is disabled because its parent &apos;{parentName}&apos; is disabled.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return rowContent;
  };

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
          <Button variant="outline" onClick={() => window.location.reload()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveFlags} disabled={!hasChanges || saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Feature</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[150px] text-center">Status</TableHead>
                <TableHead className="w-[300px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuStructure.map((group) => (
                <React.Fragment key={group.id}>
                  {renderFlagRow(group, 0)}
                  {group.children?.map(child => renderFlagRow(child, 1, localFlags[group.id] === 'disabled'))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
            </CardContent>
          </Card>

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

export default function MenuFlagsPage() {
    return (
        <ErrorBoundary>
            <MenuFlagsManager />
        </ErrorBoundary>
    )
}
