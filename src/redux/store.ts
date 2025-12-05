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
import studentReducer from '../app/[location]/students/[id]/students-details.slice';
import studentTabsReducer from '../app/[location]/students/[id]/studentTabs.slice';
import studentsListingReducer from '../app/[location]/students/studentsListing.slice';

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
    student: studentReducer,
    studentTabs: studentTabsReducer,
    studentsListing: studentsListingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
