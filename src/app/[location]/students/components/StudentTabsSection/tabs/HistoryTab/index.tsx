"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { historyColumns, HistoryData } from "../../../../[id]/studentTabConfigs";
import { fetchHistoryData } from "../../../../[id]/studentTabs.slice";

interface HistoryTabProps {
  location: string;
  studentId: string;
}

export function HistoryTab({ location, studentId }: HistoryTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.studentTabs.historyData);
  const isLoading = useAppSelector((state) => state.studentTabs.historyLoading);
  const error = useAppSelector((state) => state.studentTabs.historyError);
  const historyStudentId = useAppSelector((state) => state.studentTabs.historyStudentId);

  useEffect(() => {
    // Only fetch if we don't have data for this student yet
    if (historyStudentId !== studentId) {
      dispatch(fetchHistoryData({ location, studentId }));
    }
  }, [location, studentId, dispatch, historyStudentId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">History</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {error ? (
          <div className="text-center py-8 text-red-500">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <CustomTable
            data={data as HistoryData[]}
            columns={historyColumns}
            size="compact"
            variant="striped"
            enableSorting={true}
            enableExport={false}
            enablePrint={false}
            enableSearch={false}
            enableFilter={false}
            className="border-0 w-full"
            isLoading={isLoading}
            customEmptyState={
              !isLoading && data.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                  <div className="text-4xl">📋</div>
                  <span className="text-sm font-medium">No history found</span>
                </div>
              ) : undefined
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

