import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const AuthApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:8000",

        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.accessToken
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers
        }
    }),

    endpoints: (builder) => ({
        register: builder.mutation({
            query: (body) => ({
                url: "/auth/register",
                method: "POST",
                body,
            })
        }),

        login: builder.mutation({
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                body,
            })
        }),

        refresh: builder.mutation({
            query: (body) => ({
                url: "/auth/refresh",
                method: "POST",
                body,
            })
        }),

        logout: builder.mutation({
            query: (body) => ({
                url: "/auth/logout",
                method: "POST",
                body,
            })
        }),

        getMe: builder.query({
            query: () => ({
                url: "/auth/me",
                method: "GET",
            })
        })
    })
})

export const { useRegisterMutation, useLoginMutation, useRefreshMutation, useLogoutMutation, useGetMeQuery } = AuthApi;