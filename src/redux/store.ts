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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
