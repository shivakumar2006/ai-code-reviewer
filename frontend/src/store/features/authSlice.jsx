import { createSlice } from "@reduxjs/toolkit";
import { AuthApi } from "../api/authApi";

const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuth: (state) => {
            state.user = null
            state.accessToken = null
            state.refreshToken = null
            state.isAuthenticated = false
        },

        setTokens: (state, action) => {
            state.accessToken = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
        },

        extraReducers: (builder) => {
            builder.addMatcher(
                AuthApi.endpoints.register.matchFulfilled,
                (state, action) => {
                    state.accessToken = action.payload.access_token
                    state.refreshToken = action.payload.refresh_token
                    state.user = action.payload.user
                    state.isAuthenticated = true
                }
            )

            builder.addMatcher(
                AuthApi.endpoints.login.matchFulfilled,
                (state, action) => {
                    state.accessToken = action.payload.access_token
                    state.refreshToken = action.payload.refresh_token
                    state.user = action.payload.user
                    state.isAuthenticated = true
                }
            )

            builder.addMatcher(
                AuthApi.endpoints.refresh.matchFulfilled,
                (state, action) => {
                    state.accessToken = action.payload.access_token
                    state.refreshToken = action.payload.refresh_token
                    state.user = action.payload.user
                    state.isAuthenticated = true
                }
            )

            builder.addMatcher(
                AuthApi.endpoints.refresh.matchFulfilled,
                (state) => {
                    state.user = null
                    state.accessToken = null
                    state.refreshToken = null
                    state.isAuthenticated = false
                }
            )

            builder.addMatcher(
                AuthApi.endpoints.getMe.matchFulfilled,
                (state, action) => {
                    state.user = action.payload
                    state.isAuthenticated = true
                }
            )
        }
    }
})

export const { clearAuth, setTokens } = authSlice.actions
export default authSlice.reducer