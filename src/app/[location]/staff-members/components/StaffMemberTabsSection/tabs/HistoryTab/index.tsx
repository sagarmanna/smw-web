"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { TabContent } from "@/components/TabContent";
import { historyColumns } from "../../../../staffMemberTabConfigs";
import { fetchHistoryData } from "../../../../[id]/staffMembersTabs.slice";

interface HistoryTabProps {
  location: string;
  staffMemberId: number;
}

export function HistoryTab({ location, staffMemberId }: HistoryTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.staffMemberTabs.historyData);
  const loading = useAppSelector((state) => state.staffMemberTabs.historyLoading);
  const error = useAppSelector((state) => state.staffMemberTabs.historyError);
  const historyStaffMemberId = useAppSelector((state) => state.staffMemberTabs.historyStaffMemberId);

  useEffect(() => {
    // Only fetch if we don't have data for this staff member yet
    if (historyStaffMemberId !== staffMemberId) {
      dispatch(fetchHistoryData({ location, staffMemberId }));
    }
  }, [location, staffMemberId, dispatch, historyStaffMemberId]);

  return (
    <TabContent
      title="History"
      data={data}
      columns={historyColumns}
      hasAddButton={false}
      hasTable={true}
      emptyState="No history found."
      loading={loading}
      error={error}
      enablePagination={false}
    />
  );
}

