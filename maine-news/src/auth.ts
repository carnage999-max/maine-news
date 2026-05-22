import { getServerSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHub({
      clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID!,
      clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET!
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL!;
        const adminPassword = process.env.ADMIN_PASSWORD!;
        if (credentials?.email === adminEmail && credentials?.password === adminPassword) {
          return { id: "1", name: "Admin User", email: adminEmail };
        }
        return null;
      }
    })
  ],
  secret: process.env.AUTH_SECRET!,
  pages: {
    signIn: "/admin/login"
  }
};

export function auth() {
  return getServerSession(authOptions);
}
