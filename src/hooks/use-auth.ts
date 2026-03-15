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
    // Sync NextAuth session to Redux
    if (status === "authenticated" && session && !accessToken) {
      const s = session as any;
      if (s.accessToken) {
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
          
          // Temporarily set the token so the next API call includes it in the header
          dispatch(refreshTokenSuccess({ 
            accessToken: newToken, 
            expiresAt: expiresAt || new Date(Date.now() + 3600000).toISOString() 
          }));

          // Now fetch the user profile
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
        // If it's a 400 or 401, it just means no active session exists, which is normal for guests.
        if (error.response?.status === 400 || error.response?.status === 401) {
          console.log("No active session found (Guest).");
        } else {
          console.error("Auth initialization failed:", error.message || error);
        }
        dispatch(refreshTokenFailure());
      } finally {
        dispatch(setIsInitialized(true));
      }
    };


    // we attempt refresh only if there is no access token and not yet initialized
    if (!accessToken && !isInitialized) {
      handleRefreshToken();
    } else if (accessToken) {
      // if there is an access token, we finish initialization directly
      dispatch(setIsInitialized(true));
    }
  }, [accessToken, isInitialized, dispatch, session, status]);


  return { accessToken, isInitialized, user, provider, loading };
};