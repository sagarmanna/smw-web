"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchTestEmails } from "../testEmailListing.slice";

export function useTestEmailListing(location: string) {
  const dispatch = useAppDispatch();

  const rows = useAppSelector((state) => state.testEmailListing.rows);
  const isLoading = useAppSelector((state) => state.testEmailListing.isLoading);
  const error = useAppSelector((state) => state.testEmailListing.error);

  const fetchData = React.useCallback(async () => {
    await dispatch(fetchTestEmails({ location }));
  }, [dispatch, location]);

  return {
    rows,
    isLoading,
    error,
    fetchData,
  };
}

