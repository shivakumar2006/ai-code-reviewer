import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ReviewApi = createApi({
    reducerPath: "reviewApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:8000",

        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.accessToken;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`)
            }
            return headers;
        }
    }),

    tagTypes: ["Review"],

    endpoints: (builder) => ({
        createReview: builder.mutation({
            query: (body) => ({
                url: "/reviews",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Review"],
        }),

        getAllReviews: builder.query({
            query: ({ page = 1, limit = 10 }) => ({
                url: `/reviews?page=${page}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: ["Review"],
        }),

        getReview: builder.query({
            query: (id) => ({
                url: `/reviews/${id}`,
                method: "GET",
            }),
            providesTags: (result, err, id) => [{ type: "Review", id }]
        }),

        deleteReview: builder.mutation({
            query: (id) => ({
                url: `/reviews/${id}`,
                method: "DELETE",
            }),
            providesTags: ["Reviews"],
        }),
    }),
});

export const { useCreateReviewMutation, useGetAllReviewsQuery, useGetReviewQuery, useDeleteReviewMutation } = ReviewApi;