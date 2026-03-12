import { getTodayDateRange } from './dateUtils';

// Utility to detect the current page feature from pathname
export const getCurrentPageFeature = (pathname: string): string => {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // This should be the last part of the URL, e.g., 'dashboard', 'schedule', 'account-receivable'
  const pageSlug = pathSegments.pop();
  const secondToLast = pathSegments[pathSegments.length - 1];
  
  // Special handling for 'items' - distinguish between report items and main items page
  if (pageSlug === 'items') {
    // If second-to-last segment is 'report', it's the report items page
    if (secondToLast === 'report') {
      return 'reportItems';
    }
    // Otherwise it's the main items page
    return 'items';
  }
  
  // Special handling for 'item-category' and 'item-categories' - distinguish between report item-category and admin item-categories
  if (pageSlug === 'item-category') {
    // If second-to-last segment is 'report', it's the report item-category page
    if (secondToLast === 'report') {
      return 'itemCategory'; // Report item category
    }
  }
  
  if (pageSlug === 'item-categories') {
    // Admin item-categories page
    return 'adminItemCategory';
  }
  
  const slugToFeatureMap: { [key: string]: string } = {
    'dashboard': 'dashboard',
    'schedule': 'schedule',
    'account-receivable': 'accountReceivable',
    'financial-summary-report': 'financialSummaryReport',
    'student-birthday': 'birthdays',
    'payment': 'paymentsReport',
    'rental': 'rental',
    'discount': 'discount',
    'sales-and-payment': 'salesAndPayment',
    'all-locations': 'allLocations',
    'tax-collected': 'taxCollected',
    'royalty-free': 'royaltyFree',
    'royalty': 'royalty',
    'customers': 'customers',
    'payments': 'payments',
    'invoices': 'invoices',
    'teachers': 'teachers',
    'students': 'students',
    'release-notes': 'releaseNotes',
    'enrolments': 'enrolments',
    'group-courses': 'groupCourses',
    'unscheduled-lessons': 'unscheduledLessons',
    'private-lessons': 'privateLessons',
    'timeline': 'timeline',
    'administrators': 'administrators',
    'programs': 'programs',
    'cities': 'cities',
    'provinces': 'provinces',
    'countries': 'countries',
    'taxes': 'taxes',
    'calendar-event-color': 'colorCode',
    'reminder-notes': 'reminderNotes',
    'blogs': 'blogs',
    'locations': 'locations',
    'holidays': 'holidays',
    'email-template': 'emailTemplate',
    'test-email': 'testEmail',
    'terms-of-service': 'termsOfService',
    'referral-source': 'referralSources',
    'privileges': 'privileges',
    'staff-members': 'staffMembers',
    'owners': 'owners',
    'classrooms': 'classrooms',
    'import': 'import',
    'location-view': 'locationSettings',
  };
  
  return slugToFeatureMap[pageSlug || ''] || 'dashboard'; // Default to dashboard
};

// Get the legacy URL for a specific feature with location
export const getLegacyUrl = (feature: string, location: string): string => {
  const legacyBaseUrl = process.env.NEXT_PUBLIC_LEGACY_URL || 'http://localhost:8080';
  
  const featureToUrlMap: { [key: string]: string } = {
    dashboard: `/dashboard`,
    schedule: `/schedule`,
    accountReceivable: `/report/account-receivable`,
    financialSummaryReport: `/report/financial-summary-report`,
    birthdays: `/report/student-birthday`,
    paymentsReport: `/report/payment`,
    reportItems: `/report/items`,
    rental: `/report/rental`,
    discount: `/report/discount`,
    salesAndPayment: `/report/sales-and-payment`,
    allLocations: `/report/all-locations`,
    taxCollected: `/report/tax-collected`,
    royaltyFree: `/report/royalty-free`,
    royalty: `/report/royalty`,
    customers: `/user/index?UserSearch%5Brole_name%5D=customer`,
    payments: `/payment/index?PaymentSearch%5BisDefault%5D=1`,
    invoices: `/invoice/index?InvoiceSearch%5Btype%5D=2`,
    teachers: `/user/index?UserSearch%5Brole_name%5D=teacher`,
    students: `/student/index?StudentSearch%5BshowAllStudents%5D=0`,
    releaseNotes: `/release-notes/index`,
    enrolments: `/enrolment/index?EnrolmentSearch%5BshowAllEnrolments%5D=0`,
    groupCourses: `/course/index?CourseSearch%5Btype%5D=2`,
    unscheduledLessons: `/unscheduled-lesson/index?UnscheduledLessonSearch%5BshowAll%5D=0`,
    privateLessons: '', // Will be handled dynamically below
    timeline: `/timeline-event/index`,
    items: `/item/index?ItemSearch%5BshowAllItems%5D=0`,
    administrators: `/user/index?UserSearch%5Brole_name%5D=administrator`,
    programs: `/program/index`,
    cities: `/city/index`,
    provinces: `/province/index`,
    countries: `/country/index`,
    taxes: `/tax-code/index`,
    colorCode: `/calendar-event-color/edit`,
    itemCategory: `/report/item-category`, // Report item category
    adminItemCategory: `/item-category/index`, // Admin item category
    reminderNotes: `/reminder-note/index`,
    blogs: `/blog/index`,
    locations: `/location/index`,
    holidays: `/holiday/index`,
    emailTemplate: `/email-template/index`,
    testEmail: `/test-email/index`,
    termsOfService: `/terms-of-service/index`,
    referralSources: `/referral-source/index`,
    privileges: `/permission`,
    staffMembers: `/user/index?UserSearch%5Brole_name%5D=staffmember`,
    owners: `/user/index?UserSearch%5Brole_name%5D=owner`,
    classrooms: `/classroom/index`,
    import: `/user/import`,
    locationSettings: `/location-view`,
  };
    
  // Handle privateLessons with dynamic date range
  let legacyPath = featureToUrlMap[feature] || '/dashboard';
  if (feature === 'privateLessons') {
    legacyPath = `/lesson/index?LessonSearch%5BdateRange%5D=${getTodayDateRange()}`;
  }
  
  return `${legacyBaseUrl}/${location}${legacyPath}`;
};
