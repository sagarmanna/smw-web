import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import locationsReducer from './locationsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    locations: locationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
