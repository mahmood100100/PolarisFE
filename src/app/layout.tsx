import { ReduxProvider } from "@/redux/provider";
import "./globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";


import { AuthInitializer } from "@/components/providers/auth-initializer";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polaris",
  description: "Polaris is a platform for creating and managing your team's projects and tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${openSans.variable} antialiased`}>

        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <AuthInitializer>
                {children}
              </AuthInitializer>
            </AuthProvider>
          </ThemeProvider>

          <Toaster position="top-right" reverseOrder={false} />
        </ReduxProvider>
      </body>
    </html>
  );
}