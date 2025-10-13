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
  forceCompactMode?: boolean; // Force compact mode for tables with many columns
  customColumnWidths?: Record<string, string>; // Custom column widths for print layout
}

export function usePrintReport<TData>() {
  const handlePrint = useCallback(
    ({ reportTitle, columns, data, footer, location, dateRange, forceCompactMode, customColumnWidths }: PrintReportOptions<TData>) => {
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

      // Auto-detect if table needs compact mode (more than 8 columns or forceCompactMode)
      const needsCompactMode = forceCompactMode || printable.length > 8;

      if (needsCompactMode) {
        // Use compact print mode for tables with many columns
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Create compact table HTML
        const printRows: string[] = [];
        
        // Add header row with compact styling
        const headerRow = printable.map((col, i) => {
          // Use custom width if provided, otherwise use smart defaults
          let width = '8%'; // default
          if (customColumnWidths && customColumnWidths[col.header]) {
            width = customColumnWidths[col.header];
          } else {
            // Smart defaults based on column position and type
            if (i === 0) width = '20%'; // First column (usually names/descriptions)
            else if (i === 1) width = '12%'; // Second column (usually codes/IDs)
            else if (i === 2) width = '15%'; // Third column (usually descriptions)
            else width = '8%'; // Other columns
          }
          
          const align = i === 0 ? 'left' : 'right';
          return `<th style="border: 1px solid #d1d5db; padding: 4px 2px; text-align: center; width: ${width}; font-size: 10px; background-color: #f3f4f6; font-weight: bold;">${col.header}</th>`;
        }).join('');
        
        printRows.push(`<tr>${headerRow}</tr>`);

        // Add data rows
        data.forEach((row) => {
          const dataRow = printable.map((col, i) => {
            const value = (row as Record<string, unknown>)[col.key!];
            const formattedValue = col.formatter ? col.formatter(value) : value || '';
            // Code column should be left-aligned, others right-aligned
            const align = (i === 0 || col.header === 'Code') ? 'left' : 'right';
            
            const cellStyle = `border: 1px solid #d1d5db; padding: 3px 2px; text-align: ${align}; font-size: 9px; word-break: break-word;`;
            
            return `<td style="${cellStyle}">${formattedValue}</td>`;
          }).join('');
          printRows.push(`<tr>${dataRow}</tr>`);
        });

        // Add footer row if available
        if (footer) {
          const footerRow = printable.map((col, i) => {
            const value = (footer as Record<string, unknown>)[col.key!];
            const formattedValue = col.formatter ? col.formatter(value) : value || '';
            // Code column should be left-aligned, others right-aligned
            const align = (i === 0 || col.header === 'Code') ? 'left' : 'right';
            return `<td style="border: 1px solid #d1d5db; padding: 3px 2px; text-align: ${align}; font-size: 9px; font-weight: bold; background-color: #f9fafb;">${formattedValue}</td>`;
          }).join('');
          printRows.push(`<tr>${footerRow}</tr>`);
        }

        const printContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${reportTitle}</title>
              <style>
                @page { size: A4 landscape; margin: 0.5in; }
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; font-size: 10px; color: #000; }
                h1 { font-size: 16px; margin-bottom: 5px; text-align: center; }
                .date { font-size: 12px; margin-bottom: 15px; text-align: center; color: #666; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9px; }
                th, td { border: 1px solid #d1d5db; padding: 3px 2px; vertical-align: top; }
                th { background-color: #f3f4f6; font-weight: bold; font-size: 10px; }
                @media print { body { margin: 0; padding: 0; } table { page-break-inside: auto; } tr { page-break-inside: avoid; } }
              </style>
            </head>
            <body>
              <h1>${reportTitle}</h1>
              ${location ? `<div class="date"><strong>Location:</strong> ${location}</div>` : ''}
              ${dateRange ? `<div class="date"><strong>Date Range:</strong> ${new Date(dateRange.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(dateRange.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>` : ''}
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
      const columnsForPrint = printable.map((c, i) => ({
        key: c.key!,
        header: c.header,
        align: (i === 0 ? 'left' : 'right') as 'left' | 'right',
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
