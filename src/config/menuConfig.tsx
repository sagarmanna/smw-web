import { isDev } from "@/utils/env";
import { getTodayDateRange } from "@/utils/dateUtils";
import { 
  Home, 
  Calendar, 
  BookOpen, 
  Users, 
  User, 
  GraduationCap, 
  Music, 
  DollarSign, 
  BarChart3, 
  StickyNote, 
  Newspaper, 
  Shield, 
  Table, 
  Building, 
  Upload, 
  Globe, 
  Bell, 
  Mail, 
  FileText, 
  Cog, 
  MapPin,
  Car
} from "lucide-react";

// Environment-based flags
export const ENV_FLAGS = {
  isDev: process.env.NODE_ENV === 'development',
  legacyBaseUrl: process.env.NEXT_PUBLIC_LEGACY_URL || 'http://localhost:8080',
};

export interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  url?: string;
  source?: 'legacy' | 'modern';
  items?: MenuItem[];
  hidden?: 'yes' | 'no';
  isNew?: boolean;
}

// Helper function to check if menu should be shown for location
export const isMenuEnabled = (locationFlags: { [key: string]: string }, menuId: string): boolean => {
  const featureFlag = locationFlags[menuId];
  return featureFlag !== 'disabled';
};

// Helper function to get menu source (legacy/modern)
export const getMenuSource = (locationFlags: { [key: string]: string }, menuId: string): 'legacy' | 'modern' => {
  const featureFlag = locationFlags[menuId];
  return featureFlag === 'modern' ? 'modern' : 'legacy';
};

// Helper function to build URL based on source
export const buildMenuUrl = (item: MenuItem, location: string): string => {
  if (!item.url) return '#';
  
  if (item.source === 'legacy') {
    // Legacy pages: return full URL for external navigation
    return `${ENV_FLAGS.legacyBaseUrl}/${location}${item.url}`;
  }
  
  // For modern pages, ALWAYS return relative paths for Next.js client-side navigation
  // This ensures Next.js Link component works correctly in production
  let url = item.url;
  
  // If URL is a full URL (starts with http:// or https://), extract the path
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      url = urlObj.pathname + urlObj.search;
    } catch {
      // If URL parsing fails, default to '/'
      url = '/';
    }
  }
  
  // Ensure URL starts with '/' for relative path
  if (!url.startsWith('/')) {
    url = '/' + url;
  }
  
  // Split URL and query params to ensure proper formatting
  const [path, query] = url.split('?');
  const basePath = `/${location}${path}`;
  
  // Reconstruct URL with query params if they exist
  return query ? `${basePath}?${query}` : basePath;
};

// Helper function to filter menus based on user role and permissions
export const filterMenusByRole = (menus: MenuItem[], userRole: string, userPermissions?: string[], dashboardPermissions?: { [key: string]: boolean }): MenuItem[] => {
  if (userRole === 'administrator') {
    // Admin has access to ALL menus
    return menus;
  }
  
  if (userRole === 'owner') {
    // Owner restrictions: hide Admin, Payment Preferences, some Reports, some Setup items
    const filteredMenus = menus.filter(item => {
      // Hide Admin menu completely for owner
      if (item.title === 'Admin') {
        return false;
      }
      
      // Hide Payment Preferences for owner
      if (item.title === 'Payment Preferences') {
        return false;
      }
      
      return true;
    }).map(item => {
      // Filter Reports submenu for owner - hide All Locations and Rentals
      if (item.title === 'Reports' && item.items) {
        const filteredReports = item.items.filter(subItem => {
          return subItem.title !== 'All Locations' && subItem.title !== 'Rentals';
        });
        return {
          ...item,
          items: filteredReports
        };
      }
      
      // Filter Setup submenu for owner - hide Owners
      if (item.title === 'Setup' && item.items) {
        const filteredSetup = item.items.filter(subItem => {
          return subItem.title !== 'Owners';
        });
        return {
          ...item,
          items: filteredSetup
        };
      }
      
      return item;
    });
    
    return filteredMenus;
  }
  
  if (userRole === 'staffmember') {
    // Staff member restrictions based on permissions
    const filteredMenus = menus.filter(item => {
      // Hide these menus completely for staff member
      if (item.title === 'Admin' || item.title === 'Setup' || item.title === 'Payment Preferences') {
        return false;
      }
      
      // Check dashboard permissions for staff members
      if (item.title === 'Dashboard' && dashboardPermissions) {
        // Check if user has any dashboard permissions (exclude manageEnrolments)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { manageEnrolments, ...chartPermissions } = dashboardPermissions;
        const hasAnyPermission = Object.values(chartPermissions).some(permission => permission === true);
        return hasAnyPermission;
      }
      
      return true;
    }).map(item => {
      // Filter Reports submenu based on permissions
      if (item.title === 'Reports' && item.items && userPermissions) {
        const permissionMap: { [key: string]: string } = {
          'Account Receivable': 'manageAccountReceivableReport',
          'Financial Summary Report': 'manageAccountReceivableReport',
          'Birthdays': 'manageBirthdays',
          'Payments': 'managePaymentsReport',
          'Royalty': 'manageRoyalty',
          'Tax Collected': 'manageTaxCollected',
          'Royalty Free Items': 'manageRoyaltyFreeItems',
          'Items': 'manageItemReport',
          'Items Sold by Category': 'manageItemCategoryReport',
          'Discount': 'manageDiscountReport',
          'Sales & Payments Report': 'manageSalesAndPayment',
          'All Locations': 'manageAllLocationsReport',
          'Rentals': 'manageRentalsReport',
        };
        
        // Check if user has manageReports permission
        const hasManageReportsPermission = userPermissions.includes('manageReports');
        if (!hasManageReportsPermission) {
          return null; // Hide entire Reports menu
        }
        
        const filteredReports = item.items.filter(subItem => {
          const permissionName = permissionMap[subItem.title];
          return permissionName && userPermissions.includes(permissionName);
        });
        
        // Only return Reports menu if there are sub-items to show
        if (filteredReports.length > 0) {
          return {
            ...item,
            items: filteredReports
          };
        }
        return null; // Hide Reports menu if no sub-items
      }
      
      // Filter Recurring Payments based on permissions
      if (item.title === 'Recurring Payments' && userPermissions) {
        const hasPermission = userPermissions.includes('manageRecurringPayment');
        return hasPermission ? item : null;
      }
      
      // Filter other menus based on permissions
      if (item.title === 'Enrolments' && userPermissions) {
        const hasPermission = userPermissions.includes('manageEnrolments');
        return hasPermission ? item : null;
      }
      
      if (item.title === 'Students' && userPermissions) {
        const hasPermission = userPermissions.includes('manageStudents');
        return hasPermission ? item : null;
      }
      
      if (item.title === 'Customers' && userPermissions) {
        const hasPermission = userPermissions.includes('manageCustomers');
        return hasPermission ? item : null;
      }
      
      if (item.title === 'Teachers' && userPermissions) {
        const hasPermission = userPermissions.includes('manageTeachers');
        return hasPermission ? item : null;
      }
      
      if (item.title === 'Private Lessons' && userPermissions) {
        const hasPermission = userPermissions.includes('managePrivateLessons');
        return hasPermission ? item : null;
      }
      
      if (item.title === 'Group Courses' && userPermissions) {
        const hasPermission = userPermissions.includes('manageGroupLessons');
        return hasPermission ? item : null;
      }
      
      // Unscheduled Lessons - no permission required for staff
      if (item.title === 'Unscheduled Lessons') {
        return item;
      }
      
      if (item.title === 'Invoices' && userPermissions) {
        const hasPermission = userPermissions.includes('manageInvoices');
        return hasPermission ? item : null;
      }
      
      if (item.title === 'Payments' && userPermissions) {
        const hasPermission = userPermissions.includes('managePayments');
        return hasPermission ? item : null;
      }
      
      if (item.title === 'Items' && userPermissions) {
        const hasPermission = userPermissions.includes('manageItems');
        return hasPermission ? item : null;
      }
      
      // Timeline - no permission required for staff
      if (item.title === 'Timeline') {
        return item;
      }
      
      if (item.title === 'Schedule' && userPermissions) {
        const hasPermission = userPermissions.includes('manageSchedule');
        return hasPermission ? item : null;
      }
      
      if (item.title === 'Release Notes' && userPermissions) {
        const hasPermission = userPermissions.includes('manageReleaseNotes');
        return hasPermission ? item : null;
      }
      
      return item;
    }).filter(item => item !== null);
    
    return filteredMenus;
  }
  
  // For any other role, return empty array
  return [];
};

// Main menu configuration
export const getSideMenus = (location: string, locationFlags: { [key: string]: string } = {}, userRole?: string, userPermissions?: string[], dashboardPermissions?: { [key: string]: boolean }): MenuItem[] => {
  // const isDev = ();
  
  const allMenus = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Home className="h-4 w-4" />,
      url: '/dashboard',
      source: getMenuSource(locationFlags, 'dashboard') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'dashboard') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: <Calendar className="h-4 w-4" />,
      url: getMenuSource(locationFlags, 'schedule') === 'legacy' ?'/schedule' : '/schedule?resetDate=true&resetFilters=true',
      source: getMenuSource(locationFlags, 'schedule') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'schedule') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'enrolments',
      title: 'Enrolments',
      icon: <BookOpen className="h-4 w-4" />,
      url: getMenuSource(locationFlags, 'enrolments') === 'legacy' ? '/enrolment/index?EnrolmentSearch[showAllEnrolments]=0' : '/enrolments',
      source: getMenuSource(locationFlags, 'enrolments') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'enrolments') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'students',
      title: 'Students',
      icon: <Users className="h-4 w-4" />,
      url: getMenuSource(locationFlags, 'students') === 'legacy' ? '/student/index?StudentSearch[showAllStudents]=0' : '/students?resetSearch=true',
      source: getMenuSource(locationFlags, 'students') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'students') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'customers',
      title: 'Customers',
      icon: <User className="h-4 w-4" />,
      url: getMenuSource(locationFlags, 'customers') === 'legacy' ? '/user/index?UserSearch[role_name]=customer' : '/customers',
      source: getMenuSource(locationFlags, 'customers') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'customers') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'teachers',
      title: 'Teachers',
      icon: <GraduationCap className="h-4 w-4" />,
      url: getMenuSource(locationFlags, 'teachers') === 'legacy' ? '/user/index?UserSearch[role_name]=teacher' : '/teachers',
      source: getMenuSource(locationFlags, 'teachers') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'teachers') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'privateLessons',
      title: 'Private Lessons',
      icon: <Music className="h-4 w-4" />,
      url: getMenuSource(locationFlags, 'privateLessons') === 'legacy' ? `/lesson/index?LessonSearch%5BdateRange%5D=${getTodayDateRange()}` : '/private-lessons',
      source: getMenuSource(locationFlags, 'privateLessons') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'privateLessons') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'groupCourses',
      title: 'Group Courses',
      icon: <Music className="h-4 w-4" />,
      url: getMenuSource(locationFlags, 'groupCourses') === 'legacy' ? '/course/index?CourseSearch%5Btype%5D=2' : '/group-courses',
      source: getMenuSource(locationFlags, 'groupCourses') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'groupCourses') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'unscheduledLessons',
      title: 'Unscheduled Lessons',
      icon: <Music className="h-4 w-4" />,
      url: getMenuSource(locationFlags, 'unscheduledLessons') === 'legacy' ? '/unscheduled-lesson/index?UnscheduledLessonSearch%5BshowAll%5D=0' : '/unscheduled-lessons',
      source: getMenuSource(locationFlags, 'unscheduledLessons') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'unscheduledLessons') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'recurringPayments',
      title: 'Recurring Payments',
      icon: <DollarSign className="h-4 w-4" />,
      url: '/customer-recurring-payment/index?CustomerRecurringPaymentSearch%5BshowAll%5D=0',
      source: getMenuSource(locationFlags, 'recurringPayments') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'recurringPayments') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'paymentPreferences',
      title: 'Payment Preferences',
      icon: <DollarSign className="h-4 w-4" />,
      url: '/customer-payment-preference/index',
      source: getMenuSource(locationFlags, 'paymentPreferences') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'paymentPreferences') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'invoices',
      title: 'Invoices',
      icon: <DollarSign className="h-4 w-4" />,
      url: '/invoice/index?InvoiceSearch%5Btype%5D=2',
      source: getMenuSource(locationFlags, 'invoices') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'invoices') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'payments',
      title: 'Payments',
      icon: <DollarSign className="h-4 w-4" />,
      url: getMenuSource(locationFlags, 'payments') === 'legacy' ? '/payment/index?PaymentSearch%5BisDefault%5D=1' : '/payments',
      source: getMenuSource(locationFlags, 'payments') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'payments') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: <BarChart3 className="h-4 w-4" />,
      items: [
        {
          id: 'accountReceivable',
          title: 'Account Receivable',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/account-receivable',
          source: getMenuSource(locationFlags, 'accountReceivable') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'accountReceivable') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'financialSummary',
          title: 'Financial Summary Report',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/financial-summary-report',
          source: getMenuSource(locationFlags, 'financialSummary') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'financialSummary') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'birthdays',
          title: 'Birthdays',
          icon: <Bell className="h-4 w-4" />,
          url: '/report/student-birthday',
          source: getMenuSource(locationFlags, 'birthdays') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'birthdays') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'paymentsReport',
          title: 'Payments',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/payment',
          source: getMenuSource(locationFlags, 'paymentsReport') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'paymentsReport') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'royalty',
          title: 'Royalty',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/royalty',
          source: getMenuSource(locationFlags, 'royalty') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'royalty') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'taxCollected',
          title: 'Tax Collected',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/tax-collected',
          source: getMenuSource(locationFlags, 'taxCollected') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'taxCollected') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'royaltyFree',
          title: 'Royalty Free Items',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/royalty-free',
          source: getMenuSource(locationFlags, 'royaltyFree') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'royaltyFree') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'reportItems',
          title: 'Items',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/items',
          source: getMenuSource(locationFlags, 'reportItems') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'reportItems') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'itemsByCategory',
          title: 'Items Sold by Category',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/item-category',
          source: getMenuSource(locationFlags, 'itemsByCategory') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'itemsByCategory') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'discount',
          title: 'Discount',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/discount',
          source: getMenuSource(locationFlags, 'discount') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'discount') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'salesAndPayment',
          title: 'Sales & Payments Report',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/sales-and-payment',
          source: getMenuSource(locationFlags, 'salesAndPayment') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'salesAndPayment') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'allLocations',
          title: 'All Locations',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/all-locations',
          source: getMenuSource(locationFlags, 'allLocations') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'allLocations') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'rentals',
          title: 'Rentals',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/rental',
          source: getMenuSource(locationFlags, 'rentals') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'rentals') ? ('no' as const) : ('yes' as const),
        },
      ].filter(menu => menu.hidden !== 'yes'),
      hidden: isMenuEnabled(locationFlags, 'reports') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'releaseNotes',
      title: 'Release Notes',
      icon: <StickyNote className="h-4 w-4" />,
      url: getMenuSource(locationFlags, 'releaseNotes') === 'legacy' ? '/release-notes/index' : '/release-notes',
      source: getMenuSource(locationFlags, 'releaseNotes') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'releaseNotes') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'items',
      title: 'Items',
      icon: <Newspaper className="h-4 w-4" />,
      url: getMenuSource(locationFlags, 'items') === 'legacy' ? '/item/index?ItemSearch%5BshowAllItems%5D=0' : '/items',
      source: getMenuSource(locationFlags, 'items') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'items') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'admin',
      title: 'Admin',
      icon: <User className="h-4 w-4" />,
      items: [
        {
          id: 'administrators',
          title: 'Administrators',
          icon: <Shield className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'administrators') === 'legacy' ? '/user/index?UserSearch%5Brole_name%5D=administrator' : '/administrators',
          source: getMenuSource(locationFlags, 'administrators') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'administrators') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'programs',
          title: 'Programs',
          icon: <Table className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'programs') === 'legacy' ? '/program/index' : '/programs',
          source: getMenuSource(locationFlags, 'programs') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'programs') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'cities',
          title: 'Cities',
          icon: <Building className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'cities') === 'legacy' ? '/city/index' : '/cities',
          source: getMenuSource(locationFlags, 'cities') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'cities') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'provinces',
          title: 'Provinces',
          icon: <Upload className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'provinces') === 'legacy' ? '/province/index' : '/provinces',
          source: getMenuSource(locationFlags, 'provinces') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'provinces') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'countries',
          title: 'Countries',
          icon: <Globe className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'countries') === 'legacy' ? '/country/index' : '/countries',
          source: getMenuSource(locationFlags, 'countries') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'countries') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'taxes',
          title: 'Taxes',
          icon: <DollarSign className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'taxes') === 'legacy' ? '/tax-code/index' : '/taxes',
          source: getMenuSource(locationFlags, 'taxes') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'taxes') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'colorCode',
          title: 'Color Code',
          icon: <Newspaper className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'colorCode') === 'legacy' ? '/calendar-event-color/edit' : '/calendar-event-color',
          source: getMenuSource(locationFlags, 'colorCode') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'colorCode') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'itemCategory',
          title: 'Item Category',
          icon: <Newspaper className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'itemCategory') === 'legacy' ? '/item-category/index' : '/item-categories',
          source: getMenuSource(locationFlags, 'itemCategory') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'itemCategory') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'reminderNotes',
          title: 'Reminder Notes',
          icon: <Bell className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'reminderNotes') === 'legacy' ? '/reminder-note/index' : '/reminder-notes',
          source: getMenuSource(locationFlags, 'reminderNotes') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'reminderNotes') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'blogs',
          title: 'Blogs',
          icon: <Newspaper className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'blogs') === 'legacy' ? '/blog/index' : '/blogs',
          source: getMenuSource(locationFlags, 'blogs') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'blogs') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'locations',
          title: 'Locations',
          icon: <MapPin className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'locations') === 'legacy' ? '/location/index' : '/locations',
          source: getMenuSource(locationFlags, 'locations') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'locations') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'holidays',
          title: 'Holidays',
          icon: <Car className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'holidays') === 'legacy' ? '/holiday/index' : '/holidays',
          source: getMenuSource(locationFlags, 'holidays') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'holidays') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'emailTemplate',
          title: 'Email Template',
          icon: <Mail className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'emailTemplate') === 'legacy' ? '/email-template/index' : '/email-template',
          source: getMenuSource(locationFlags, 'emailTemplate') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'emailTemplate') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'testEmail',
          title: 'Test Email',
          icon: <Mail className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'testEmail') === 'legacy' ? '/test-email/index' : '/test-email',
          source: getMenuSource(locationFlags, 'testEmail') as 'legacy' | 'modern',
          hidden: (isDev() && isMenuEnabled(locationFlags, 'testEmail')) ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'termsOfService',
          title: 'Terms of Service',
          icon: <FileText className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'termsOfService') === 'legacy' ? '/terms-of-service/index' : '/terms-of-service',
          source: getMenuSource(locationFlags, 'termsOfService') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'termsOfService') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'referralSources',
          title: 'Referral Sources',
          icon: <Table className="h-4 w-4" />,
          url: getMenuSource(locationFlags, 'referralSources') === 'legacy' ? '/referral-source/index' : '/referral-source',
          source: getMenuSource(locationFlags, 'referralSources') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'referralSources') ? ('no' as const) : ('yes' as const),
        },
      ].filter(menu => menu.hidden !== 'yes'),
      hidden: isMenuEnabled(locationFlags, 'admin') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'setup',
      title: 'Setup',
      icon: <Cog className="h-4 w-4" />,
      items: [
        {
          id: 'privileges',
          title: 'Privileges',
          icon: <Users className="h-4 w-4" />,
          url: '/permission',
          source: getMenuSource(locationFlags, 'privileges') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'privileges') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'staffMembers',
          title: 'Staff Members',
          icon: <Users className="h-4 w-4" />,
          url: '/user/index?UserSearch%5Brole_name%5D=staffmember',
          source: getMenuSource(locationFlags, 'staffMembers') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'staffMembers') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'owners',
          title: 'Owners',
          icon: <User className="h-4 w-4" />,
          url: '/user/index?UserSearch%5Brole_name%5D=owner',
          source: getMenuSource(locationFlags, 'owners') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'owners') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'classrooms',
          title: 'Classrooms',
          icon: <Home className="h-4 w-4" />,
          url: '/classroom/index',
          source: getMenuSource(locationFlags, 'classrooms') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'classrooms') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'import',
          title: 'Import',
          icon: <Upload className="h-4 w-4" />,
          url: '/user/import',
          source: getMenuSource(locationFlags, 'import') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'import') ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'locationSettings',
          title: 'Location Settings',
          icon: <MapPin className="h-4 w-4" />,
          url: '/location-view',
          source: getMenuSource(locationFlags, 'locationSettings') as 'legacy' | 'modern',
          hidden: isMenuEnabled(locationFlags, 'locationSettings') ? ('no' as const) : ('yes' as const),
        },
      ].filter(menu => menu.hidden !== 'yes'),
      hidden: isMenuEnabled(locationFlags, 'setup') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'timeline',
      title: 'Timeline',
      icon: <Bell className="h-4 w-4" />,
      url: getMenuSource(locationFlags, 'timeline') === 'legacy' ? '/timeline-event/index' : '/timeline',
      source: getMenuSource(locationFlags, 'timeline') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'timeline') ? ('no' as const) : ('yes' as const),
    },
  ].filter(menu => menu.hidden !== 'yes');
  
  // Apply role-based filtering if userRole is provided
  if (userRole) {
    return filterMenusByRole(allMenus, userRole, userPermissions, dashboardPermissions);
  }
  
  return allMenus;
};
