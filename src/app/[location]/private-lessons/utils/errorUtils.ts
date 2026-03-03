/**
 * Checks if a value is a non-empty string (not just whitespace).
 * Used as a shared type guard across all extractors.
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Attempts to extract a message from an Axios-style error response.
 * Handles both string and string[] message formats from the response body.
 * Returns null if no valid message is found.
 */
function extractAxiosMessage(error: unknown): string | null {
  // Safely traverse nested response structure using optional chaining
  const msg = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;

  // If message is an array, find the first non-empty string entry
  // If message is a plain string, validate and return it
  // Otherwise return null to signal no message was found
  return Array.isArray(msg)
    ? msg.find(isNonEmptyString) ?? null
    : isNonEmptyString(msg) ? msg : null;
}

/**
 * Extracts a human-readable error message from a caught error, in priority order:
 * 1. Plain string  — thrown directly or from Redux `rejectWithValue`
 * 2. Axios error   — `error.response.data.message` (string or string[])
 * 3. Error instance — `error.message`
 * 4. Fallback string — returned when all extractors yield null
 *
 * Each extractor returns a string on success or null to pass to the next.
 * `reduce` walks the list and short-circuits via `??` on first non-null result.
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  const extractors: Array<() => string | null> = [
    // Priority 1: error is a plain thrown string
    () => isNonEmptyString(error) ? (error as string) : null,

    // Priority 2: error came from Axios with a response body message
    () => extractAxiosMessage(error),

    // Priority 3: error is a standard Error instance
    // Optional chaining on the cast avoids an explicit instanceof check
    () => isNonEmptyString((error as Error)?.message)
      ? (error as Error).message
      : null,
  ];

  // Walk extractors in order, keeping the first non-null result.
  // If all return null, fall back to the provided fallback string.
  return extractors.reduce<string | null>(
    (result, extractor) => result ?? extractor(),
    null
  ) ?? fallback;
}

/**
 * Resolves a displayable string from an API response message field.
 * Returns the fallback when the message is absent, not a string, or blank.
 */
export function resolveMessage(message: unknown, fallback: string): string {
  // Delegate to shared guard — keeps the logic consistent with extractErrorMessage
  return isNonEmptyString(message) ? message : fallback;
}