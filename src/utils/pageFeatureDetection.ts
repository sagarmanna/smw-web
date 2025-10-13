// Utility to detect the current page feature from pathname
export const getCurrentPageFeature = (pathname: string): string => {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // This should be the last part of the URL, e.g., 'dashboard', 'schedule', 'account-receivable'
  const pageSlug = pathSegments.pop();
  
  const slugToFeatureMap: { [key: string]: string } = {
    'dashboard': 'dashboard',
    'schedule': 'schedule',
    'account-receivable': 'accountReceivable',
    'financial-summary-report': 'financialSummaryReport',
    'student-birthday': 'birthdays',
    'payment': 'paymentsReport',
    'items': 'reportItems',
    'rental': 'rental',
    'item-category': 'itemCategory',
    'discount': 'discount',
    'sales-and-payment': 'salesAndPayment',
    'all-locations': 'allLocations',
    'tax-collected': 'taxCollected',
    'royalty-free': 'royaltyFree',
    'royalty': 'royalty',
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
    itemCategory: `/report/item-category`,
    discount: `/report/discount`,
    salesAndPayment: `/report/sales-and-payment`,
    allLocations: `/report/all-locations`,
    taxCollected: `/report/tax-collected`,
    royaltyFree: `/report/royalty-free`,
    royalty: `/report/royalty`,
  };
  
  const legacyPath = featureToUrlMap[feature] || '/dashboard';
  return `${legacyBaseUrl}/${location}${legacyPath}`;
};
