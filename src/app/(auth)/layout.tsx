"use client";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import SplashScreen from "@/components/splash-screen";
import { RootState } from "@/redux/store";
import { useSession } from "next-auth/react";


const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { accessToken, isInitialized } = useSelector((state: RootState) => state.auth);
  const { status } = useSession();

  useEffect(() => {
    // If the user already has an access token and initialization is finished,
    // they don't belong here under the auth layout. Redirect to home.
    if (isInitialized && accessToken && status !== "loading") {
      router.replace("/");
    }
  }, [isInitialized, accessToken, status, router]);


  // Show splash during initialization OR if we are authenticated (to prevent flicker before redirect)
  if (!isInitialized || status === "loading" || accessToken || status === "authenticated") {
    return <SplashScreen />;
  }


  // Only allow unauthenticated users to see children (login, register, etc.)
  return (
    <div className="h-screen flex justify-center">
      <div className="overflow-y-auto max-h-screen w-full">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;