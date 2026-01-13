import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import locationsReducer from './locationsSlice';
import locationFlagsReducer from './locationFlagsSlice';
import permissionsReducer from './permissionsSlice';
import staffMemberReducer from '../app/[location]/staffmembers/[id]/staffmembers.slice';
import dashboardReducer from '../app/[location]/dashboard/dashboard.slice';
import teacherReducer from '../app/[location]/teachers/[id]/teachers.slice';
import teacherTabsReducer from '../app/[location]/teachers/[id]/teacherTabs.slice';
import teachersListingReducer from '../app/[location]/teachers/teachersListing.slice';
import blogsListingReducer from '../app/[location]/blogs/blogsListing.slice';
import releaseNotesListingReducer from '../app/[location]/release-notes/releaseNotesListing.slice';
import studentReducer from '../app/[location]/students/[id]/students-details.slice';
import studentTabsReducer from '../app/[location]/students/[id]/studentTabs.slice';
import studentsListingReducer from '../app/[location]/students/studentsListing.slice';
import enrolmentsListingReducer from '../app/[location]/enrolments/enrolmentsListing.slice';
import enrolmentReducer from '../app/[location]/enrolments/[id]/enrolment-details.slice';
import scheduleFiltersReducer from '../app/[location]/enrolments/scheduleFilters.slice';
import unscheduledLessonsListingReducer from '../app/[location]/unscheduled-lessons/unscheduledLessonsListing.slice';
import privateLessonsListingReducer from '../app/[location]/private-lessons/privateLessonsListing.slice';
import privateLessonReducer from '../app/[location]/private-lessons/[id]/private-lesson-details.slice';
import groupCoursesListingReducer from '../app/[location]/group-courses/groupCoursesListing.slice';
import groupCourseReducer from '../app/[location]/group-courses/[id]/groupCourseDetails.slice';
import groupCourseTabsReducer from '../app/[location]/group-courses/[id]/groupCourseTabs.slice';
import itemsListingReducer from '../app/[location]/items/itemsListing.slice';
import invoicesListingReducer from '../app/[location]/invoices/invoicesListing.slice';
import invoiceReducer from '../app/[location]/invoices/[id]/invoices-details.slice';
import administratorsListingReducer from '../app/[location]/administrators/administratorsListing.slice';
import staffMembersListingReducer from '../app/[location]/staff-members/staffMembersListing.slice';
import ownersListingReducer from '../app/[location]/owners/ownersListing.slice';
import citiesListingReducer from '../app/[location]/cities/citiesListing.slice';
import locationsListingReducer from '../app/[location]/locations/locationsListing.slice';
import programsListingReducer from '../app/[location]/programs/programsListing.slice';
import taxCodesListingReducer from '../app/[location]/taxes/taxCodesListing.slice';
import provincesListingReducer from '../app/[location]/provinces/provincesListing.slice';
import countriesListingReducer from '../app/[location]/countries/countriesListing.slice';
import administratorReducer from '../app/[location]/administrators/[id]/administrators-details.slice';
import administratorTabsReducer from '../app/[location]/administrators/[id]/administratorTabs.slice';
import staffMemberDetailsReducer from '../app/[location]/staff-members/[id]/staff-members-details.slice';
import staffMemberTabsReducer from '../app/[location]/staff-members/[id]/staffMembersTabs.slice';
import ownerDetailsReducer from '../app/[location]/owners/[id]/owners-details.slice';
import ownerTabsReducer from '../app/[location]/owners/[id]/ownersTabs.slice';
import referralSourceListingReducer from '../app/[location]/referral-source/referralSourceListing.slice';
import holidaysListingReducer from '../app/[location]/holidays/holidaysListing.slice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    locations: locationsReducer,
    locationFlags: locationFlagsReducer,
    permissions: permissionsReducer,
    staffMember: staffMemberReducer,
    dashboard: dashboardReducer,
    teacher: teacherReducer,
    teacherTabs: teacherTabsReducer,
    teachersListing: teachersListingReducer,
    blogsListing: blogsListingReducer,
    releaseNotesListing: releaseNotesListingReducer,
    student: studentReducer,
    studentTabs: studentTabsReducer,
    studentsListing: studentsListingReducer,
    enrolmentsListing: enrolmentsListingReducer,
    enrolment: enrolmentReducer,
    scheduleFilters: scheduleFiltersReducer,
    unscheduledLessonsListing: unscheduledLessonsListingReducer,
    privateLessonsListing: privateLessonsListingReducer,
    privateLesson: privateLessonReducer,
    groupCoursesListing: groupCoursesListingReducer,
    groupCourse: groupCourseReducer,
    groupCourseTabs: groupCourseTabsReducer,
    itemsListing: itemsListingReducer,
    invoicesListing: invoicesListingReducer,
    invoice: invoiceReducer,
    administratorsListing: administratorsListingReducer,
    staffMembersListing: staffMembersListingReducer,
    ownersListing: ownersListingReducer,
    citiesListing: citiesListingReducer,
    locationsListing: locationsListingReducer,
    programsListing: programsListingReducer,
    taxCodesListing: taxCodesListingReducer,
    provincesListing: provincesListingReducer,
    countriesListing: countriesListingReducer,
    administrator: administratorReducer,
    administratorTabs: administratorTabsReducer,
    staffMemberDetails: staffMemberDetailsReducer,
    staffMemberTabs: staffMemberTabsReducer,
    ownerDetails: ownerDetailsReducer,
    ownerTabs: ownerTabsReducer,
    referralSourceListing: referralSourceListingReducer,
    holidaysListing: holidaysListingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
