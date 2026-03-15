"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SplashScreen from "@/components/splash-screen";
import { MainLayout } from "@/components/layout/main-layout";
import { MainPage } from "@/components/main-page";
import UserMenu from "@/components/auth/layouts/user-menu";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";



const Home: React.FC = () => {
  const router = useRouter();
  const { accessToken, isInitialized } = useSelector((state: RootState) => state.auth);
  const { status } = useSession();

  useEffect(() => {
    // 1. Wait for loading states to finish
    if (!isInitialized || status === "loading") return;
    
    // 2. If NextAuth says we're authenticated, wait for initialization to sync
    if (status === "authenticated" && !accessToken) return;

    // 3. If after initialization we still have no token, go to login
    if (!accessToken && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [accessToken, isInitialized, status, router]);



  if (!isInitialized || status === "loading") {

    return <SplashScreen />;
  }


  if (!accessToken) {
    return null;
  }

  return (
    <MainLayout rightSlot={<UserMenu />}>
      <MainPage />
    </MainLayout>
  );
};

export default Home;
