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
import { getItemCategories, getAllItemCategoryData, ItemCategoryRow, ItemCategoryOption } from "./item-category.api";

interface ItemCategoryClientProps {
  location: string;
}

export function ItemCategoryClient({ location }: ItemCategoryClientProps) {
  const [data, setData] = React.useState<ItemCategoryRow[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [itemCategories, setItemCategories] = React.useState<ItemCategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [categoriesLoading, setCategoriesLoading] = React.useState<boolean>(true);
  const [categorySearchTerm, setCategorySearchTerm] = React.useState<string>("");
  const [summariesOnly, setSummariesOnly] = React.useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const [range, setRange] = React.useState<{ from: Date; to: Date }>(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from, to };
  });

  const formatRangeParam = (d: Date) => format(d, "yyyy-MM-dd");

  // Parse the specific date format from API: "Wednesday, October 1st, 2025"
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
      // console.error('Error parsing invoice date:', dateString, error);
      return new Date();
    }
  };

  // Handle category dropdown open/close
  const handleCategoryDropdownChange = (open: boolean) => {
    if (!open) {
      setCategorySearchTerm("");
    }
  };

  // Fetch item categories for dropdown
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await getItemCategories(location);
        if (response.success) {
          setItemCategories(response.data);
        } else {
          // console.error('Failed to fetch categories:', response.message);
          setItemCategories([
            { id: "equipment", name: "Equipment" },
            { id: "clothing", name: "Clothing" },
            { id: "accessories", name: "Accessories" }
          ]);
        }
      } catch (error) {
        // console.error('Error fetching categories:', error);
        setItemCategories([
          { id: "equipment", name: "Equipment" },
          { id: "clothing", name: "Clothing" },
          { id: "accessories", name: "Accessories" }
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [location]);

  // Fetch table data from API
  const fetchItemCategoryData = React.useCallback(async (page = 1, limit = 20) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const startDate = formatRangeParam(range.from);
      const endDate = formatRangeParam(range.to);
      
      const selectedCategoryData = itemCategories.find(cat => cat.name === selectedCategory);
      const categoryId = selectedCategoryData?.id;
      
      // console.log('API Call Parameters:', {
      //   location,
      //   startDate,
      //   endDate,
      //   categoryId,
      //   selectedCategory,
      //   page,
      //   limit
      // });
      
      const response = await getAllItemCategoryData(location, startDate, endDate, categoryId);
      
      // console.log('API Response:', response);
      // console.log('Total rows returned:', response.data?.length);
      
      if (response.data && response.data.length > 0) {
        const uniqueDates = [...new Set(response.data.map(row => row.date))];
        // console.log('Unique dates in API response:', uniqueDates);
      }
      
      if (response.success) {
        setData(response.data);
        // Calculate pagination info
        const total = response.data.length;
        const actualLimit = limit === -1 ? total : limit;
        const totalPages = limit === -1 ? 1 : Math.ceil(total / limit);
        
        // console.log('Pagination calculated:', {
        //   page,
        //   limit: actualLimit,
        //   total,
        //   totalPages
        // });
        
        setPagination({
          page,
          limit: actualLimit,
          total,
          totalPages
        });
      } else {
        setError(response.message || "Failed to fetch data");
        setData([]);
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch (error) {
      // console.error('Error fetching data:', error);
      setError("An error occurred while fetching data");
      setData([]);
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [location, range, selectedCategory, itemCategories]);

  // Initial data fetch
  React.useEffect(() => {
    if (itemCategories.length > 0 || selectedCategory === "All") {
      fetchItemCategoryData(1, 20);
    }
  }, [location, range, selectedCategory, itemCategories, fetchItemCategoryData]);

  // Handle pagination change
  const handlePageChange = React.useCallback((page: number) => {
    fetchItemCategoryData(page, pagination.limit);
  }, [fetchItemCategoryData, pagination.limit]);

  // Handle rows per page change
  const handleRowsPerPageChange = React.useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    const actualLimit = newRowsPerPage === -1 ? 999999 : newRowsPerPage;
    fetchItemCategoryData(1, actualLimit);
  }, [fetchItemCategoryData]);

  // Dynamic columns based on summaries mode
  const columns = React.useMemo(() => {
    const baseColumns = [
      { 
        accessorKey: "date", 
        header: "",
        size: 250,
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          const isGrandTotal = row.original.isGrandTotal;
          
          if (isGrandTotal) return null;
          
          if (row.original.date && typeof row.original.date === 'string' && row.original.date.includes(',')) {
            return (
              <div className="whitespace-nowrap text-left py-2">
                {row.original.date}
              </div>
            );
          }
          
          const date = parseInvoiceDate(row.original.date || "");
          const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          };
          return (
            <div className="whitespace-nowrap text-left py-2">
              {date.toLocaleDateString('en-US', options)}
            </div>
          );
        }
      },
      { 
        accessorKey: "itemCategory", 
        header: "Item Category",
        size: 150,
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          const value = row.original.itemCategory;
          const isGrandTotal = row.original.isGrandTotal;
          
          if (isGrandTotal) return null;
          
          return (
            <div className="text-left py-2">
              <span className="font-bold">{value}</span>
            </div>
          );
        }
      },
      {
        accessorKey: "subtotal",
        header: "Subtotal",
        size: 120,
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          const isGrandTotal = row.original.isGrandTotal;
          
          if (isGrandTotal) {
            return (
              <div className="text-right font-bold text-lg py-2">
                {row.original.subtotal.toFixed(2)}
              </div>
            );
          }
          
          const value = `$${row.original.subtotal.toFixed(2)}`;
          return (
            <div className="text-right whitespace-nowrap py-2">
              {value}
            </div>
          );
        },
      },
      {
        accessorKey: "tax",
        header: "Tax",
        size: 100,
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          const taxValue = row.original.tax;
          const isGrandTotal = row.original.isGrandTotal;
          
          if (isGrandTotal) {
            const value = taxValue === 0 ? '0' : taxValue.toFixed(2);
            return (
              <div className="text-right font-bold text-lg py-2">
                {value}
              </div>
            );
          }
          
          const value = taxValue === 0 ? '$0' : `$${taxValue.toFixed(2)}`;
          return (
            <div className="text-right whitespace-nowrap py-2">
              {value}
            </div>
          );
        },
      },
      {
        accessorKey: "total",
        header: "Total",
        size: 120,
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          const isGrandTotal = row.original.isGrandTotal;
          
          if (isGrandTotal) {
            return (
              <div className="text-right font-bold text-lg py-2">
                {row.original.total.toFixed(2)}
              </div>
            );
          }
          
          const value = `$${row.original.total.toFixed(2)}`;
          return (
            <div className="text-right whitespace-nowrap py-2">
              {value}
            </div>
          );
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
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          const value = row.original.id;
          const isSummary = row.original.isSummary;
          const isGrandTotal = row.original.isGrandTotal;
          
          if (isSummary || isGrandTotal) return null;
          
          return (
            <div className="whitespace-nowrap text-ellipsis overflow-hidden py-2" style={{ maxWidth: '80px' }}>
              {value || 'N/A'}
            </div>
          );
        },
      },
      {
        accessorKey: "customer",
        header: "Customer",
        size: 150,
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          const value = row.original.customer;
          const isSummary = row.original.isSummary;
          const isGrandTotal = row.original.isGrandTotal;
          
          if (isSummary || isGrandTotal) return null;
          
          return (
            <div className="whitespace-nowrap text-ellipsis overflow-hidden py-2">
              {value}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 300,
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          const value = row.original.description;
          const isGrandTotal = row.original.isGrandTotal;
          
          if (isGrandTotal) return null;
          
          return (
            <div className="text-ellipsis overflow-hidden py-2">
              {value}
            </div>
          );
        },
      },
      ...baseColumns.slice(2),
    ];
  }, [summariesOnly]);

  // Filter categories based on search term
  const filteredCategories = React.useMemo(() => {
    if (!categorySearchTerm) return itemCategories;
    return itemCategories.filter(category => 
      category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  }, [itemCategories, categorySearchTerm]);

  // Filter options for the table
  const filterOptions = React.useMemo(() => {
    return [{
      key: 'summaries-only',
      label: 'Summaries Only',
      checked: summariesOnly,
      onToggle: setSummariesOnly,
      predicate: () => true
    }];
  }, [summariesOnly]);

  // Process data based on summaries only setting
  const processedData = React.useMemo(() => {
    if (!summariesOnly) {
      return data;
    }

    const filteredData = data.filter(row => {
      if (!row.date) return false;
      
      const rowDate = parseInvoiceDate(row.date);
      const startDate = new Date(range.from);
      const endDate = new Date(range.to);
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      rowDate.setHours(0, 0, 0, 0);
      
      return rowDate >= startDate && rowDate <= endDate;
    });

    const groupedData = filteredData.reduce((acc, row) => {
      const invoiceDate = parseInvoiceDate(row.date || "");
      const dateKey = invoiceDate.toDateString();
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          originalDate: row.date || '',
          itemCategory: row.itemCategory,
          subtotal: 0,
          tax: 0,
          total: 0,
          count: 0,
          subtotalValues: []
        };
      }
      
      acc[dateKey].subtotal += row.subtotal;
      acc[dateKey].tax += row.tax;
      acc[dateKey].total += row.total;
      acc[dateKey].count += 1;
      acc[dateKey].subtotalValues.push(row.subtotal);
      
      return acc;
    }, {} as Record<string, { date: string; originalDate: string; itemCategory: string; subtotal: number; tax: number; total: number; count: number; subtotalValues: number[] }>);

    const result = Object.values(groupedData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((summary) => {
        const averageSubtotal = summary.subtotalValues.length > 0 
          ? summary.subtotal / summary.subtotalValues.length 
          : 0;

        return {
          itemCategory: summary.itemCategory,
          id: '',
          customer: '',
          description: `${summary.count} item(s)`,
          subtotal: averageSubtotal,
          tax: summary.tax,
          total: summary.total,
          date: summary.originalDate || summary.date,
          isSummary: true,
          subtotalCount: summary.count,
          subtotalSum: summary.subtotal
        };
      });

    return result;
  }, [data, summariesOnly, range]);

  // Paginate the data FIRST
  const paginatedDataBeforeTotals = React.useMemo(() => {
    if (rowsPerPage === -1) {
      // Show all
      return processedData;
    }

    const startIdx = (pagination.page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;

    return processedData.slice(startIdx, endIdx);
  }, [processedData, pagination.page, rowsPerPage]);

  // Calculate grand total from ONLY the current page's data
  const grandTotalRow = React.useMemo(() => {
    const baseData = paginatedDataBeforeTotals;
    
    if (summariesOnly) {
      const grandTotals = baseData.reduce((acc, row) => {
        const summaryRow = row as ItemCategoryRow & { subtotalSum?: number; subtotalCount?: number };
        return {
          subtotal: acc.subtotal + (summaryRow.subtotalSum || summaryRow.subtotal),
          tax: acc.tax + summaryRow.tax,
          total: acc.total + summaryRow.total,
          subtotalCount: acc.subtotalCount + (summaryRow.subtotalCount || 0)
        };
      }, { subtotal: 0, tax: 0, total: 0, subtotalCount: 0 });

      return {
        itemCategory: '',
        id: '',
        customer: '',
        description: `${grandTotals.subtotalCount} subtotal(s)`,
        subtotal: grandTotals.subtotal,
        tax: grandTotals.tax,
        total: grandTotals.total,
        date: '',
        isGrandTotal: true
      };
    } else {
      const grandTotals = baseData.reduce((acc, row) => ({
        subtotal: acc.subtotal + row.subtotal,
        tax: acc.tax + row.tax,
        total: acc.total + row.total
      }), { subtotal: 0, tax: 0, total: 0 });

      return {
        itemCategory: '',
        id: '',
        customer: '',
        description: '',
        subtotal: grandTotals.subtotal,
        tax: grandTotals.tax,
        total: grandTotals.total,
        date: '',
        isGrandTotal: true
      };
    }
  }, [paginatedDataBeforeTotals, summariesOnly]);

  // Add grand total row to paginated data
  const dataWithTotal = React.useMemo(() => {
    return [...paginatedDataBeforeTotals, grandTotalRow];
  }, [paginatedDataBeforeTotals, grandTotalRow]);

  // dataWithTotal already has pagination applied and grand total for current page
  const paginatedDataWithTotal = dataWithTotal;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading report..." className="text-center" />
      </div>
    );
  }

  const dateLabel = (() => {
    const from = range.from;
    const to = range.to;
    const sameDay = from.toDateString() === to.toDateString();
    if (sameDay) return format(from, "MMMM do, yyyy");
    const fromStr = format(from, "MMM do, yyyy");
    const toStr = format(to, "MMM do, yyyy");
    return `${fromStr} - ${toStr}`;
  })();

  const handleExport = {
    csv: (data: ItemCategoryRow[]) => {
      const headers = ["Item Category", "ID", "Customer", "Description", "Subtotal", "Tax", "Total"];
      const csvContent = [
        headers.join(","),
        ...data.map(row => [
          `"${row.itemCategory}"`,
          `"${row.id}"`,
          `"${row.customer}"`,
          `"${row.description}"`,
          row.subtotal.toFixed(2),
          row.tax.toFixed(2),
          row.total.toFixed(2)
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const categorySuffix = selectedCategory !== "All" ? `-${selectedCategory.replace(/\s+/g, '-')}` : "";
      a.download = `items-sold-by-category${categorySuffix}-${dateLabel.replace(/\s+/g, '-')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl space-y-4">
        {/* Top filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <DateRangePicker value={range} onChange={(r) => r && setRange(r)} />
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
            </div>
          </div>
        </div>

        {/* Main table */}
        <Card className="p-3 md:p-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold md:text-lg">Items Sold by Category</h2>
          </div>
          <CustomTable
            data={paginatedDataWithTotal}
            columns={columns}
            enableSearch={false}
            enableExport={true}
            enableFilter={true}
            enablePrint={true}
            enableRowsPerPage={true}
            title={undefined}
            filterOptions={filterOptions}
            onExport={handleExport}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            onRowsPerPageChange={handleRowsPerPageChange}
            serverSidePagination={pagination}
            onServerSidePageChange={handlePageChange}
          />
        </Card>
        
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
}