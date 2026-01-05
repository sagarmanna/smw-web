import type { AsyncThunk } from "@reduxjs/toolkit";
import type { ColumnDef } from "@tanstack/react-table";
import type { AppDispatch } from "@/redux/store";
import type { HistoryTabConfig, HistoryData, HistoryTabSelectors } from "./types";

/**
 * Factory function to create type-safe history tab configuration
 * 
 * This factory properly handles the type mismatch between different AsyncThunk
 * parameter shapes (administratorId, ownerId, staffMemberId) and the generic
 * component interface. It returns a properly typed dispatch action that can
 * be used without type assertions in the UI component.
 * 
 * @template TData - History data type
 * @template TParams - AsyncThunk parameter type (e.g., { location: string; administratorId: number })
 * @template TReturn - AsyncThunk return type
 * 
 * @example
 * ```ts
 * const config = createHistoryTabConfig({
 *   selectors: { ... },
 *   columns: historyColumns,
 *   fetchAction: fetchHistoryData,
 *   entityIdParamName: "administratorId",
 * });
 * ```
 */
export function createHistoryTabConfig<
  TData extends HistoryData,
  TParams extends { location: string; [key: string]: unknown },
  TReturn
>({
  selectors,
  columns,
  fetchAction,
  entityIdParamName,
}: {
  selectors: HistoryTabSelectors<TData>;
  columns: ColumnDef<TData>[];
  fetchAction: AsyncThunk<TReturn, TParams, { rejectValue: unknown }>;
  entityIdParamName: keyof TParams & string;
}): HistoryTabConfig<TData> {
  // Create a properly typed dispatch function that matches AppDispatch signature
  // This eliminates the need for type assertions in the UI component
  const adaptedFetchAction = (params: { location: string; [key: string]: unknown }): ReturnType<AppDispatch> => {
    // Construct the properly typed params object
    // Type assertion is necessary here to bridge the gap between the generic
    // interface and module-specific AsyncThunk parameter shapes
    const typedParams = {
      ...params,
      [entityIdParamName]: params[entityIdParamName] ?? params.entityId,
    } as unknown as TParams;
    
    // Return the thunk action which AppDispatch can handle
    // Type assertion is safe here because we're adapting the parameter shape
    // and the factory ensures type compatibility at creation time
    // Using unknown as intermediate type to satisfy TypeScript's strict checking
    const action = (fetchAction as unknown as (arg: TParams) => ReturnType<AppDispatch>)(typedParams);
    return action;
  };

  return {
    selectors,
    columns,
    fetchAction: adaptedFetchAction,
    entityIdParamName,
  };
}

