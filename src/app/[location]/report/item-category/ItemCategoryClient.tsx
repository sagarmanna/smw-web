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
      // Handle the specific format: "Wednesday, October 1st, 2025"
      const cleanDate = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
      const parsedDate = new Date(cleanDate);
      
      // If parsing failed, try alternative approach
      if (isNaN(parsedDate.getTime())) {
        // Extract month, day, year from the string
        const match = dateString.match(/(\w+), (\w+) (\d+)(st|nd|rd|th), (\d{4})/);
        if (match) {
          const [, , month, day, , year] = match;
          const monthIndex = new Date(`${month} 1, 2000`).getMonth();
          return new Date(parseInt(year), monthIndex, parseInt(day));
        }
      }
      
      return parsedDate;
    } catch (error) {
      console.error('Error parsing invoice date:', dateString, error);
      return new Date();
    }
  };

  // Handle category dropdown open/close
  const handleCategoryDropdownChange = (open: boolean) => {
    if (!open) {
      setCategorySearchTerm(""); // Clear search when dropdown closes
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
          console.error('Failed to fetch categories:', response.message);
          // Fallback to mock categories if API fails
          setItemCategories([
            { id: "equipment", name: "Equipment" },
            { id: "clothing", name: "Clothing" },
            { id: "accessories", name: "Accessories" }
          ]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to mock categories
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
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const startDate = formatRangeParam(range.from);
        const endDate = formatRangeParam(range.to);
        
        // Get category ID from selected category
        const selectedCategoryData = itemCategories.find(cat => cat.name === selectedCategory);
        const categoryId = selectedCategoryData?.id;
        
        // Debug logging for API parameters
        console.log('API Call Parameters:', {
          location,
          startDate,
          endDate,
          categoryId,
          selectedCategory,
          rangeFrom: range.from,
          rangeTo: range.to
        });
        
        // Use the getAllItemCategoryData function to fetch all pages
        const response = await getAllItemCategoryData(location, startDate, endDate, categoryId);
        
        // Debug logging
        console.log('API Response:', response);
        console.log('Total rows returned:', response.data?.length);
        console.log('Sample row data:', response.data[0]);
        
        // Log all unique dates in the response
        if (response.data && response.data.length > 0) {
          const uniqueDates = [...new Set(response.data.map(row => row.date))];
          console.log('Unique dates in API response:', uniqueDates);
        }
        
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || "Failed to fetch data");
          setData([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("An error occurred while fetching data");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have categories loaded and not in initial loading state
    if (itemCategories.length > 0 || selectedCategory === "All") {
      fetchData();
    }
  }, [location, range, selectedCategory, itemCategories]);

  // Dynamic columns based on summaries mode
  const columns = React.useMemo(() => {
    const baseColumns = [
      { 
        accessorKey: "date", 
        header: "",
        size: 250,
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
          const isGrandTotal = row.original.isGrandTotal;
          
          // Hide date column in grand total row
          if (isGrandTotal) return null;
          
          // If the date is already in the correct format from API, display it as is
          if (row.original.date && typeof row.original.date === 'string' && row.original.date.includes(',')) {
            return (
              <div className="whitespace-nowrap text-left py-2">
                {row.original.date}
              </div>
            );
          }
          
          // Otherwise, parse and format the date
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
          
          // Hide item category column in grand total row
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
            // Show grand total value in subtotal column - right aligned to match other values
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
            // Show grand total value - right aligned to match other values
            const value = taxValue === 0 ? '0' : taxValue.toFixed(2);
            return (
              <div className="text-right font-bold text-lg py-2">
                {value}
              </div>
            );
          }
          
          // Show 0 instead of 0.00 when tax is zero
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
            // Show grand total value - right aligned to match other values
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

    // In summaries mode, only show the 5 columns: date, itemCategory, subtotal, tax, total
    if (summariesOnly) {
      return baseColumns;
    }

    // In normal mode, add the additional columns
    return [
      ...baseColumns.slice(0, 2), // date and itemCategory
    {
      accessorKey: "id",
      header: "ID",
        size: 100,
        cell: ({ row }: { row: { original: ItemCategoryRow & { isSummary?: boolean; isGrandTotal?: boolean } } }) => {
        const value = row.original.id;
          const isSummary = row.original.isSummary;
          const isGrandTotal = row.original.isGrandTotal;
          
          // Hide ID column in summary mode or grand total row
          if (isSummary || isGrandTotal) return null;
          
          // Show fallback if no ID with proper styling
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
          
          // Hide customer column in summary mode or grand total row
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
          
          // Hide description column in grand total row
          if (isGrandTotal) return null;
          
          return (
            <div className="text-ellipsis overflow-hidden py-2">
              {value}
            </div>
          );
        },
      },
      ...baseColumns.slice(2), // subtotal, tax, total
    ];
  }, [summariesOnly]);

  // Filter categories based on search term
  const filteredCategories = React.useMemo(() => {
    if (!categorySearchTerm) return itemCategories;
    return itemCategories.filter(category => 
      category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  }, [itemCategories, categorySearchTerm]);

  // Filter options for the table - only Summaries Only checkbox
  const filterOptions = React.useMemo(() => {
    return [{
      key: 'summaries-only',
      label: 'Summaries Only',
      checked: summariesOnly,
      onToggle: setSummariesOnly,
      predicate: () => true // This doesn't filter data, it's handled in processedData
    }];
  }, [summariesOnly]);

  // Process data based on summaries only setting
  const processedData = React.useMemo(() => {
    if (!summariesOnly) {
      console.log('Main table mode - returning raw data:', data.length, 'rows');
      console.log('Main table data sample:', data.slice(0, 3));
      return data;
    }

    console.log('Summaries mode - processing data:', data.length, 'rows');
    console.log('Date range:', range.from, 'to', range.to);

    // Filter data by selected date range first
    const filteredData = data.filter(row => {
      if (!row.date) {
        console.log('Row without date:', row);
        return false;
      }
      
      // Parse the invoice date from API using the specific format
      const rowDate = parseInvoiceDate(row.date);
      const startDate = new Date(range.from);
      const endDate = new Date(range.to);
      
      // Set time to start/end of day for proper comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      rowDate.setHours(0, 0, 0, 0);
      
      const isInRange = rowDate >= startDate && rowDate <= endDate;
      console.log('Invoice date check:', {
        originalDate: row.date,
        parsedDate: rowDate.toDateString(),
        startDate: startDate.toDateString(),
        endDate: endDate.toDateString(),
        isInRange,
        subtotal: row.subtotal,
        itemCategory: row.itemCategory
      });
      
      return isInRange;
    });

    console.log('Filtered data for summaries:', filteredData.length, 'rows');

    // Group filtered data by invoice date and calculate summaries
    const groupedData = filteredData.reduce((acc, row) => {
      // Parse the invoice date using the specific format
      const invoiceDate = parseInvoiceDate(row.date || "");
      const dateKey = invoiceDate.toDateString();
      
      console.log('Processing row for grouping by invoice date:', {
        originalInvoiceDate: row.date,
        parsedInvoiceDate: invoiceDate.toDateString(),
        dateKey,
        subtotal: row.subtotal,
        itemCategory: row.itemCategory
      });
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          originalDate: row.date || '', // Keep original date format for display
          itemCategory: row.itemCategory,
          subtotal: 0,
          tax: 0,
          total: 0,
          count: 0,
          subtotalValues: [] // Store individual subtotal values for average calculation
        };
      }
      
      acc[dateKey].subtotal += row.subtotal;
      acc[dateKey].tax += row.tax;
      acc[dateKey].total += row.total;
      acc[dateKey].count += 1;
      acc[dateKey].subtotalValues.push(row.subtotal);
      
      return acc;
    }, {} as Record<string, { date: string; originalDate: string; itemCategory: string; subtotal: number; tax: number; total: number; count: number; subtotalValues: number[] }>);

    console.log('Grouped data:', groupedData);

    // Convert grouped data to array and format, sorted by date
    const result = Object.values(groupedData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((summary) => {
        // Calculate average subtotal for this day
        const averageSubtotal = summary.subtotalValues.length > 0 
          ? summary.subtotal / summary.subtotalValues.length 
          : 0;

        const summaryRow = {
          itemCategory: summary.itemCategory,
          id: '', // No ID in summaries
          customer: '', // No customer in summaries
          description: `${summary.count} item(s)`, // Description shows count
          subtotal: averageSubtotal, // Show average subtotal instead of sum
          tax: summary.tax,
          total: summary.total,
          date: summary.originalDate || summary.date, // Use original date format for display
          isSummary: true,
          subtotalCount: summary.count, // Store count for grand total calculation
          subtotalSum: summary.subtotal // Store sum for grand total calculation
        };

        console.log('Created summary row:', summaryRow);
        return summaryRow;
      });

    console.log('Final summaries result with only data days:', result);
    return result;
  }, [data, summariesOnly, range]);

  // Add grand total row
  const dataWithTotal = React.useMemo(() => {
    const baseData = processedData;
    
    if (summariesOnly) {
      // In summaries mode, calculate grand totals from filtered data
      const grandTotals = baseData.reduce((acc, row) => {
        const summaryRow = row as ItemCategoryRow & { subtotalSum?: number; subtotalCount?: number };
        return {
          subtotal: acc.subtotal + (summaryRow.subtotalSum || summaryRow.subtotal), // Use sum, not average
          tax: acc.tax + summaryRow.tax,
          total: acc.total + summaryRow.total,
          subtotalCount: acc.subtotalCount + (summaryRow.subtotalCount || 0) // Count of subtotals
        };
      }, { subtotal: 0, tax: 0, total: 0, subtotalCount: 0 });

      // Add grand total row with count information
      const grandTotalRow = {
        itemCategory: '', // Empty item category column
        id: '',
        customer: '',
        description: `${grandTotals.subtotalCount} subtotal(s)`, // Show count of subtotals
        subtotal: grandTotals.subtotal,
        tax: grandTotals.tax,
        total: grandTotals.total,
        date: '',
        isGrandTotal: true
      };

      return [...baseData, grandTotalRow];
    } else {
      // In normal mode, use regular calculation
      const grandTotals = baseData.reduce((acc, row) => ({
        subtotal: acc.subtotal + row.subtotal,
        tax: acc.tax + row.tax,
        total: acc.total + row.total
      }), { subtotal: 0, tax: 0, total: 0 });

      // Add grand total row
      const grandTotalRow = {
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

      return [...baseData, grandTotalRow];
    }
  }, [processedData, summariesOnly]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading report..." className="text-center" />
      </div>
    );
  }

  // Format selected date or range for display/print
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
          
          {/* Action buttons */}
          
        </div>

        {/* Main table */}
        <Card className="p-3 md:p-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold md:text-lg">Items Sold by Category</h2>
          </div>
          <CustomTable
            data={dataWithTotal}
            columns={columns}
            enableSearch={false}
            enableExport={true}
            enableFilter={true}
            enablePagination={true}
            enablePrint={true}
            enableShowAll={true}
            pageSize={20}
            title={undefined}
            filterOptions={filterOptions}
            onExport={handleExport}
          />
        </Card>
        
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
}

