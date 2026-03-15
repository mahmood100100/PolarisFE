"use client";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import SplashScreen from "@/components/splash-screen";
import { RootState } from "@/redux/store";
import { useSession } from "next-auth/react";


const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { accessToken, isInitialized } = useSelector((state: RootState) => state.auth);
  const { status } = useSession();

  useEffect(() => {
    // Wait for everything to load before deciding to redirect
    if (!isInitialized || status === "loading") return;

    // If we are definitely not authenticated, go to login
    if (!accessToken && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [isInitialized, accessToken, status, router]);


  // Show splash during initialization OR if we are not fully authenticated yet
  // This prevents showing any protected content before the redirect or sync happens
  if (!isInitialized || status === "loading" || !accessToken) {
    return <SplashScreen />;
  }


  return (
    <div>
      {children}
    </div>
  );
};

export default MainLayout;
