"use client";

import { formatLocationName } from "@/utils";
import * as React from "react";

export default function PrintPage() {
  // Read exclusively from session storage for this flow
  type PrintColumn = { key: string; header: string; align?: 'left' | 'right' | 'center'; headerAlign?: 'left' | 'right' | 'center'; widthPercent?: number };
  type PrintRow = Record<string, unknown>;
  type PrintPayload = { 
    title: string; 
    columns: PrintColumn[]; 
    rows: PrintRow[]; 
    footerRow?: PrintRow;
    location?: string;
    dateRange?: {
      from: string;
      to: string;
    };
  };
  const [print, setPrint] = React.useState<PrintPayload | null>(null);

  const formatDateRange = (dateRange?: { from: string; to: string }) => {
    if (!dateRange) return '';
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    
    return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
  };

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('smw:print');
      const parsed = raw ? (JSON.parse(raw) as PrintPayload) : null;
      setPrint(parsed);
    } catch {}
  }, []);

  React.useEffect(() => {
    try { document.title = print?.title || "Print"; } catch {}
    const onAfterPrint = () => {
      try { sessionStorage.removeItem('smw:print'); } catch {}
    };
    window.addEventListener('afterprint', onAfterPrint);
    const t = setTimeout(() => window.print(), 250);
    return () => {
      clearTimeout(t);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, [print?.title]);

  if (!print || !print.columns || !print.rows) {
    try { console.warn('[PrintPage] Missing print data.'); } catch {}
    return (
      <div style={{ padding: 16, fontFamily: "ui-sans-serif, system-ui" }}>
        <h1 style={{ fontSize: 18, margin: 0 }}>Nothing to print</h1>
        <p style={{ color: "#64748b", marginTop: 6 }}>Please go back and click the Print button again.</p>
      </div>
    );
  }

  const widths = print.columns.map((c: PrintColumn) => c.widthPercent || Math.floor(100 / print.columns.length));

  return (
    <div style={{ padding: "16px" }}>
      <style>{`
        @page { margin: 14mm; }
        body { margin: 0; color: #0f172a; font-size: 12.75px; line-height: 1.4; }
        h1 { font-size: 20px; margin: 0 0 8px; font-weight: 800; letter-spacing: -0.01em; text-align: left; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; background: #fff; }
        thead th { background: #f8fafc; color: #111827; font-weight: 700; font-size: 12.5px; padding: 8px 10px; border-bottom: 2px solid #e5e7eb; text-align: center; vertical-align: bottom; word-break: break-word; }
        tbody td { font-size: 12px; padding: 6px 10px; border-top: 1px solid #e5e7eb; vertical-align: top; word-break: break-word; }
        tbody tr:nth-child(even) { background: #fafafa; }
        tbody tr.__print-footer { background: #f1f5f9; }
        tbody tr.__print-footer td { font-weight: 700; border-top: 2px solid #e5e7eb; }
      `}</style>

      <h1>{print.title}</h1>
      
      {(print.location || print.dateRange) && (
        <div style={{ marginBottom: '16px', fontSize: '12px', color: '#64748b' }}>
          {print.location && <span style={{ marginRight: '16px' }}><span style={{ fontWeight: 'bold' }}>Location:</span> {formatLocationName(print.location)}</span>}
          {print.dateRange && <span><span style={{ fontWeight: 'bold' }}>Date Range:</span> {formatDateRange(print.dateRange)}</span>}
        </div>
      )}

      <table>
        <colgroup>
          {widths.map((w: number, i: number) => (
            <col key={i} style={{ width: `${w}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {print.columns.map((c: PrintColumn) => (
              <th key={c.key} style={{ textAlign: c.headerAlign || 'center' }}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {print.rows.map((r: PrintRow, idx: number) => (
            <tr key={idx}>
              {print.columns.map((c: PrintColumn) => (
                <td key={c.key} style={{ textAlign: c.align || (c.key === print.columns[0].key ? "left" : "right") }}>
                  {String((r as Record<string, unknown>)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {print.footerRow && (
            <tr className="__print-footer">
              {print.columns.map((c: PrintColumn, i: number) => (
                <td key={c.key} style={{ textAlign: c.align || (i === 0 ? "left" : "right") }}>
                  {i === 0 ? "TOTALS" : String((print.footerRow as Record<string, unknown>)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


