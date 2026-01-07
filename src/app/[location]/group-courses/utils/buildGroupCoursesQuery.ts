import { GroupCoursesQuery } from "../groupCourses.api";
import { SortField } from "./sortGroupCourses";

/**
 * Builds GroupCoursesQuery from component state
 * Centralized query building logic to avoid duplication
 * 
 * @param page - Current page number
 * @param pageSize - Items per page
 * @param columnFilters - Column filter values (course, teacher, program)
 * @param activeFilter - Active filter state ('active' | 'inactive') - required, no 'all' option
 * @param sortBy - Sort field
 * @param sortDir - Sort direction
 * @returns GroupCoursesQuery object ready for API call
 */
export function buildGroupCoursesQuery(
  page: number,
  pageSize: number,
  columnFilters: Record<string, unknown>,
  activeFilter: 'active' | 'inactive',
  sortBy: SortField | undefined,
  sortDir: 'asc' | 'desc'
): GroupCoursesQuery {
  // Map active filter to API parameters (only 'active' or 'inactive'):
  // - active: showActive=true, showInActive=false => showAllCourses=false (active only)
  // - inactive: showActive=false, showInActive=true => showAllCourses=true (includes inactive)
  const showActive = activeFilter === 'inactive' ? false : true;
  const showInActive = activeFilter === 'active' ? false : true;

  return {
    page,
    limit: pageSize,
    course: columnFilters.course as string | undefined,
    teacher: columnFilters.teacher as string | undefined,
    program: columnFilters.program as string | undefined,
    showActive,
    showInActive,
    sort: sortBy,
    order: sortDir,
  };
}

