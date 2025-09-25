// Utility to detect the current page feature from pathname
export function getCurrentPageFeature(pathname: string): string {
  // Remove location prefix and get the page path
  const pathParts = pathname.split('/').filter(part => part);
  
  // Skip the location part (first part) and get the feature
  if (pathParts.length > 1) {
    const feature = pathParts[1]; // Second part after location
    
    // Map page paths to feature names
    const featureMap: { [key: string]: string } = {
      'dashboard': 'dashboard',
      'schedule': 'schedule',
      'enrolments': 'enrolments',
      'students': 'students',
      'customers': 'customers',
      'teachers': 'teachers',
      'private-lessons': 'privateLessons',
      'group-courses': 'groupCourses',
      'unscheduled-lessons': 'unscheduledLessons',
      'recurring-payments': 'recurringPayments',
      'payment-preferences': 'paymentPreferences',
      'invoices': 'invoices',
      'payments': 'payments',
      'reports': 'reports',
      'release-notes': 'releaseNotes',
      'items': 'items',
      'admin': 'admin',
      'setup': 'setup',
      'timeline': 'timeline',
    };
    
    return featureMap[feature] || 'dashboard'; // Default to dashboard if not found
  }
  
  return 'dashboard'; // Default to dashboard for root path
}

// Get the legacy URL for a specific feature with location
export function getLegacyUrl(feature: string, location: string): string {
  const legacyUrl = process.env.NEXT_PUBLIC_LEGACY_URL || 'http://localhost:8080';
  
  // Map features to their legacy URLs
  const legacyUrlMap: { [key: string]: string } = {
    'dashboard': '/dashboard',
    'schedule': '/schedule',
    'enrolments': '/enrolments',
    'students': '/students',
    'customers': '/customers',
    'teachers': '/teachers',
    'privateLessons': '/private-lessons',
    'groupCourses': '/group-courses',
    'unscheduledLessons': '/unscheduled-lessons',
    'recurringPayments': '/recurring-payments',
    'paymentPreferences': '/payment-preferences',
    'invoices': '/invoices',
    'payments': '/payments',
    'reports': '/reports',
    'releaseNotes': '/release-notes',
    'items': '/items',
    'admin': '/admin',
    'setup': '/setup',
    'timeline': '/timeline',
  };
  
  const legacyPath = legacyUrlMap[feature] || '/dashboard';
  return `${legacyUrl}/${location}${legacyPath}`;
}
