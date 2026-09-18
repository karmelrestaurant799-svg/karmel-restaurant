import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { clientIp } from "@/lib/http";

// The "login" limiter existed but was never applied, leaving credentials login
// open to unthrottled password guessing (bcrypt cost is the only brake). Limit
// per IP (credential stuffing) and per email (distributed guessing at one
// account). If Upstash is unreachable we fail open and log rather than lock
// every user out of signing in.
async function loginAllowed(email: string, request?: Request): Promise<boolean> {
  try {
    const [byIp, byEmail] = await Promise.all([
      rateLimit("login", `ip:${request ? clientIp(request) : "unknown"}`),
      rateLimit("login", `email:${email.toLowerCase()}`),
    ]);
    return byIp.success && byEmail.success;
  } catch (err) {
    console.error("[auth] login rate limiter unavailable, allowing attempt:", err);
    return true;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        if (!(await loginAllowed(email, request))) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  events: {
    // First-ever Google/Facebook sign-in: the user row is created and linked *after*
    // the signIn callback below ran, so it couldn't be marked verified there. Without
    // this, such users stayed unverified until their second login (and the retention
    // cron treats unverified accounts as abandoned).
    async linkAccount({ user }) {
      if (!user.id) return;
      await prisma.user.updateMany({
        where: { id: user.id, emailVerified: null },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Google/Facebook accounts are pre-verified by the provider, so mark them verified.
      // Scoped to a user that already has *this* provider account linked: this callback
      // runs before Auth.js links/rejects the login, so matching on email alone would
      // let a Google/Facebook sign-in attempt "verify" an unrelated password account
      // someone else pre-registered under the same email address.
      if (account && account.provider !== "credentials" && user.email) {
        await prisma.user.updateMany({
          where: {
            email: user.email,
            emailVerified: null,
            accounts: {
              some: { provider: account.provider, providerAccountId: account.providerAccountId },
            },
          },
          data: { emailVerified: new Date() },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "USER";
      } else if (token.email && !token.role) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        token.role = dbUser?.role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { role?: string }).role = token.role as string;
      return session;
    },
  },
});