import { DefaultSession } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/services/db";
import User from "@/lib/models/User";
import { Session, User as NextAuthUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      credits: number;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  callbacks: {
    async signIn({ user }: { user: NextAuthUser }) {
      if (!user.email) return false;

      await connectDB();
      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        await User.create({ email: user.email, credits: 5 });
      }

      return true;
    },
    async session({ session }: { session: Session }) {
      if (session.user?.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email });

        session.user.credits = dbUser?.credits ?? 5;
      }
      return session;
    },
  },
};

