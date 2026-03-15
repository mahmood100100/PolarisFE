"use client";

import { useAuth } from "@/hooks/use-auth";

export const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  useAuth(); // This will handle all sync and token refresh logic once at the root level.
  return <>{children}</>;
};
