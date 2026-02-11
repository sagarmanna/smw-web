"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components/CustomTable";
import { Check, Loader2, X } from "lucide-react";
import {
  getTrainingLocationPermissions,
  updateTrainingLocationPermission,
  type TrainingLocationPermissionApiRow,
} from "./privileges.api";
import { toast } from "sonner";

export type PrivilegeRow = TrainingLocationPermissionApiRow;

interface PrivilegesClientProps {
  location: string;
}

export function PrivilegesClient({ location }: PrivilegesClientProps) {
  const [data, setData] = React.useState<PrivilegeRow[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      const result = await getTrainingLocationPermissions(location);
      if (cancelled) return;

      if (!result.success) {
        setError(result.message || "Failed to fetch permissions");
      }

      setData(result.data);
      setIsLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [location]);

  const setRowStaffmember = React.useCallback((permission: string, staffmember: boolean) => {
    setData((prev) =>
      prev.map((row) => (row.permission === permission ? { ...row, staffmember } : row))
    );
  }, []);

  const handleToggleStaff = React.useCallback(
    async (row: PrivilegeRow) => {
      const permissionKey = row.permission;
      if (!permissionKey) {
        toast.error("Permission key not provided by API.");
        return;
      }
      const newEnable = !row.staffmember;
      setSaving((prev) => ({ ...prev, [permissionKey]: true }));
      setRowStaffmember(permissionKey, newEnable);

      try {
        const result = await updateTrainingLocationPermission(location, {
          permission: permissionKey,
          enable: newEnable,
        });
        toast.success(
          `"${row.description}" ${newEnable ? "enabled" : "disabled"} successfully`
        );
      } catch (err) {
        setRowStaffmember(permissionKey, row.staffmember);
        toast.error(err instanceof Error ? err.message : "Failed to update permission");
      } finally {
        setSaving((prev) => ({ ...prev, [permissionKey]: false }));
      }
    },
    [location, setRowStaffmember]
  );

  const columns = React.useMemo(
    (): ColumnDef<PrivilegeRow>[] => [
      {
        accessorKey: "description",
        header: () => <span>Privilege</span>,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.description}</span>
        ),
        size: 400,
      },
      {
        accessorKey: "staffmember",
        header: () => <span className="block text-center">Staff</span>,
        cell: ({ row }) => {
          const { permission, staffmember } = row.original;
          const savingKey = permission ?? "";
          return (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleToggleStaff(row.original);
                }}
                disabled={saving[savingKey] === true || !permission}
                className="p-1 rounded hover:bg-muted focus:outline-none focus:ring-0 border-0 border-none"
                aria-label={
                  staffmember ? "Granted (click to deny)" : "Denied (click to grant)"
                }
              >
                {saving[savingKey] ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : staffmember ? (
                  <Check className="h-5 w-5 text-foreground" />
                ) : (
                  <X className="h-5 w-5 text-foreground" />
                )}
              </button>
            </div>
          );
        },
        size: 120,
      },
    ],
    [handleToggleStaff]
  );

  return (
    <div className="w-full">
      <CustomTable<PrivilegeRow, unknown>
        data={data}
        columns={columns}
        title="Permissions"
        size="compact"
        variant="default"
        isLoading={isLoading}
        customEmptyState={
          <div className="p-6 text-sm text-muted-foreground">
            {error ? `Failed to load permissions: ${error}` : "No permissions found."}
          </div>
        }
        enableSearch={false}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={false}
        enableColumnFilters={false}
        enableSorting={false}
      />
    </div>
  );
}
