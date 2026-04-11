import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: (process.env.GOOGLE_CLIENT_ID || "").trim(),
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "").trim(),
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // --- DEVELOPMENT BYPASS: admin / admin ---
        if (credentials.username === "admin" && credentials.password === "admin") {
          return {
            id: "local-dev-root",
            name: "Master Registry Admin",
            email: "admin@garage.lk",
            roles: ["super_admin", "admin", "admin:registry", "admin:billing", "admin:customers"],
            accessToken: "local-bypass-token"
          } as any;
        }

        // --- BACKEND AUTHENTICATION ---
        try {
          const res = await fetch("http://127.0.0.1:8080/api/auth/api/v1/auth/login", {
            method: "POST",
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          if (res.ok && data) {
            return {
              id: data.id,
              name: data.name,
              email: data.email,
              roles: data.roles || ["customer"],
              accessToken: "backend-issued-token", // In a real app, this would be a JWT from backend
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
        }

        return null;
      }
    }),
  ],
  pages: {
    // Custom page that auto-triggers Google sign-in, bypassing NextAuth's default UI
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        // @ts-ignore - From CredentialsProvider
        token.accessToken = user.accessToken;
        // @ts-ignore
        token.roles = (user as any).roles || [];
        if (user.image) {
          token.picture = user.image;
        }
      }

      if (account) {
        token.accessToken = account.access_token;
        token.roles = token.roles || [];

        // Capture Google profile picture
        if (profile && (profile as any).picture) {
          token.picture = (profile as any).picture;
        }
      }

      // Compute admin flags from roles
      token.isSuperAdmin = ((token.roles as string[]) || []).includes('super_admin');
      token.isAdmin = ((token.roles as string[]) || []).includes('admin') || token.isSuperAdmin;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.sub || token.id;
        // @ts-ignore
        session.accessToken = token.accessToken;
        // @ts-ignore
        session.roles = token.roles || [];
        // @ts-ignore
        session.isSuperAdmin = token.isSuperAdmin || false;
        // @ts-ignore
        session.isAdmin = token.isAdmin || false;
        // @ts-ignore
        session.user.image = token.picture || session.user.image;
      }
      return session;
    },
  },
})

export { handler as GET, handler as POST }