import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { socialLoginApiCall } from "@/lib/auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Check if the provider is an external social provider (github, google, etc.)
      const externalProviders = ["github", "google"];
      
      if (account && externalProviders.includes(account.provider)) {
        try {
          console.log(`--- DEBUG: Social Login (${account.provider}) ---`);
          const result = await socialLoginApiCall({
            email: user.email,
            name: user.name,
            provider: account.provider,
            providerId: user.id || "",
          });

          if (result.success) {
            console.log(`Backend Social Login SUCCESS for ${account.provider}`);
            (user as any).accessToken = result.accessToken;
            (user as any).backendUser = result.user;
            (user as any).expiresAt = result.expiresAt;
            (user as any).provider = account.provider;
            return true;
          }
          
          console.error(`Backend Social Login FAILED for ${account.provider}:`, result.error);
          return false; 
        } catch (error) {
          console.error(`Critical error during backend social login (${account.provider}):`, error);
          return false; 
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.backendUser = (user as any).backendUser;
        token.expiresAt = (user as any).expiresAt;
        token.provider = (user as any).provider || "credentials";
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).user = token.backendUser;
      (session as any).expiresAt = token.expiresAt;
      (session as any).provider = token.provider;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
})

