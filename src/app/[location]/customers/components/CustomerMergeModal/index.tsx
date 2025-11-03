import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ReusableModal } from "@/components/TablesModals";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import {
  getCustomersForMerge,
  getMergePreview,
  CustomerMergeData,
  MergePreviewData,
} from "./customer-merge.api";
import { mergeCustomer } from "@/lib/api/legacyApiAdapter";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";

interface CustomerMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  currentCustomerId: number;
  currentCustomerName: string;
  onMergeSuccess?: () => void;
}

export function CustomerMergeModal({
  isOpen,
  onClose,
  location,
  currentCustomerId,
  onMergeSuccess,
}: CustomerMergeModalProps) {
  const [customers, setCustomers] = useState<CustomerMergeData[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerMergeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [merging, setMerging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<MergePreviewData | null>(null);

  // Column filter state for individual column filters
  const [columnFilters, setColumnFilters] = useState<Record<string, unknown>>({});

  // Fetch customers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    } else {
      // Reset state when modal closes
      setSelectedCustomer(null);
      setShowPreview(false);
      setPreviewData(null);
      setColumnFilters({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchCustomers = async (lastNameQuery?: string) => {
    setLoading(true);
    try {
      const response = await getCustomersForMerge(
        location,
        currentCustomerId,
        lastNameQuery
      );
      if (response?.success && response.data?.body) {
        setCustomers(response.data.body);
      } else {
        toast.error("Failed to load customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const fetchMergePreview = async (duplicateCustomerId: number) => {
    setLoadingPreview(true);
    try {
      const response = await getMergePreview(
        location,
        currentCustomerId,
        duplicateCustomerId
      );
      if (response?.success && response.data?.body) {
        setPreviewData(response.data.body);
      } else {
        toast.error("Failed to load merge preview");
        setShowPreview(false);
      }
    } catch (error) {
      console.error("Error fetching merge preview:", error);
      toast.error("Failed to load merge preview");
      setShowPreview(false);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Filter customers based on all search terms
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const firstNameFilter = columnFilters.firstName as string;
      const emailFilter = columnFilters.email as string;
      const phoneFilter = columnFilters.phoneNumber as string;

      const matchesFirstName =
        !firstNameFilter?.trim() ||
        customer.firstName
          ?.toLowerCase()
          .includes(firstNameFilter.toLowerCase());
      const matchesEmail =
        !emailFilter?.trim() ||
        customer.email?.toLowerCase().includes(emailFilter.toLowerCase());
      const matchesPhone =
        !phoneFilter?.trim() ||
        customer.phoneNumber?.toLowerCase().includes(phoneFilter.toLowerCase());

      return matchesFirstName && matchesEmail && matchesPhone;
    });
  }, [customers, columnFilters]);

  const handleCustomerSelect = (customer: CustomerMergeData) => {
    setSelectedCustomer(customer);
    setShowPreview(true);
    fetchMergePreview(customer.id);
  };

  // Handle going back to customer list from preview
  const handleBackToList = useCallback(() => {
    setShowPreview(false);
    setSelectedCustomer(null);
    setPreviewData(null);
  }, []);

  // Handle column filter changes
  const handleColumnFilterChange = useCallback(
    (columnKey: string, filterValue: unknown) => {
      setColumnFilters((prev) => ({
        ...prev,
        [columnKey]: filterValue,
      }));
    },
    []
  );

  // Handle Enter key press in text filters to trigger API
  const handleColumnFilterEnter = useCallback(
    (columnKey: string) => {
      // Trigger API call when Enter is pressed in lastName input
      if (columnKey === "lastName") {
        const value = columnFilters.lastName as string;
        if (value?.trim().length >= 2 || value?.trim().length === 0) {
          fetchCustomers(value?.trim() || undefined);
        }
      }
    },
    [columnFilters]
  );

  const handleConfirmMerge = async () => {
    if (!selectedCustomer || merging) return;

    try {
      setMerging(true);
      const response = await mergeCustomer(
        location,
        currentCustomerId,
        selectedCustomer.id
      );

      if (response.status) {
        // Success case
        toast.success(
          response.message || "Customer merged successfully"
        );
        onClose();
        if (onMergeSuccess) {
          onMergeSuccess();
        }
      } else {
        // Error case - API returned an error
        const errorMessage =
          response.errors?.join(", ") ||
          "Failed to merge customer. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      // Network or other error
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to merge customer. Please try again.";
      toast.error(errorMessage);
      console.error("Error merging customer:", error);
    } finally {
      setMerging(false);
    }
  };

  const handleCancel = () => {
    if (showPreview) {
      handleBackToList();
    } else {
      onClose();
    }
  };

  const modalActions = showPreview
    ? [
        {
          label: "Cancel",
          onClick: handleCancel,
          variant: "ghost" as const,
          disabled: loadingPreview,
        },
        {
          label: merging ? "Merging..." : "Confirm",
          onClick: handleConfirmMerge,
          variant: "default" as const,
          disabled: loadingPreview || merging,
        },
      ]
    : [
        {
          label: "Cancel",
          onClick: onClose,
          variant: "default" as const,
        },
      ];

  const columns = useMemo<ColumnDef<CustomerMergeData>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: () => (
          <div className="space-y-2 min-w-[120px]">
            <span className="text-gray-600 dark:text-gray-400 font-semibold block">
              First Name
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.firstName}</span>
        ),
        filter: {
          type: "string",
        },
      },
      {
        accessorKey: "lastName",
        header: () => (
          <div className="space-y-2 min-w-[120px]">
            <span className="text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-1">
              Last Name
              <ArrowUpDown className="h-4 w-4 text-blue-500" />
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.lastName}</span>
        ),
        filter: {
          type: "string",
        },
      },
      {
        accessorKey: "email",
        header: () => (
          <div className="space-y-2 min-w-[180px]">
            <span className="text-gray-600 dark:text-gray-400 font-semibold block">
              E-mail
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <span
            className="text-sm truncate block max-w-[200px]"
            title={row.original.email}
          >
            {row.original.email}
          </span>
        ),
        filter: {
          type: "string",
        },
      },
      {
        accessorKey: "phoneNumber",
        header: () => (
          <div className="space-y-2 min-w-[140px]">
            <span className="text-gray-600 dark:text-gray-400 font-semibold block">
              Phone
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.phoneNumber || "-"}</span>
        ),
        filter: {
          type: "string",
        },
      },
    ],
    []
  );

  return (
    <ReusableModal
      open={isOpen}
      onOpenChange={onClose}
      size="4xl"
      actions={modalActions}
      showFooter={true}
      title="Customer Merge"
    >
      <div className="max-h-[70vh] overflow-y-auto p-2 sm:p-4">
        {showPreview && selectedCustomer ? (
          // Preview Screen
          <div className="space-y-4 sm:space-y-6">
            {loadingPreview ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : previewData ? (
              <>
                <div className="bg-orange-500 text-white p-3 sm:p-4 rounded-md">
                  <p className="text-xs sm:text-sm font-medium">
                    Merging another customer will delete all of their contact
                    data. This can not be undone.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-4 rounded-md">
                    <h3 className="text-sm sm:text-base font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      Customer
                    </h3>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Original:
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                          {previewData.primaryCandidate.fullName}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Duplicate:
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                          {previewData.duplicateCandidate.fullName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-4 rounded-md">
                    <h3 className="text-sm sm:text-base font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      Students ({previewData.students.length})
                    </h3>
                    <div className="space-y-1">
                      {previewData.students.length > 0 ? (
                        previewData.students.map((student) => (
                          <div
                            key={student.id}
                            className="text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                          >
                            • {student.fullName}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          No students
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    Enrollments ({previewData.enrolments.length})
                  </h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs min-w-[800px]">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-2 sm:px-3 py-2 text-left text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                              Student
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                              Program
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                              Teacher
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                              Day
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                              Time
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                              Duration
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                              Start Date
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                              Renewal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {previewData.enrolments.length > 0 ? (
                            previewData.enrolments.map((enrollment) => (
                              <tr
                                key={enrollment.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                              >
                                <td className="px-2 sm:px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                  {enrollment.studentName}
                                </td>
                                <td className="px-2 sm:px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                  {enrollment.programName}
                                </td>
                                <td className="px-2 sm:px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                  {enrollment.teacherName}
                                </td>
                                <td className="px-2 sm:px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                  {enrollment.day}
                                </td>
                                <td className="px-2 sm:px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                  {enrollment.fromTime}
                                </td>
                                <td className="px-2 sm:px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                  {enrollment.duration}
                                </td>
                                <td className="px-2 sm:px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                  {enrollment.startDate}
                                </td>
                                <td className="px-2 sm:px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                  {enrollment.renewalDate}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={8}
                                className="px-2 sm:px-3 py-6 text-center text-gray-500 dark:text-gray-400"
                              >
                                No enrollment data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          // Customer Selection Screen
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <CustomTable
                  data={filteredCustomers}
                  columns={columns}
                  size="compact"
                  variant="default"
                  stickyHeader={false}
                  enableSearch={false}
                  enableFilter={false}
                  enableRowsPerPage={false}
                  enablePrint={false}
                  enableColumnFilters={true}
                  onColumnFilterChange={handleColumnFilterChange}
                  onColumnFilterEnter={handleColumnFilterEnter}
                  columnFilters={columnFilters}
                  columnFilterPlaceholders={{
                    firstName: "Search...",
                    lastName: "Search...",
                    email: "Search...",
                    phoneNumber: "Search...",
                  }}
                  enableExport={false}
                  manualSorting={false}
                  serverSidePagination={undefined}
                  hideRecordCount={true}
                  onRowClick={(row) => handleCustomerSelect(row)}
                  // rowClassName={(row: CustomerMergeData) => {
                  //   const index = filteredCustomers.indexOf(row);
                  //   return `cursor-pointer ${
                  //     index === 0
                  //       ? "bg-red-50 dark:bg-red-900/20"
                  //       : index === 1 || index === 2
                  //       ? "bg-blue-50 dark:bg-blue-900/20"
                  //       : ""
                  //   }`;
                  // }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </ReusableModal>
  );
}