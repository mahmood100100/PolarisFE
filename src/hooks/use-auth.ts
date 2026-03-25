"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { getCurrentUserApiCall } from "@/lib/auth";
import { refreshTokenSuccess, refreshTokenFailure, setIsInitialized, loginSuccess } from "@/redux/slices/auth-slice";
import { RootState } from "@/redux/store";
import { useSession } from "next-auth/react";

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { accessToken, isInitialized, user, provider, loading } = useSelector((state: RootState) => state.auth);
  const refreshAttempted = useRef(false);

  useEffect(() => {
    let currentToken = accessToken;

    // Sync NextAuth session to Redux
    if (status === "authenticated" && session && !accessToken) {
      const s = session as any;
      if (s.accessToken) {
        currentToken = s.accessToken;
        dispatch(loginSuccess({
          accessToken: s.accessToken,
          user: s.user,
          expiresAt: s.expiresAt,
          provider: s.provider
        }));
      }
    }

    const handleRefreshToken = async () => {
      // prevent multiple attempts
      if (refreshAttempted.current) return;
      refreshAttempted.current = true;

      try {
        console.log("Attempting to refresh token...");
        const response = await api.post("/api/Auth/refresh-token");
        
        const newToken = response.data.result?.accessToken ?? response.data.accessToken ?? response.data.AccessToken;
        const expiresAt = response.data.result?.expiresAt ?? response.data.expiresAt ?? response.data.ExpiresAt;
        
        if (newToken) {
          console.log("Token refreshed successfully. Fetching user profile...");
          
          dispatch(refreshTokenSuccess({ 
            accessToken: newToken, 
            expiresAt: expiresAt || new Date(Date.now() + 3600000).toISOString() 
          }));

          const userResult = await getCurrentUserApiCall();
          if (userResult.success) {
            console.log("User profile loaded successfully.");
            dispatch(refreshTokenSuccess({ 
              accessToken: newToken, 
              expiresAt: expiresAt || new Date(Date.now() + 3600000).toISOString(),
              user: userResult.user,
              provider: "credentials"
            }));
          } else {
            console.warn("Token refreshed but failed to load user profile:", userResult.error);
          }
        } else {
          console.log("No token in refresh response");
          dispatch(refreshTokenFailure());
        }
      } catch (error: any) {
        if (error.response?.status === 400 || error.response?.status === 401) {
          console.log("No active session found (Guest).");
        } else {
          console.error("Auth initialization failed:", error.message || error);
        }
        dispatch(refreshTokenFailure());
        
        // If the backend fails or rejects our session, we shouldn't keep a stale NextAuth session active,
        // otherwise the user gets stuck since they appear authenticated but lack a backend token.
        if (status === "authenticated") {
          import("next-auth/react").then(({ signOut }) => signOut());
        }
      } finally {
        dispatch(setIsInitialized(true));
      }
    };

    // we attempt refresh only if there is no access token and not yet initialized
    if (!currentToken && !isInitialized) {
      handleRefreshToken();
    } else if (currentToken) {
      // if there is an access token, we finish initialization directly
      dispatch(setIsInitialized(true));
    }
  }, [accessToken, isInitialized, dispatch, session, status]);

  return { accessToken, isInitialized, user, provider, loading };
};