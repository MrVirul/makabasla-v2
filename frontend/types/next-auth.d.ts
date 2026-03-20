import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    isInternal?: boolean
    user: {
      id: string
      sub?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    accessToken?: string
    isInternal?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken?: string
    isInternal?: boolean
    sub?: string
  }
}
