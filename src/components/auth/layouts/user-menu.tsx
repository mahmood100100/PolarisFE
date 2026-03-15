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
import { RootState } from "@/redux/store";

interface UserMenuProps {
  image?: string;
  name?: string;
  username?: string;
}

const UserMenu = ({ image, name, username }: UserMenuProps = {}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const img = image ?? user?.imageUrl ?? "";
  const displayName = name ?? user?.fullName ?? user?.userName ?? "User";
  const displayUsername = username ?? user?.userName ?? "";

  const handleLogout = async () => {
    try {
      const result = await logoutApiCall();
      console.log(result);

      if (result === undefined) {
        dispatch(logout());
        toast.success("Logged out successfully", {
          position: "top-right",
          duration: 3000,
          style: {
            background: "#4caf50",
            color: "#fff",
          },
        });
        router.replace("/login");
      } else if (result?.success === false) {
        toast.error(result?.error || "Logout failed. Please try again.", {
          position: "top-right",
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout. Please try again.", {
        position: "top-right",
        duration: 3000,
        style: {
          background: "#f44336",
          color: "#fff",
        },
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="group relative bg-transparent border-0">
          <span className="sr-only">User Menu</span>
          <UserAvatar src={img} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel className="flex items-center gap-2">
          <div className="rounded-full ring-1 ring-zinc-600">
            <UserAvatar src={img} />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground">@{displayUsername}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;