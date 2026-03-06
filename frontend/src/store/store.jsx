import { configureStore } from "@reduxjs/toolkit";
import { AuthApi } from "./api/authApi";
import authRedcuer from "./features/authSlice";

export const store = configureStore({
    reducer: {
        auth: authRedcuer,
        [AuthApi.reducerPath]: AuthApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(AuthApi.middleware)
})