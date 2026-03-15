import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  expiresAt: string | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  resetPasswordToken: string | null;
  provider: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  expiresAt: null,
  loading: false,
  error: null,
  isInitialized: false,
  resetPasswordToken: null,
  provider: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ accessToken: string; user: User; expiresAt: string; provider?: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.expiresAt = action.payload.expiresAt;
      state.provider = action.payload.provider ?? "credentials";
      state.loading = false;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.accessToken = null;
      state.expiresAt = null;
      state.user = null;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.expiresAt = null;
      state.loading = false;
      state.provider = null;
      state.error = null;
    },
    setIsInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    refreshTokenSuccess: (
      state,
      action: PayloadAction<{ accessToken: string; expiresAt: string; user?: User | null; provider?: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.expiresAt = action.payload.expiresAt;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      if (action.payload.provider) {
        state.provider = action.payload.provider;
      }
      state.isInitialized = true;
    },

    refreshTokenFailure: (state) => {
      state.accessToken = null;
      state.user = null;
      state.expiresAt = null;
      state.isInitialized = true;
    },
    forgetPasswordRequestSuccess: (state, action: PayloadAction<{ resetPasswordToken?: string }>) => {
      state.resetPasswordToken = action.payload.resetPasswordToken ?? null;
      state.loading = false;
      state.error = null;
    },
    forgetPasswordRequestFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.resetPasswordToken = null;
    },
    resetPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
      state.resetPasswordToken = null;
    },
    resetPasswordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setIsInitialized,
  refreshTokenSuccess,
  refreshTokenFailure,
  forgetPasswordRequestSuccess,
  forgetPasswordRequestFailure,
  resetPasswordSuccess,
  resetPasswordFailure,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
