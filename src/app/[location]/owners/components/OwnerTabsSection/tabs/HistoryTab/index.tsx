"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { TabContent } from "@/components/TabContent";
import { historyColumns } from "../../../../ownerTabConfigs";
import { fetchHistoryData } from "../../../../[id]/ownersTabs.slice";

interface HistoryTabProps {
  location: string;
  ownerId: number;
}

export function HistoryTab({ location, ownerId }: HistoryTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.ownerTabs.historyData);
  const loading = useAppSelector((state) => state.ownerTabs.historyLoading);
  const error = useAppSelector((state) => state.ownerTabs.historyError);
  const historyOwnerId = useAppSelector((state) => state.ownerTabs.historyOwnerId);

  useEffect(() => {
    // Only fetch if we don't have data for this owner yet
    if (historyOwnerId !== ownerId) {
      dispatch(fetchHistoryData({ location, ownerId }));
    }
  }, [location, ownerId, dispatch, historyOwnerId]);

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

