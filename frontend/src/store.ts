import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/login/authSlice";
import filesReducer from "./layout/store";
import { base } from "./services/api";
import selectedFileReducer from "./components/ShowFile/store";

const store = configureStore({
  reducer: {
    auth: authReducer,
    files: filesReducer,
    selectedFile: selectedFileReducer,
    [base.reducerPath]: base.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(base.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
