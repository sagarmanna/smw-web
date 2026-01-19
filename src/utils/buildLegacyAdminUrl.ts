type BuildLegacyAdminUrlParams = {
  /** Location slug, e.g. "training-location" */
  location: string;
  /**
   * Legacy path + query that comes AFTER `/{location}`.
   * Example: `/unscheduled-lesson/index?UnscheduledLessonSearch%5BshowAll%5D=0`
   */
  pathAndQuery: string;
  /**
   * Optional override for base legacy URL (usually `process.env.NEXT_PUBLIC_LEGACY_URL`).
   * Can be either `https://host/admin` or `https://host` (we'll add `/admin` if missing).
   */
  baseUrl?: string;
};

function ensureLeadingSlash(value: string): string {
  if (!value) return "/";
  return value.startsWith("/") ? value : `/${value}`;
}

export function buildLegacyAdminUrl({
  location,
  pathAndQuery,
  baseUrl = process.env.NEXT_PUBLIC_LEGACY_URL || "",
}: BuildLegacyAdminUrlParams): string {
  const normalizedPath = ensureLeadingSlash(pathAndQuery);

  const trimmedBase = baseUrl.replace(/\/$/, "");
  if (!trimmedBase) {
    return `/admin/${location}${normalizedPath}`;
  }

  const hasAdminPrefix = trimmedBase.endsWith("/admin");
  return hasAdminPrefix
    ? `${trimmedBase}/${location}${normalizedPath}`
    : `${trimmedBase}/admin/${location}${normalizedPath}`;
}


