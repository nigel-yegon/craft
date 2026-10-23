// app/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );
        if (!valid) return null;

        // Return the full shape the JWT/session callbacks will copy from.
        // `name` is nullable on the DB row, so we fall back to the local
        // part of the email to guarantee a non-empty display name.
        return {
          id: user.id,
          name: user.name ?? user.email.split("@")[0],
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: { signIn: "/login" },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // `authorize`'s return value lands in `user` on first sign-in.
    // Everything we want available later must be copied onto `token` here.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? null;
        token.email = user.email ?? null;
        token.role = (user as { role?: string }).role ?? "CLIENT";
      }
      return token;
    },

    // And everything the client reads via `useSession()` / `session` comes
    // from what we set here. This is what feeds `SiteChromeSession`.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.name = (token.name as string | null) ?? null;
        session.user.email = (token.email as string | null) ?? null;
        (session.user as { role?: string }).role =
          (token.role as string) ?? "CLIENT";
      }
      return session;
    },
  },
};