"use client";

import { FaGithub, FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export const Social = () => {
    const onClick = (provider: "github" | "google") => {
        signIn(provider, {
            callbackUrl: "/"
        });
    };

    return (
        <div className="flex items-center w-full gap-x-2">
            <Button
                size="lg"
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                variant="outline"
                onClick={() => onClick("google")}
            >
                <FaGoogle className="h-5 w-5 mr-2 text-red-500" />
                Google
            </Button>
            <Button
                size="lg"
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                variant="outline"
                onClick={() => onClick("github")}
            >
                <FaGithub className="h-5 w-5 mr-2" />
                GitHub
            </Button>
        </div>
    );
};

