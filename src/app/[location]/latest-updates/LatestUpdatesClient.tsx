"use client";

import * as React from "react";
import { ServerSidePagination } from "@/components/CustomTable";
import { sanitizeBasicHtml } from "@/utils/sanitizeHtml";
import { getBlogs, type BlogRow } from "../blogs/blogs.api";

interface LatestUpdatesClientProps {
  location: string;
}

export function LatestUpdatesClient({ location }: LatestUpdatesClientProps) {
  const [rows, setRows] = React.useState<BlogRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const limit = 10;

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getBlogs(location, { page, limit });
      if (!res?.success) {
        setRows([]);
        setError(res?.message || "Failed to load updates");
        return;
      }
      setRows(res.data.body || []);
      setTotal(res.data.pagination?.total ?? 0);
      setTotalPages(res.data.pagination?.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load updates");
    } finally {
      setIsLoading(false);
    }
  }, [location, page]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to first page when location changes
  React.useEffect(() => {
    setPage(1);
  }, [location]);

  return (
    <div className="w-full px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground">
          SMW Latest Features and Updates
        </h1>

        {isLoading ? (
          <div className="mt-6 text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-6 text-sm text-muted-foreground">No updates found.</div>
        ) : (
          <>
            <div className="mt-6 space-y-6">
              {rows.map((row, idx) => {
                const safeHtml = sanitizeBasicHtml(row.content || "");
                return (
                  <div
                    key={`${row.title}-${row.date}-${idx}`}
                    className="rounded-md border bg-card shadow-sm"
                  >
                    <div className="px-6 py-4 border-b">
                      <div className="text-lg font-semibold text-foreground">{row.title}</div>
                      <div className="text-sm text-muted-foreground">{row.date}</div>
                    </div>
                    <div className="px-6 py-4">
                      <div
                        className="prose prose-sm max-w-none text-foreground [&_p]:my-0 [&_p+_p]:mt-3"
                        dangerouslySetInnerHTML={{ __html: safeHtml }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-lg border border-border/50 overflow-hidden">
              <ServerSidePagination
                pagination={{ page, limit, total, totalPages }}
                onPageChange={(newPage) => setPage(newPage)}
                enablePagination={true}
                hideRecordCount={true}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}


