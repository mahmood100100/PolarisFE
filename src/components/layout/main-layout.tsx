"use client";

import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function MainLayout({ children, rightSlot }: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
        <span className="font-semibold text-lg">Polaris</span>
        {rightSlot}
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
