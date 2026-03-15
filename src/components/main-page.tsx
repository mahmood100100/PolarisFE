"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/slices/auth-slice";
import { useRouter } from "next/navigation";
import { logoutApiCall } from "@/lib/auth";
import { signOut } from "next-auth/react";
import { RootState } from "@/redux/store";

export function MainPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, provider, accessToken } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      // 1. Capture provider before anything changes
      const currentProvider = provider;
      console.log("--- Logout Started ---", { currentProvider });

      // 2. Call backend FIRST (while accessToken is still in Redux for the Authorization header)
      try {
        await logoutApiCall();
        console.log("Backend logout successful.");
      } catch (err) {
        console.error("Backend logout failed (continuing anyway):", err);
      }

      // 3. NOW clear Redux state (after backend call used the token)
      dispatch(logout());

      // 4. Redirect based on provider
      if (currentProvider && currentProvider !== "credentials") {
        // Social login: clear NextAuth cookies + full redirect
        await signOut({ callbackUrl: "/login" });
      } else {
        // Credentials: force full page reload to reset all in-memory state
        window.location.href = "/login";
      }

    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: always land on login
      dispatch(logout());
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen bg-[#0d0d0d] text-white">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            POLARIS WORKSPACE
          </h1>
          <p className="text-zinc-500 font-medium">
            Active Session Diagnostics
          </p>
        </div>

        {user ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">User Identity Profile</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-zinc-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-4 font-bold">Attribute</th>
                    <th className="px-6 py-4 font-bold">Stored Value</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-zinc-400 font-medium">Full Name</td>
                    <td className="px-6 py-4 text-white font-semibold">{user.fullName || "N/A"}</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-zinc-400 font-medium">User Name</td>
                    <td className="px-6 py-4 text-white font-semibold">@{user.userName || "N/A"}</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-zinc-400 font-medium">Email Address</td>
                    <td className="px-6 py-4 text-white font-semibold">{user.email}</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-zinc-400 font-medium">Auth Provider</td>
                    <td className="px-6 py-4 text-white font-semibold capitalize">{provider || "N/A"}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-zinc-400 font-medium">Access Token</td>
                    <td className="px-6 py-4">
                      <code className="text-[10px] text-zinc-500 bg-black/30 px-2 py-1 rounded border border-white/5 block max-w-xs truncate">
                        {accessToken ? `${accessToken.substring(0, 30)}...` : "None"}
                      </code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl border-dashed">
            <p className="text-zinc-500">No active session found</p>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLogout}
            className="bg-white text-black hover:bg-zinc-200 font-bold px-8 h-12 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-white/5"
          >
            Terminate Session
          </Button>
        </div>
      </div>
    </div>
  );
}
