/**
 * Legacy Route Mapper
 * 
 * Scalable configuration-based approach for mapping Next.js routes to legacy URLs.
 * Supports both static and dynamic routes with parameter extraction.
 * 
 * Usage:
 * 1. Add route patterns to legacyRouteMap array
 * 2. Use regex for dynamic routes, strings for static routes
 * 3. Use functions for complex URL generation with params
 * 
 * Example:
 * - Static: { pattern: '/dashboard', legacyUrl: '/dashboard' }
 * - Dynamic: { pattern: /^\/[^/]+\/customers\/[^/]+$/, legacyUrl: (params) => `...&id=${params.id}` }
 */

import { getTodayDateRange } from './dateUtils';

export interface LegacyRouteConfig {
  pattern: string | RegExp; // Route pattern (e.g., '/customers' or regex for /customers/[id])
  legacyUrl: string | ((params: Record<string, string>) => string); // Legacy URL or function that receives params
}

/**
 * Route mapping configuration - Add new routes here
 * Order matters: more specific patterns (regex) should come before general patterns (strings)
 */
const legacyRouteMap: LegacyRouteConfig[] = [
  // Dynamic routes (regex patterns) - check these first
  {
    pattern: /^\/[^/]+\/customers\/[^/]+$/, // Matches /[location]/customers/[id]
    legacyUrl: (params) => 
      `/user/view?UserSearch%5Brole_name%5D=customer&id=${params.id || ''}`
  },
  {
    pattern: /^\/[^/]+\/students\/[^/]+$/, // Matches /[location]/students/[id]
    legacyUrl: (params) => 
      `/student/view?StudentSearch%5BshowAllStudents%5D=0&id=${params.id || ''}`
  },
  {
    pattern: /^\/[^/]+\/teachers\/[^/]+$/, // Matches /[location]/teachers/[id]
    legacyUrl: (params) => 
      `/user/view?UserSearch%5Brole_name%5D=teacher&id=${params.id || ''}`
  },
  {
    pattern: /^\/[^/]+\/enrolments\/[^/]+$/, // Matches /[location]/enrolments/[id]
    legacyUrl: (params) => 
      `/enrolment/view?id=${params.id || ''}`
  },
  {
    pattern: /^\/[^/]+\/group-courses\/[^/]+$/, // Matches /[location]/group-courses/[id]
    legacyUrl: (params) => 
      `/course/view?id=${params.id || ''}`
  },
  {
    pattern: /^\/[^/]+\/administrators\/[^/]+$/, // Matches /[location]/administrators/[id]
    legacyUrl: (params) => 
      `/user/view?UserSearch%5Brole_name%5D=administrator&id=${params.id || ''}`
  },
  {
    pattern: /^\/[^/]+\/staff-members\/[^/]+$/, // Matches /[location]/staff-members/[id]
    legacyUrl: (params) => 
      `/user/view?UserSearch%5Brole_name%5D=staffmember&id=${params.id || ''}`
  },
  {
    pattern: /^\/[^/]+\/owners\/[^/]+$/, // Matches /[location]/owners/[id]
    legacyUrl: (params) => 
      `/user/view?UserSearch%5Brole_name%5D=owner&id=${params.id || ''}`
  },
  {
    pattern: /^\/[^/]+\/classrooms\/[^/]+$/, // Matches /[location]/classrooms/[id]
    legacyUrl: (params) => 
      `/classroom/view?id=${params.id || ''}`
  },
  {
    pattern: /^\/[^/]+\/private-lessons\/[^/]+$/, // Matches /[location]/private-lessons/[id]
    legacyUrl: (params) =>
      `/lesson/view?id=${params.id || ''}`
  },
  {
    pattern: /^\/[^/]+\/group-lessons\/[^/]+$/, // Matches /[location]/group-lessons/[id]
    legacyUrl: (params) =>
      `/lesson/view?id=${params.id || ''}`
  },
  {
    pattern: /^\/[^/]+\/locations\/[^/]+$/, // Matches /[location]/locations/[id]
    legacyUrl: '/location-view'
  },
  // Static routes (string patterns)
  {
    pattern: /^\/[^/]+\/customers$/, // Matches /[location]/customers (list page)
    legacyUrl: '/user/index?UserSearch%5Brole_name%5D=customer'
  },
  {
    pattern: /^\/[^/]+\/enrolments$/, // Matches /[location]/enrolments (list page)
    legacyUrl: '/enrolment/index?EnrolmentSearch%5BshowAllEnrolments%5D=0'
  },
  {
    pattern: /^\/[^/]+\/students$/, // Matches /[location]/students (list page)
    legacyUrl: '/student/index?StudentSearch%5BshowAllStudents%5D=0'
  },
  {
    pattern: /^\/[^/]+\/teachers$/, // Matches /[location]/teachers (list page)
    legacyUrl: '/user/index?UserSearch%5Brole_name%5D=teacher'
  },
  {
    pattern: /^\/[^/]+\/group-courses$/, // Matches /[location]/group-courses (list page)
    legacyUrl: '/course/index?CourseSearch%5Btype%5D=2'
  },
  {
    pattern: /^\/[^/]+\/unscheduled-lessons$/, // Matches /[location]/unscheduled-lessons (list page)
    legacyUrl: '/unscheduled-lesson/index?UnscheduledLessonSearch%5BshowAll%5D=0'
  },
  {
    pattern: /^\/[^/]+\/private-lessons$/, // Matches /[location]/private-lessons (list page)
    legacyUrl: () => `/lesson/index?LessonSearch%5BdateRange%5D=${getTodayDateRange()}`
  },
  {
    pattern: '/dashboard',
    legacyUrl: '/dashboard'
  },
  {
    pattern: '/schedule',
    legacyUrl: '/schedule'
  },
  {
    pattern: '/payments',
    legacyUrl: '/payment/index?PaymentSearch%5BisDefault%5D=1'
  },
  {
    pattern: '/menu-flags',
    legacyUrl: '/admin/menu-flags'
  },
  {
    pattern: '/release-notes',
    legacyUrl: '/release-notes/index'
  },
  {
    pattern: /^\/[^/]+\/timeline$/, // Matches /[location]/timeline
    legacyUrl: '/timeline-event/index'
  },
  {
    pattern: /^\/[^/]+\/items$/, // Matches /[location]/items (main items page, not report)
    legacyUrl: '/item/index?ItemSearch%5BshowAllItems%5D=0'
  },
  {
    pattern: /^\/[^/]+\/administrators$/, // Matches /[location]/administrators
    legacyUrl: '/user/index?UserSearch%5Brole_name%5D=administrator'
  },
  {
    pattern: /^\/[^/]+\/programs$/, // Matches /[location]/programs
    legacyUrl: '/program/index'
  },
  {
    pattern: /^\/[^/]+\/cities$/, // Matches /[location]/cities
    legacyUrl: '/city/index'
  },
  {
    pattern: /^\/[^/]+\/provinces$/, // Matches /[location]/provinces
    legacyUrl: '/province/index'
  },
  {
    pattern: /^\/[^/]+\/countries$/, // Matches /[location]/countries
    legacyUrl: '/country/index'
  },
  {
    pattern: /^\/[^/]+\/taxes$/, // Matches /[location]/taxes
    legacyUrl: '/tax-code/index'
  },
  {
    pattern: /^\/[^/]+\/calendar-event-color$/, // Matches /[location]/calendar-event-color
    legacyUrl: '/calendar-event-color/edit'
  },
  {
    pattern: /^\/[^/]+\/item-categories$/, // Matches /[location]/item-categories
    legacyUrl: '/item-category/index'
  },
  {
    pattern: /^\/[^/]+\/reminder-notes$/, // Matches /[location]/reminder-notes
    legacyUrl: '/reminder-note/index'
  },
  {
    pattern: /^\/[^/]+\/blogs$/, // Matches /[location]/blogs
    legacyUrl: '/blog/index'
  },
  {
    pattern: /^\/[^/]+\/locations$/, // Matches /[location]/locations
    legacyUrl: '/location/index'
  },
  {
    pattern: /^\/[^/]+\/holidays$/, // Matches /[location]/holidays
    legacyUrl: '/holiday/index'
  },
  {
    pattern: /^\/[^/]+\/email-template$/, // Matches /[location]/email-template
    legacyUrl: '/email-template/index'
  },
  {
    pattern: /^\/[^/]+\/test-email$/, // Matches /[location]/test-email
    legacyUrl: '/test-email/index'
  },
  {
    pattern: /^\/[^/]+\/terms-of-service$/, // Matches /[location]/terms-of-service
    legacyUrl: '/terms-of-service/index'
  },
  {
    pattern: /^\/[^/]+\/referral-source$/, // Matches /[location]/referral-source
    legacyUrl: '/referral-source/index'
  },
  {
    pattern: /^\/[^/]+\/privileges$/, // Matches /[location]/privileges
    legacyUrl: '/permission'
  },
  {
    pattern: /^\/[^/]+\/staff-members$/, // Matches /[location]/staff-members
    legacyUrl: '/user/index?UserSearch%5Brole_name%5D=staffmember'
  },
  {
    pattern: /^\/[^/]+\/owners$/, // Matches /[location]/owners
    legacyUrl: '/user/index?UserSearch%5Brole_name%5D=owner'
  },
  {
    pattern: /^\/[^/]+\/classrooms$/, // Matches /[location]/classrooms
    legacyUrl: '/classroom/index'
  },
  {
    pattern: /^\/[^/]+\/location-view$/, // Matches /[location]/location-view
    legacyUrl: '/location-view'
  },
  {
    pattern: /^\/[^/]+\/user\/import$/, // Matches /[location]/user/import
    legacyUrl: '/user/import'
  },
];

/**
 * Extract dynamic parameters from pathname segments
 * @param pathname - Current pathname (e.g., '/training-location/customers/7292')
 * @returns Object with common extracted parameters (location, id, etc.)
 */
function extractParamsFromPathname(pathname: string): Record<string, string> {
  const params: Record<string, string> = {};
  const segments = pathname.split('/').filter(Boolean);
  
  // Extract location (typically first segment after leading slash)
  if (segments.length > 0) {
    params.location = segments[0];
  }
  
  // Extract ID from detail pages (last segment that's numeric or UUID-like)
  if (segments.length >= 3) {
    const lastSegment = segments[segments.length - 1];
    // Check if last segment looks like an ID (numeric or alphanumeric with dashes)
    if (lastSegment && /^[\d\w-]+$/.test(lastSegment)) {
      params.id = lastSegment;
    }
  }
  
  return params;
}

/**
 * Get legacy URL for a given pathname
 * 
 * @param pathname - Current Next.js pathname (e.g., '/training-location/customers/7292')
 * @param routeParams - Route parameters from Next.js useParams() hook
 * @returns Legacy URL path or null if no mapping found
 * 
 * @example
 * getLegacyUrl('/training-location/customers/7292', { id: '7292' })
 * // Returns: '/admin/training-location/user/view?UserSearch%5Brole_name%5D=customer&id=7292'
 */
export function getLegacyUrl(
  pathname: string, 
  routeParams: Record<string, string | string[]> = {}
): string | null {
  // Normalize route params (convert arrays to strings, handle Next.js params format)
  const normalizedParams: Record<string, string> = {};
  Object.entries(routeParams).forEach(([key, value]) => {
    normalizedParams[key] = Array.isArray(value) ? value[0] : String(value);
  });
  
  // Try each route pattern in order
  for (const route of legacyRouteMap) {
    let matches = false;
    
    // Test pattern
    if (route.pattern instanceof RegExp) {
      matches = route.pattern.test(pathname);
    } else if (typeof route.pattern === 'string') {
      // For string patterns, check if pathname includes or ends with the pattern
      matches = pathname.includes(route.pattern) || pathname.endsWith(route.pattern);
    }
    
    if (matches) {
      // Build legacy URL
      if (typeof route.legacyUrl === 'function') {
        // Extract additional params from pathname if needed
        const extractedParams = extractParamsFromPathname(pathname);
        const allParams = { ...extractedParams, ...normalizedParams };
        return route.legacyUrl(allParams);
      } else {
        return route.legacyUrl;
      }
    }
  }
  
  // Fallback: return null (caller should handle fallback)
  return null;
}

