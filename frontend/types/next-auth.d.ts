import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    isInternal?: boolean
    isAdmin?: boolean
    isSuperAdmin?: boolean
    roles?: string[]
    user: {
      id: string
      sub?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    accessToken?: string
    isInternal?: boolean
    isAdmin?: boolean
    isSuperAdmin?: boolean
    roles?: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken?: string
    isInternal?: boolean
    isAdmin?: boolean
    isSuperAdmin?: boolean
    roles?: string[]
    sub?: string
  }
}
