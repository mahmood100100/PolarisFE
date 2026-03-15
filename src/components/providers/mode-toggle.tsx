"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-transparent border-0" variant="outline" size="icon">
          <Sun
            className={`h-[1.2rem] w-[1.2rem] transition-all ${
              theme === "dark" ? "opacity-0" : "opacity-100"
            }`}
            color={theme === "dark" ? "#E3E5E8" : "#1E1F22"}
          />
          <Moon
            className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
              theme === "light" ? "opacity-0" : "opacity-100"
            }`}
            color={theme === "light" ? "#1E1F22" : "#E3E5E8"}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
