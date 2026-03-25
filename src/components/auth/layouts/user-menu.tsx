"use client";

import * as React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/slices/auth-slice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { logoutApiCall } from "@/lib/auth";
import UserAvatar from "@/components/user-avatar";
import { signOut } from "next-auth/react";
import { RootState } from "@/redux/store";

interface UserMenuProps {
  image?: string;
  name?: string;
  username?: string;
}

const UserMenu = ({ image, name, username }: UserMenuProps = {}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, provider } = useSelector((state: RootState) => state.auth);
  const img = image ?? user?.imageUrl ?? "";
  const displayName = name ?? user?.fullName ?? user?.userName ?? "User";
  const displayUsername = username ?? user?.userName ?? "N/A";
  const displayEmail = user?.email ?? "N/A";

  const handleLogout = async () => {
    try {
      const currentProvider = provider;
      try { await logoutApiCall(); } catch {}
      dispatch(logout());
      toast.success("Logged out successfully", {
        position: "top-right",
        duration: 3000,
        style: { background: "#4caf50", color: "#fff" },
      });
      if (currentProvider && currentProvider !== "credentials") {
        await signOut({ callbackUrl: "/login" });
      } else {
        router.replace("/login");
      }
    } catch (error) {
      dispatch(logout());
      router.replace("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="group relative bg-transparent border-0 hover:bg-transparent">
          <span className="sr-only">User Menu</span>
          <UserAvatar src={img} fallback={displayName.charAt(0).toUpperCase()} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-white p-0">
        <div className="px-4 py-3 border-b border-white/[0.05] bg-white/[0.02]">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Session</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full ring-2 ring-white/10 shrink-0">
              <UserAvatar src={img} fallback={displayName.charAt(0).toUpperCase()} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm truncate">{displayName}</span>
              <span className="text-[11px] text-zinc-500 truncate mt-0.5">@{displayUsername}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{displayEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="capitalize">{provider || "credentials"} session</span>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-white/5 m-0" />
        <div className="p-2">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 focus:bg-red-500/20 focus:text-red-300 font-semibold cursor-pointer rounded-md flex justify-center py-2"
          >
            Sign Out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;