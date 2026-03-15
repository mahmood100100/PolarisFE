"use client";

import React from "react";

const SplashScreen = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#0d0d0d]">
      <div className="flex flex-col items-center space-y-8">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-xl bg-white/10 blur-xl animate-pulse" />
          <div className="relative z-10 w-20 h-20 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center animate-pulse">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
        </div>

        <div className="text-4xl font-bold text-white tracking-tight">
          Polaris
        </div>
        <p className="text-sm text-zinc-500">AI-powered coding assistant</p>
      </div>
    </div>
  );
};

export default SplashScreen;
