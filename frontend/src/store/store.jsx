import { configureStore } from "@reduxjs/toolkit";
import { AuthApi } from "./api/authApi";
import authRedcuer from "./features/authSlice";
import { ReviewApi } from "./api/reviewApi";
import { llmApi } from "./api/llmApi";

export const store = configureStore({
    reducer: {
        auth: authRedcuer,
        [AuthApi.reducerPath]: AuthApi.reducer,
        [ReviewApi.reducerPath]: ReviewApi.reducer,
        [llmApi.reducerPath]: llmApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(AuthApi.middleware, ReviewApi.middleware, llmApi.middleware)
})