import { useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';

interface PrintReportOptions<TData> {
  reportTitle: string;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  footer?: TData;
}

export function usePrintReport<TData>() {
  const handlePrint = useCallback(
    ({ reportTitle, columns, data, footer }: PrintReportOptions<TData>) => {
      type AnyCol = ColumnDef<TData, unknown>;

      const printable = (columns as AnyCol[])
        .map((c) => ({
          key: 'accessorKey' in c ? (c.accessorKey as string) : undefined,
          header: c.meta?.printableName || (typeof c.header === 'string' ? c.header : ''),
          size: c.size ?? 100,
          printable: c.meta?.printable === true,
        }))
        .filter((c) => c.printable && c.key);

      if (printable.length === 0) return;

      const total = printable.reduce((t, c) => t + (c.size || 100), 0) || 1;
      const columnsForPrint = printable.map((c, i) => ({
        key: c.key!,
        header: c.header,
        align: (i === 0 ? 'left' : 'right') as 'left' | 'right',
        widthPercent: Math.max(6, Math.round(((c.size || 100) / total) * 100)),
      }));

      const rowsForPrint = data.map((r) => ({ ...r }));
      const footerForPrint = footer ? { ...footer } : undefined;

      const payload = {
        title: reportTitle,
        columns: columnsForPrint,
        rows: rowsForPrint,
        footerRow: footerForPrint,
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
