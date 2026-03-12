import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const llmApi = createApi({
    reducerPath: "llmApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:8000",

        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.accessToken;
            if (token && token !== "undefined") {
                headers.set("Authorization", `Bearer ${token}`)
            }
            return headers;
        },
    }),

    endpoints: (builder) => ({
        reviewCode: builder.mutation({
            query: (body) => ({
                url: "/llm/review",
                method: "POST",
                body,
            }),
        }),

        reviewGithub: builder.mutation({
            query: (body) => ({
                url: "/llm/review/github",
                method: "POST",
                body,
            })
        }),

        testProvider: builder.mutation({
            query: (body) => ({
                url: "/llm/test",
                method: "POST",
                body,
            }),
        }),

        testGithub: builder.mutation({
            query: (body) => ({
                url: "/github/test",
                method: "POST",
                body,
            }),
        }),

        // GET /ollama/models?url=http://localhost:11434
        getOllamaModels: builder.query({
            query: (url = "http://localhost:11434") => ({
                url: `/ollama/models?url=${encodeURIComponent(url)}`,
                method: "GET",
            }),
        }),

        // GET /github/files?token=&repo=&branch=&path=
        listGithubFiles: builder.query({
            query: ({ token, repo, branch = "main", path = "" }) => ({
                url: `/github/files?token${token}&repo=${encodeURIComponent(repo)}&branch=${branch}&path=${path}`,
                method: "GET",
            }),
        }),
    })
});

export const { useReviewCodeMutation,
    useReviewGithubMutation,
    useTestProviderMutation,
    useTestGithubMutation,
    useGetOllamaModelsQuery,
    useListGithubFilesQuery, } = llmApi;