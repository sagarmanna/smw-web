import { useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';

interface PrintReportOptions<TData> {
  reportTitle: string;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  footer?: TData;
  location?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  forceCompactMode?: boolean;
  customColumnWidths?: Record<string, string>;
  rightAlignedColumns?: string[];
  groupByCustomer?: boolean;
}

export function usePrintReport<TData>() {
  const handlePrint = useCallback(
    ({ 
      reportTitle, 
      columns, 
      data, 
      footer, 
      location, 
      dateRange, 
      forceCompactMode, 
      customColumnWidths, 
      rightAlignedColumns = [],
      groupByCustomer = false 
    }: PrintReportOptions<TData>) => {
      type AnyCol = ColumnDef<TData, unknown>;

      const printable = (columns as AnyCol[])
        .map((c) => ({
          key: 'accessorKey' in c ? (c.accessorKey as string) : undefined,
          header: c.meta?.printableName || (typeof c.header === 'string' ? c.header : ''),
          size: c.size ?? 100,
          printable: c.meta?.printable === true,
          formatter: c.meta?.exportFormatter,
        }))
        .filter((c) => c.printable && c.key);

      if (printable.length === 0) return;

      const getColumnAlignment = (columnHeader: string): 'left' | 'right' => {
        if (rightAlignedColumns.includes(columnHeader)) {
          return 'right';
        }else{
          return 'left';
        }
        return 'left';
      };

      // Auto-detect if table needs compact mode (more than 8 columns or forceCompactMode)
      const needsCompactMode = forceCompactMode || printable.length > 8;

      if (needsCompactMode) {
        // Use compact print mode for tables with many columns
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Create compact table HTML
        const printRows: string[] = [];
        
        // Determine which columns to show in header (exclude Customer if grouping)
        const headerColumns = groupByCustomer 
          ? printable.filter(col => col.key !== 'customer')
          : printable;
        
        // Add header row
        const headerRow = headerColumns.map((col) => {
          let width = '10%';
          if (customColumnWidths && customColumnWidths[col.header]) {
            width = customColumnWidths[col.header];
          }
          
          const align = getColumnAlignment(col.header);
          
          return `<th style="width: ${width}; text-align: ${align};">${col.header}</th>`;
        }).join('');
        
        printRows.push(`<tr>${headerRow}</tr>`);

        if (groupByCustomer) {
          // Group data by customer
          const groupedData: Record<string, TData[]> = {};
          data.forEach((row) => {
            const customerName = (row as Record<string, unknown>).customer as string || 'Unknown';
            if (!groupedData[customerName]) {
              groupedData[customerName] = [];
            }
            groupedData[customerName].push(row);
          });

          // Get columns excluding customer
          const dataColumns = printable.filter(col => col.key !== 'customer');

          // Process each customer group
          Object.entries(groupedData).forEach(([customerName, customerRows]) => {
            // Add customer header row (spanning all data columns)
            printRows.push(`
              <tr class="customer-header">
                <td colspan="${dataColumns.length}" style="padding: 8px;">
                  ${customerName}
                </td>
              </tr>
            `);

            // Add rows for this customer (excluding customer column)
            customerRows.forEach((row) => {
              const dataRow = dataColumns.map((col) => {
                const value = (row as Record<string, unknown>)[col.key!];
                const formattedValue = col.formatter ? col.formatter(value) : value || '';
                const align = getColumnAlignment(col.header);
                
                return `<td style="text-align: ${align};">${formattedValue}</td>`;
              }).join('');
              printRows.push(`<tr>${dataRow}</tr>`);
            });

            // Calculate subtotal for Net($) column
            const netDollarIndex = dataColumns.findIndex(col => col.header === 'Net($)');
            if (netDollarIndex !== -1) {
              let subtotal = 0;
              customerRows.forEach(row => {
                const netValue = (row as Record<string, unknown>)[dataColumns[netDollarIndex].key!];
                // Parse the currency value (e.g., "$2.58" -> 2.58)
                if (typeof netValue === 'string') {
                  const numValue = parseFloat(netValue.replace(/[^0-9.-]/g, ''));
                  if (!isNaN(numValue)) {
                    subtotal += numValue;
                  }
                } else if (typeof netValue === 'number') {
                  subtotal += netValue;
                }
              });

              // Add subtotal row
              const subtotalRow = dataColumns.map((col) => {
                if (col.header === 'Net($)') {
                  return `<td style="text-align: right;">${subtotal.toFixed(2)}</td>`;
                }
                return `<td></td>`;
              }).join('');
              printRows.push(`<tr class="subtotal-row">${subtotalRow}</tr>`);
            }

            // Add spacing row
            printRows.push(`<tr style="height: 10px;"><td colspan="${dataColumns.length}" style="border: none; background: transparent;"></td></tr>`);
          });
        } else {
          // Original non-grouped layout
          data.forEach((row) => {
            const dataRow = printable.map((col) => {
              const value = (row as Record<string, unknown>)[col.key!];
              const formattedValue = col.formatter ? col.formatter(value) : value || '';
              const align = getColumnAlignment(col.header);
              
              return `<td style="text-align: ${align};">${formattedValue}</td>`;
            }).join('');
            printRows.push(`<tr>${dataRow}</tr>`);
          });
        }

        // Add footer row if available
        if (footer) {
          const footerColumns = groupByCustomer 
            ? printable.filter(col => col.key !== 'customer')
            : printable;
            
          const footerRow = footerColumns.map((col) => {
            const value = (footer as Record<string, unknown>)[col.key!];
            const formattedValue = col.formatter ? col.formatter(value) : value || '';
            const align = getColumnAlignment(col.header);
            return `<td style="text-align: ${align};">${formattedValue}</td>`;
          }).join('');
          printRows.push(`<tr class="footer-row">${footerRow}</tr>`);
        }

        const printContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${reportTitle}</title>
              <style>
                @page { size: A4 landscape; margin: 0.5in; }
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 11px; color: #000; }
                .header { margin-bottom: 20px; }
                .header h1 { font-size: 18px; margin: 0 0 8px 0; font-weight: bold; }
                .header .date { font-size: 13px; margin: 0; color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
                th, td { border: 1px solid #ccc; padding: 6px 8px; vertical-align: middle; }
                th { background-color: #f5f5f5; font-weight: bold; font-size: 11px; }
                .customer-header { background-color: #fff; font-weight: bold; border-bottom: 2px solid #999; }
                .subtotal-row { font-weight: bold; background-color: #fafafa; }
                .footer-row { font-weight: bold; background-color: #f0f0f0; }
                @media print { 
                  body { margin: 0; padding: 15px; } 
                  table { page-break-inside: auto; } 
                  tr { page-break-inside: avoid; page-break-after: auto; }
                  thead { display: table-header-group; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${reportTitle}</h1>
                ${dateRange ? `<div class="date">${new Date(dateRange.from).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} to ${new Date(dateRange.to).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>` : ''}
              </div>
              <table><tbody>${printRows.join('')}</tbody></table>
              <script>window.onload = function() { window.print(); };</script>
            </body>
          </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        return;
      }

      // Original print logic for tables with fewer columns
      const total = printable.reduce((t, c) => t + (c.size || 100), 0) || 1;
      const columnsForPrint = printable.map((c) => ({
        key: c.key!,
        header: c.header,
        align: getColumnAlignment(c.header),
        headerAlign: 'center' as 'left' | 'right' | 'center',
        widthPercent: Math.max(6, Math.round(((c.size || 100) / total) * 100)),
      }));

      const formatRow = (row: TData) => {
        const formattedRow: Record<string, unknown> = {};
        printable.forEach(col => {
          if (col.key) {
            const value = (row as Record<string, unknown>)[col.key];
            formattedRow[col.key] = col.formatter ? col.formatter(value) : value;
          }
        });
        return formattedRow;
      };

      const rowsForPrint = data.map(formatRow);
      const footerForPrint = footer ? formatRow(footer) : undefined;

      const payload = {
        title: reportTitle,
        columns: columnsForPrint,
        rows: rowsForPrint,
        footerRow: footerForPrint,
        location,
        dateRange: dateRange ? {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        } : undefined,
      };

      try {
        sessionStorage.setItem('smw:print', JSON.stringify(payload));
      } catch (e) {
        console.error('Failed to save print data:', e);
      }

      const url = `${window.location.origin}/admin/v2/print`;
      window.open(url, '_blank');
    },
    []
  );

  return { handlePrint };
}
