import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: (process.env.KEYCLOAK_CLIENT_ID || "").trim(),
      clientSecret: (process.env.KEYCLOAK_CLIENT_SECRET || "").trim(),
      issuer: (process.env.KEYCLOAK_ISSUER || "").trim(),
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

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
          // Decode the token to get actual user info from Keycloak if possible
          // For now, continue with basic user object but mark as internal
          return {
            id: credentials.username,
            name: credentials.username,
            email: credentials.username + "@internal.makabasla.com",
            accessToken: tokens.access_token,
          };
        } else {
          console.error("Keycloak Login Error:", tokens);
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.accessToken = user.accessToken;
        // @ts-ignore
        token.id = user.id;
        // @ts-ignore
        token.isInternal = user.email?.endsWith("@internal.makabasla.com") || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id || token.sub;
        // @ts-ignore
        session.accessToken = token.accessToken;
        // @ts-ignore
        session.isInternal = token.isInternal;
      }
      return session;
    },
  },
})

export { handler as GET, handler as POST }