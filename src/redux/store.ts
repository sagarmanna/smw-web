import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import locationsReducer from './locationsSlice';
import locationFlagsReducer from './locationFlagsSlice';
import permissionsReducer from './permissionsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    locations: locationsReducer,
    locationFlags: locationFlagsReducer,
    permissions: permissionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
