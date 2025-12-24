/**
 * Utility functions for serializing/deserializing date ranges for Redux state
 * 
 * Redux requires all state to be serializable (plain objects, arrays, primitives).
 * Date objects are not serializable, so we convert them to ISO strings when storing
 * in Redux and convert back to Date objects when needed by components.
 * 
 * Shared utility used across multiple modules (invoices, private-lessons, etc.)
 */

export interface DateRange {
  from: Date | string;
  to: Date | string;
}

/**
 * Checks if a value is a date range object
 */
export function isDateRange(val: unknown): val is DateRange {
  if (val === null || typeof val !== 'object') return false;
  return (
    'from' in (val as { from?: unknown }) ||
    'to' in (val as { to?: unknown })
  );
}

/**
 * Serializes a date range object to ISO strings for Redux storage
 * Converts Date objects to ISO strings, leaves strings as-is
 * 
 * @param dateRange - Date range with Date objects or ISO strings
 * @returns Date range with ISO strings (serializable for Redux)
 */
export function serializeDateRange(dateRange: DateRange): { from: string; to: string } {
  return {
    from: dateRange.from instanceof Date ? dateRange.from.toISOString() : dateRange.from,
    to: dateRange.to instanceof Date ? dateRange.to.toISOString() : dateRange.to,
  };
}

/**
 * Deserializes a date range from Redux (ISO strings) to Date objects for components
 * Converts ISO strings to Date objects
 * 
 * @param val - Date range with ISO strings or Date objects
 * @returns Date range with Date objects, or undefined if invalid
 */
export function deserializeDateRange(val: unknown): { from: Date; to: Date } | undefined {
  if (!isDateRange(val) || !val.from || !val.to) return undefined;
  
  const from = typeof val.from === 'string' ? new Date(val.from) : val.from;
  const to = typeof val.to === 'string' ? new Date(val.to) : val.to;
  
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return undefined;
  
  return { from, to };
}

/**
 * Serializes column filters, converting any date range Date objects to ISO strings
 * This ensures all values in Redux state are serializable
 * 
 * @param filters - Column filters that may contain Date objects
 * @returns Serialized filters with ISO strings instead of Date objects
 */
export function serializeColumnFilters(filters: Record<string, unknown>): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(filters)) {
    if (key === 'date' && isDateRange(value)) {
      serialized[key] = serializeDateRange(value);
    } else {
      serialized[key] = value;
    }
  }
  
  return serialized;
}

/**
 * Deserializes column filters, converting date range ISO strings to Date objects
 * This converts Redux state (ISO strings) to component-friendly format (Date objects)
 * 
 * @param filters - Column filters from Redux (may contain ISO strings)
 * @returns Deserialized filters with Date objects for date ranges
 */
export function deserializeColumnFilters(filters: Record<string, unknown>): Record<string, unknown> {
  const deserialized = { ...filters };
  
  if (deserialized.date && isDateRange(deserialized.date)) {
    const dateRange = deserializeDateRange(deserialized.date);
    if (dateRange) {
      deserialized.date = dateRange;
    }
  }
  
  return deserialized;
}

