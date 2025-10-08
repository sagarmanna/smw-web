/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { format } from "date-fns";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getItemCategory, ItemCategoryRow, ItemCategoryOption, ItemCategoryFooter, getItemCategories } from "./item-category.api";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { formatCurrency } from "@/utils/formatCurrency";
import { usePrintReport } from "@/hooks/usePrintReport";
import { useExportableData } from "@/hooks/useExportableData";

interface ItemCategoryClientProps {
  location: string;
}

export function ItemCategoryClient({ location }: ItemCategoryClientProps) {
  const [data, setData] = React.useState<ItemCategoryRow[]>([]);
  const [footer, setFooter] = React.useState<ItemCategoryFooter | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [itemCategories, setItemCategories] = React.useState<ItemCategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [categoriesLoading, setCategoriesLoading] = React.useState<boolean>(true);
  const [categorySearchTerm, setCategorySearchTerm] = React.useState<string>("");
  const [summariesOnly, setSummariesOnly] = React.useState<boolean>(false);
  const [activeViewFilter, setActiveViewFilter] = React.useState<string | undefined>(undefined);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const isFetchingCategoriesRef = React.useRef(false);
  const isFetchingDataRef = React.useRef(false);

  const [range, setRange] = React.useState<{ from: Date; to: Date }>(() => {
    const now = new Date();
    const from = now;
    const to = now;
    return { from, to };
  });

  const { handlePrint } = usePrintReport<ItemCategoryRow>();

  const formatRangeParam = (d: Date) => format(d, "yyyy-MM-dd");

  const parseInvoiceDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    try {
      const cleanDate = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
      const parsedDate = new Date(cleanDate);
      if (isNaN(parsedDate.getTime())) {
        const match = dateString.match(/(\w+), (\w+) (\d+)(st|nd|rd|th), (\d{4})/);
        if (match) {
          const [, , month, day, , year] = match;
          const monthIndex = new Date(`${month} 1, 2000`).getMonth();
          return new Date(parseInt(year), monthIndex, parseInt(day));
        }
      }
      return parsedDate;
    } catch (error) {
      return new Date();
    }
  };

  const handleCategoryDropdownChange = (open: boolean) => {
    if (!open) setCategorySearchTerm("");
  };

  React.useEffect(() => {
    const fetchCategories = async () => {
      if (isFetchingCategoriesRef.current) return;
      isFetchingCategoriesRef.current = true;

      try {
        setCategoriesLoading(true);
        const response = await getItemCategories(location);
        if (response.success) {
          setItemCategories(response.data);
        } else {
          setItemCategories([]);
        }
      } catch (error) {
        setItemCategories([]);
      } finally {
        setCategoriesLoading(false);
        isFetchingCategoriesRef.current = false;
      }
    };
    fetchCategories();
  }, [location]);

  const fetchItemCategoryData = React.useCallback(async (page = 1, limit = 20) => {
    if (isFetchingDataRef.current) return;
    isFetchingDataRef.current = true;

    try {
      setIsLoading(true);
      setError(null);
      
      const startDate = formatRangeParam(range.from);
      const endDate = formatRangeParam(range.to);
      
      const selectedCategoryData = itemCategories.find(cat => cat.name === selectedCategory);
      const categoryId = selectedCategoryData?.id;
      
      const response = await getItemCategory(location, startDate, endDate, categoryId, page, limit, summariesOnly);
      
      if (response.success) {
        setData(response.data);
        setFooter(response.footer || null);
        if (response.pagination) {
          setPagination(response.pagination);
        } else {
          // Fallback for APIs without pagination meta
          const total = response.data.length;
          setPagination({ page, limit, total, totalPages: Math.ceil(total / limit) });
        }
      } else {
        setError(response.message || "Failed to fetch data");
        setData([]);
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch (error) {
      setError("An error occurred while fetching data");
      setData([]);
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
    } finally {
      setIsLoading(false);
      isFetchingDataRef.current = false;
    }
  }, [location, range, selectedCategory, itemCategories, summariesOnly]);

  React.useEffect(() => {
    // Only fetch data if categories have been loaded or "All" is selected
    if (!categoriesLoading) {
      fetchItemCategoryData(pagination.page, pagination.limit);
    }
  }, [categoriesLoading, fetchItemCategoryData, pagination.page, pagination.limit]);
  
  const refetch = React.useCallback(() => {
    fetchItemCategoryData(pagination.page, pagination.limit);
  }, [fetchItemCategoryData, pagination.page, pagination.limit]);

  const handlePageChange = React.useCallback((page: number) => {
    setPagination(p => ({ ...p, page }));
  }, []);

  const handleRowsPerPageChange = React.useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPagination(p => ({ ...p, page: 1, limit: newRowsPerPage }));
  }, []);

  const handleViewFilterChange = (filterKey: string | undefined) => {
    setActiveViewFilter(filterKey);
    setSummariesOnly(filterKey === 'summaries');
  };

  // Dynamic columns based on summaries mode
  const columns = React.useMemo(() => {
    const baseColumns = [
      { 
        accessorKey: "date", 
        header: "Date",
        size: 250,
        meta: { printable: true, printableName: "Date" },
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          if (row.original.isGrandTotal) return null;
          if (row.original.date?.includes(',')) return <div className="whitespace-nowrap text-left py-2">{row.original.date}</div>;
          
          const date = parseInvoiceDate(row.original.date || "");
          return <div className="whitespace-nowrap text-left py-2">{format(date, "EEEE, MMMM do, yyyy")}</div>;
        }
      },
      { 
        accessorKey: "itemCategory", 
        header: "Item Category",
        size: 150,
        meta: { printable: true, printableName: "Item Category" },
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          if (row.original.isGrandTotal) return null;
          return <div className="text-left py-2"><span className="font-bold">{row.original.itemCategory}</span></div>;
        }
      },
      {
        accessorKey: "subtotal",
        header: "Subtotal",
        size: 120,
        meta: { printable: true, printableName: "Subtotal", exportFormatter: (v: unknown) => formatCurrency(v as number) },
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          const value = row.original.subtotal;
          if (row.original.isGrandTotal) {
            return <div className="text-right font-bold text-lg py-2">{formatCurrency(value)}</div>;
          }
          return <div className="text-right whitespace-nowrap py-2">{formatCurrency(value)}</div>;
        },
      },
      {
        accessorKey: "tax",
        header: "Tax",
        size: 100,
        meta: { printable: true, printableName: "Tax", exportFormatter: (v: unknown) => formatCurrency(v as number) },
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          const value = row.original.tax;
          if (row.original.isGrandTotal) {
            return <div className="text-right font-bold text-lg py-2">{formatCurrency(value)}</div>;
          }
          return <div className="text-right whitespace-nowrap py-2">{formatCurrency(value)}</div>;
        },
      },
      {
        accessorKey: "total",
        header: "Total",
        size: 120,
        meta: { printable: true, printableName: "Total", exportFormatter: (v: unknown) => formatCurrency(v as number) },
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          const value = row.original.total;
          if (row.original.isGrandTotal) {
            return <div className="text-right font-bold text-lg py-2">{formatCurrency(value)}</div>;
          }
          return <div className="text-right whitespace-nowrap py-2">{formatCurrency(value)}</div>;
        },
      },
    ];

    if (summariesOnly) {
      return baseColumns;
    }

    return [
      ...baseColumns.slice(0, 2),
      {
        accessorKey: "id",
        header: "ID",
        size: 100,
        meta: { printable: true, printableName: "ID" },
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          if (row.original.isSummary || row.original.isGrandTotal) return null;
          return <div className="whitespace-nowrap text-ellipsis overflow-hidden py-2" style={{ maxWidth: '80px' }}>{row.original.id || 'N/A'}</div>;
        },
      },
      {
        accessorKey: "customer",
        header: "Customer",
        size: 150,
        meta: { printable: true, printableName: "Customer" },
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          if (row.original.isSummary || row.original.isGrandTotal) return null;
          return <div className="whitespace-nowrap text-ellipsis overflow-hidden py-2">{row.original.customer}</div>;
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 300,
        meta: { printable: true, printableName: "Description" },
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          if (row.original.isGrandTotal) return null;
          return <div className="text-ellipsis overflow-hidden py-2">{row.original.description}</div>;
        },
      },
      ...baseColumns.slice(2),
    ];
  }, [summariesOnly]);

  const filteredCategories = React.useMemo(() => {
    if (!categorySearchTerm) return itemCategories;
    return itemCategories.filter(category => 
      category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  }, [itemCategories, categorySearchTerm]);

  const footerRow = React.useMemo(() => {
    if (!footer || !summariesOnly) return undefined;
    return {
      id: '',
      customer: '',
      description: '',
      itemCategory: '',
      date: 'GRAND TOTAL',
      isGrandTotal: true,
      ...footer,
    };
  }, [footer]);

  const {
    exportToCsv,
    exportToPdf,
    exportToHtml,
    exportToJson,
    exportToText,
    exportToExcel,
  } = useExportableData({
    reportTitle: 'Items Sold by Category Report',
    columns,
    data: data,
    footer: footerRow,
  });

  const onPrintClick = () => {
    handlePrint({
      reportTitle: 'Items Sold by Category Report',
      columns,
      data: data,
      footer: footerRow,
    });
  };

  // Show loading animation
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation 
          size="xl" 
          text="Loading item category data..." 
          className="text-center"
        />
      </div>  
    );
  }

  return (
    <ReportPageLayout
      title="Items Sold by Category"
      subtitle="Detailed report of items sold, grouped by category"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
    >
        {/* Top filters */}
        <CustomTable
          data={data}
          columns={columns}
          footerRow={footerRow}
          enableSearch={false}
          enableExport={true}
          enableFilter={true}
          enablePrint={true}
          onPrint={onPrintClick}
          enableRowsPerPage={true}
          onExport={{
            csv: exportToCsv,
            pdf: exportToPdf,
            html: exportToHtml,
            json: exportToJson,
            text: exportToText,
            excel: exportToExcel,
          }}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          onRowsPerPageChange={handleRowsPerPageChange}
          serverSidePagination={pagination}
          onServerSidePageChange={handlePageChange}
          // Server-side filter configuration
          serverSideFilterOptions={[
            { key: 'summaries', label: 'Summary Only' },
          ]}
          activeServerSideFilter={activeViewFilter}
          onServerSideFilterChange={handleViewFilterChange}
          defaultFilterLabel="All Items"
          // Date Range Picker Props
          enableDateRangePicker={true}
          dateRange={range}
          onDateRangeChange={(r) => r && setRange(r)}
          // Custom header for category filter
          customHeaderComponent={
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory} 
              disabled={categoriesLoading}
              onOpenChange={handleCategoryDropdownChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select Category"} />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search categories..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="pl-8 h-8"
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground border-b">
                    Category
                  </div>
                  <SelectItem value="All">All Categories</SelectItem>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                  {filteredCategories.length === 0 && categorySearchTerm && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No categories found
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>
          }
        />
      {error && <div className="text-sm text-red-600">{error}</div>}
    </ReportPageLayout>
  );
}