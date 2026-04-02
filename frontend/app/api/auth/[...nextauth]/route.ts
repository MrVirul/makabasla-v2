import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"
import CredentialsProvider from "next-auth/providers/credentials"
import { jwtDecode } from "jwt-decode"

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: (process.env.KEYCLOAK_CLIENT_ID || "").trim(),
      clientSecret: (process.env.KEYCLOAK_CLIENT_SECRET || "").trim(),
      issuer: (process.env.KEYCLOAK_ISSUER || "").trim(),
    }),
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
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
          };
        }
        // ---------------------------------------

        const issuer = (process.env.KEYCLOAK_ISSUER || "").trim();
        const tokenEndpoint = `${issuer}/protocol/openid-connect/token`;

        const res = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'password',
            client_id: (process.env.KEYCLOAK_CLIENT_ID || "").trim(),
            client_secret: (process.env.KEYCLOAK_CLIENT_SECRET || "").trim(),
            username: credentials.username,
            password: credentials.password,
            scope: 'openid profile email',
          }),
        });

        const tokens = await res.json();

        if (res.ok && tokens.access_token) {
          // Decode token to get roles immediately for the credentials login
          const decoded: any = jwtDecode(tokens.access_token);
          const clientId = (process.env.KEYCLOAK_CLIENT_ID || "").trim();
          const clientRoles = decoded.resource_access?.[clientId]?.roles || [];
          const realmRoles = decoded.realm_access?.roles || [];
          
          const roles = [...new Set([...realmRoles, ...clientRoles])];

          return {
            id: decoded.sub,
            name: decoded.preferred_username || credentials.username,
            email: decoded.email,
            accessToken: tokens.access_token,
            roles: roles,
          };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // @ts-ignore - From CredentialsProvider
        token.accessToken = user.accessToken;
        // @ts-ignore
        token.roles = user.roles || [];
      }
      
      if (account) {
        // From KeycloakProvider
        token.accessToken = account.access_token;
        
        try {
          const decoded: any = jwtDecode(account.access_token as string);
          const clientId = (process.env.KEYCLOAK_CLIENT_ID || "").trim();
          const clientRoles = decoded.resource_access?.[clientId]?.roles || [];
          const realmRoles = decoded.realm_access?.roles || [];
          token.roles = [...new Set([...realmRoles, ...clientRoles])];
        } catch (e) {
          token.roles = token.roles || [];
        }
      }

      // Re-apply admin flags on every JWT update
      token.isSuperAdmin = (token.roles as string[]).includes('super_admin');
      token.isAdmin = (token.roles as string[]).includes('admin') || token.isSuperAdmin;
      
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
      }
      return session;
    },
  },
})

export { handler as GET, handler as POST }