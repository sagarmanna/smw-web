import { useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportableDataOptions<TData> {
  reportTitle: string;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  footer?: TData;
}

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export function useExportableData<TData>({ reportTitle, columns, data, footer }: ExportableDataOptions<TData>) {
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
    const doc = new jsPDF();
    doc.text(reportTitle, 14, 15);
    const body = data.map(row => getFormattedRow(row));
    if (footer) {
      body.push(getFormattedRow(footer));
    }
    autoTable(doc, {
      head: [headers],
      body: body,
      startY: 25,
    });
    doc.save(`${reportTitle}.pdf`);
  }, [data, footer, headers, getFormattedRow, reportTitle]);

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
    const lines = data.map(row => getFormattedRow(row).join('\t'));
    const footerLine = footer ? getFormattedRow(footer).join('\t') : '';
    const content = [...lines, footerLine].join('\r\n');
    download(new Blob([content], { type: 'text/plain;charset=utf-8;' }), `${reportTitle}.txt`);
  }, [data, footer, getFormattedRow, reportTitle]);

  const exportToExcel = useCallback(() => {
    const lines = data.map(row => getFormattedRow(row).map(field => `"${String(field).replace(/"/g, '""')}"`).join(","));
    const footerLine = footer ? getFormattedRow(footer).map(field => `"${String(field).replace(/"/g, '""')}"`).join(",") : "";
    const excelContent = [headers.join(","), ...lines, footerLine].join("\r\n");
    download(new Blob([excelContent], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;" }), `${reportTitle}.xlsx`);
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
