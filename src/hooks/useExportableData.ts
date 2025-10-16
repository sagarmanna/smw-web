import { useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatLocationName } from '@/utils/textUtils';

interface ExportableDataOptions<TData> {
  reportTitle: string;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  footer?: TData;
  rightAlignedColumns?: string[]; // Array of column headers that should be right-aligned
  columnWidths?: Record<string, number>; // Custom column widths for PDF export
  location?: string; // Location to display in PDF header
}

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export function useExportableData<TData>({ reportTitle, columns, data, footer, rightAlignedColumns = [], columnWidths = {}, location }: ExportableDataOptions<TData>) {
  const getExportableColumns = useCallback(() => {
    return columns.filter(c => c.meta?.printable);
  }, [columns]);

  const getFormattedRow = useCallback((row: TData) => {
    const exportableColumns = getExportableColumns();
    return exportableColumns.map(col => {
      const accessorKey = 'accessorKey' in col ? col.accessorKey : null;
      if (typeof accessorKey !== 'string') {
        return '';
      }
      
      const value = (row as Record<string, unknown>)[accessorKey];
      if (col.meta?.exportFormatter) {
        return col.meta.exportFormatter(value);
      }
      return value ?? '';
    });
  }, [getExportableColumns]);

  const headers = getExportableColumns().map(c => c.meta?.printableName || (typeof c.header === 'string' ? c.header : ''));

  const exportToCsv = useCallback(() => {
    const lines = data.map(row => getFormattedRow(row).map(field => `"${String(field).replace(/"/g, '""')}"`).join(","));
    const footerLine = footer ? getFormattedRow(footer).map(field => `"${String(field).replace(/"/g, '""')}"`).join(",") : "";
    const csvContent = [headers.join(","), ...lines, footerLine].join("\r\n");
    download(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), `${reportTitle}.csv`);
  }, [data, footer, headers, getFormattedRow, reportTitle]);

  const exportToPdf = useCallback(() => {
    // Determine orientation based on number of columns
    const useLandscape = headers.length > 4;
    const doc = new jsPDF(useLandscape ? 'landscape' : 'portrait');
    
    // Get page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title on the left with larger font
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(reportTitle, 14, 20);
    
    // Add location and generation date on the right with better styling
    const rightMargin = 14;
    let rightY = 15;
    
    // Set font for header info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (location) {
      const formattedLocation = formatLocationName(location);
      doc.text(`Location: ${formattedLocation}`, pageWidth - rightMargin, rightY, { align: 'right' });
      rightY += 5;
    }
    
    // Add generation date in the specified format with better styling
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/,/g, '');
    doc.text(`Generated: ${formattedDate}`, pageWidth - rightMargin, rightY, { align: 'right' });
    
    const body = data.map(row => getFormattedRow(row));
    if (footer) {
      body.push(getFormattedRow(footer));
    }
    
    // Create column styles for alignment and widths
    const columnStyles: Record<string, { halign: 'left' | 'right' | 'center'; cellWidth?: number }> = {};
    headers.forEach((header, index) => {
      const isRightAligned = rightAlignedColumns.includes(header);
      const customWidth = columnWidths[header];
      
      columnStyles[index] = {
        halign: isRightAligned ? 'right' : 'left'
      };
      
      if (customWidth) {
        columnStyles[index].cellWidth = customWidth;
      }
    });
    
    // Start table below the header information with proper spacing
    const startY = location ? 35 : 30;
    
    autoTable(doc, {
      head: [headers],
      body: body,
      startY: startY,
      columnStyles: columnStyles,
    });
    doc.save(`${reportTitle}.pdf`);
  }, [data, footer, headers, getFormattedRow, reportTitle, rightAlignedColumns, columnWidths, location]);

  // Add other export formats here...
  const exportToHtml = useCallback(() => {
    const tableRows = data.map(row => `<tr>${getFormattedRow(row).map(cell => `<td>${cell}</td>`).join('')}</tr>`).join("");
    const footerRowHtml = footer ? `<tfoot><tr>${getFormattedRow(footer).map(cell => `<td>${cell}</td>`).join('')}</tr></tfoot>` : "";
    const html = `<!doctype html><html><head><title>${reportTitle}</title></head><body><h3>${reportTitle}</h3><table border="1"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody>${footerRowHtml}</table></body></html>`;
    download(new Blob([html], { type: "text/html;charset=utf-8;" }), `${reportTitle}.html`);
  }, [data, footer, headers, getFormattedRow, reportTitle]);

  const exportToJson = useCallback(() => {
    const exportData = footer ? { data, footer } : data;
    download(new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json;charset=utf-8;" }), `${reportTitle}.json`);
  }, [data, footer, reportTitle]);
  
  const exportToText = useCallback(() => {
    const headerLine = headers.join('\t');
    const lines = data.map(row => getFormattedRow(row).join('\t'));
    const footerLine = footer ? getFormattedRow(footer).join('\t') : '';
    const content = [headerLine, ...lines, footerLine].join('\r\n');
    download(new Blob([content], { type: 'text/plain;charset=utf-8;' }), `${reportTitle}.txt`);
  }, [data, footer, headers, getFormattedRow, reportTitle]);

  const exportToExcel = useCallback(() => {
    // Create worksheet data
    const worksheetData = [
      headers, // Header row
      ...data.map(row => getFormattedRow(row)), // Data rows
      ...(footer ? [getFormattedRow(footer)] : []) // Footer row if exists
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create blob and download
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    download(blob, `${reportTitle}.xlsx`);
  }, [data, footer, headers, getFormattedRow, reportTitle]);


  return {
    exportToCsv,
    exportToPdf,
    exportToHtml,
    exportToJson,
    exportToText,
    exportToExcel,
  };
}
