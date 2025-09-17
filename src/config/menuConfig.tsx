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
    return `${ENV_FLAGS.legacyBaseUrl}${item.url}`;
  }
  
  // For modern pages, use Next.js routing
  // Note: basePath is already handled by Next.js config, so we don't need to add /admin/v2
  if (item.url.startsWith('/')) {
    return `/${location}${item.url}`;
  }
  
  return item.url;
};

// Main menu configuration
export const getSideMenus = (location: string, locationFlags: { [key: string]: string } = {}): MenuItem[] => {
  const isDev = ENV_FLAGS.isDev;
  
  return [
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
      url: '/schedule',
      source: getMenuSource(locationFlags, 'schedule') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'schedule') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'enrolments',
      title: 'Enrolments',
      icon: <BookOpen className="h-4 w-4" />,
      url: '/enrolment/index?EnrolmentSearch[showAllEnrolments]=0',
      source: getMenuSource(locationFlags, 'enrolments') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'enrolments') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'students',
      title: 'Students',
      icon: <Users className="h-4 w-4" />,
      url: '/student/index?StudentSearch[showAllStudents]=0',
      source: getMenuSource(locationFlags, 'students') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'students') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'customers',
      title: 'Customers',
      icon: <User className="h-4 w-4" />,
      url: '/user/index?UserSearch[role_name]=customer',
      source: getMenuSource(locationFlags, 'customers') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'customers') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'teachers',
      title: 'Teachers',
      icon: <GraduationCap className="h-4 w-4" />,
      url: '/user/index?UserSearch[role_name]=teacher',
      source: getMenuSource(locationFlags, 'teachers') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'teachers') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'privateLessons',
      title: 'Private Lessons',
      icon: <Music className="h-4 w-4" />,
      url: `/lesson/index?LessonSearch%5BdateRange%5D=${new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).replace(/,/g, "")}+-+${new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).replace(/,/g, "")}`,
      source: getMenuSource(locationFlags, 'privateLessons') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'privateLessons') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'groupCourses',
      title: 'Group Courses',
      icon: <Music className="h-4 w-4" />,
      url: '/course/index?CourseSearch%5Btype%5D=2',
      source: getMenuSource(locationFlags, 'groupCourses') as 'legacy' | 'modern',
      items: [],
      hidden: isMenuEnabled(locationFlags, 'groupCourses') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'unscheduledLessons',
      title: 'Unscheduled Lessons',
      icon: <Music className="h-4 w-4" />,
      url: '/unscheduled-lesson/index?UnscheduledLessonSearch%5BshowAll%5D=0',
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
      url: '/payment/index?PaymentSearch%5BisDefault%5D=1',
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
          source: 'legacy' as const,
        },
        {
          id: 'financialSummary',
          title: 'Financial Summary Report',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/financial-summary-report',
          source: 'legacy' as const,
        },
        {
          id: 'birthdays',
          title: 'Birthdays',
          icon: <Bell className="h-4 w-4" />,
          url: '/report/student-birthday',
          source: 'legacy' as const,
        },
        {
          id: 'paymentsReport',
          title: 'Payments',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/payment',
          source: 'legacy' as const,
        },
        {
          id: 'royalty',
          title: 'Royalty',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/royalty',
          source: 'legacy' as const,
        },
        {
          id: 'taxCollected',
          title: 'Tax Collected',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/tax-collected',
          source: 'legacy' as const,
        },
        {
          id: 'royaltyFree',
          title: 'Royalty Free Items',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/royalty-free',
          source: 'legacy' as const,
        },
        {
          id: 'items',
          title: 'Items',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/items',
          source: 'legacy' as const,
        },
        {
          id: 'itemsByCategory',
          title: 'Items Sold by Category',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/item-category',
          source: 'legacy' as const,
        },
        {
          id: 'discount',
          title: 'Discount',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/discount',
          source: 'legacy' as const,
        },
        {
          id: 'salesAndPayment',
          title: 'Sales & Payments Report',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/sales-and-payment',
          source: 'legacy' as const,
        },
        {
          id: 'allLocations',
          title: 'All Locations',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/all-locations',
          source: 'legacy' as const,
        },
        {
          id: 'rentals',
          title: 'Rentals',
          icon: <DollarSign className="h-4 w-4" />,
          url: '/report/rental',
          source: 'legacy' as const,
        },
      ],
      hidden: isMenuEnabled(locationFlags, 'reports') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'releaseNotes',
      title: 'Release Notes',
      icon: <StickyNote className="h-4 w-4" />,
      url: '/release-notes/index',
      source: 'legacy' as const,
      items: [],
      hidden: isMenuEnabled(locationFlags, 'releaseNotes') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'items',
      title: 'Items',
      icon: <Newspaper className="h-4 w-4" />,
      url: '/item/index?ItemSearch%5BshowAllItems%5D=0',
      source: 'legacy' as const,
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
          url: isDev ? '/admin/administrators' : '/user/index?UserSearch%5Brole_name%5D=administrator',
          source: isDev ? ('modern' as const) : ('legacy' as const),
        },
        {
          id: 'programs',
          title: 'Programs',
          icon: <Table className="h-4 w-4" />,
          url: isDev ? '/admin/programs' : '/program/index',
          source: isDev ? ('modern' as const) : ('legacy' as const),
        },
        {
          id: 'cities',
          title: 'Cities',
          icon: <Building className="h-4 w-4" />,
          url: isDev ? '/admin/cities' : '/city/index',
          source: isDev ? ('modern' as const) : ('legacy' as const),
        },
        {
          id: 'provinces',
          title: 'Provinces',
          icon: <Upload className="h-4 w-4" />,
          url: isDev ? '/admin/provinces' : '/province/index',
          source: isDev ? ('modern' as const) : ('legacy' as const),
        },
        {
          id: 'countries',
          title: 'Countries',
          icon: <Globe className="h-4 w-4" />,
          url: isDev ? '/admin/countries' : '/country/index',
          source: isDev ? ('modern' as const) : ('legacy' as const),
        },
        {
          id: 'taxes',
          title: 'Taxes',
          icon: <DollarSign className="h-4 w-4" />,
          url: isDev ? '/admin/taxes' : '/tax-code/index',
          source: isDev ? ('modern' as const) : ('legacy' as const),
        },
        {
          id: 'colorCode',
          title: 'Color Code',
          icon: <Newspaper className="h-4 w-4" />,
          url: isDev ? '/admin/color-code' : '/calendar-event-color/edit',
          source: isDev ? ('modern' as const) : ('legacy' as const),
        },
        {
          id: 'itemCategory',
          title: 'Item Category',
          icon: <Newspaper className="h-4 w-4" />,
          url: isDev ? '/admin/item-category' : '/item-category/index',
          source: isDev ? ('modern' as const) : ('legacy' as const),
        },
        {
          id: 'reminderNotes',
          title: 'Reminder Notes',
          icon: <Bell className="h-4 w-4" />,
          url: '/reminder-note/index',
          source: 'legacy' as const,
        },
        {
          id: 'blogs',
          title: 'Blogs',
          icon: <Newspaper className="h-4 w-4" />,
          url: '/blog/index',
          source: 'legacy' as const,
        },
        {
          id: 'locations',
          title: 'Locations',
          icon: <MapPin className="h-4 w-4" />,
          url: isDev ? '/admin/location' : '/location/index',
          source: isDev ? ('modern' as const) : ('legacy' as const),
        },
        {
          id: 'holidays',
          title: 'Holidays',
          icon: <Car className="h-4 w-4" />,
          url: isDev ? '/admin/holiday' : '/holiday/index',
          source: isDev ? ('modern' as const) : ('legacy' as const),
        },
        {
          id: 'emailTemplate',
          title: 'Email Template',
          icon: <Mail className="h-4 w-4" />,
          url: '/email-template/index',
          source: 'legacy' as const,
        },
        {
          id: 'testEmail',
          title: 'Test Email',
          icon: <Mail className="h-4 w-4" />,
          url: '/test-email/index',
          source: 'legacy' as const,
          hidden: isDev ? ('no' as const) : ('yes' as const),
        },
        {
          id: 'termsOfService',
          title: 'Terms of Service',
          icon: <FileText className="h-4 w-4" />,
          url: '/terms-of-service/index',
          source: 'legacy' as const,
        },
        {
          id: 'referralSources',
          title: 'Referral Sources',
          icon: <Table className="h-4 w-4" />,
          url: '/referral-source/index',
          source: 'legacy' as const,
        },
      ],
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
          source: 'legacy' as const,
        },
        {
          id: 'staffMembers',
          title: 'Staff Members',
          icon: <Users className="h-4 w-4" />,
          url: '/user/index?UserSearch%5Brole_name%5D=staffmember',
          source: 'legacy' as const,
        },
        {
          id: 'owners',
          title: 'Owners',
          icon: <User className="h-4 w-4" />,
          url: '/user/index?UserSearch%5Brole_name%5D=owner',
          source: 'legacy' as const,
        },
        {
          id: 'classrooms',
          title: 'Classrooms',
          icon: <Home className="h-4 w-4" />,
          url: '/classroom/index',
          source: 'legacy' as const,
        },
        {
          id: 'import',
          title: 'Import',
          icon: <Upload className="h-4 w-4" />,
          url: '/user/import',
          source: 'legacy' as const,
        },
        {
          id: 'locationSettings',
          title: 'Location Settings',
          icon: <MapPin className="h-4 w-4" />,
          url: '/location-view',
          source: 'legacy' as const,
        },
      ],
      hidden: isMenuEnabled(locationFlags, 'setup') ? ('no' as const) : ('yes' as const),
    },
    {
      id: 'timeline',
      title: 'Timeline',
      icon: <Bell className="h-4 w-4" />,
      url: '/timeline-event/index',
      source: 'legacy' as const,
      items: [],
      hidden: isMenuEnabled(locationFlags, 'timeline') ? ('no' as const) : ('yes' as const),
    },
  ].filter(menu => menu.hidden !== 'yes');
};
