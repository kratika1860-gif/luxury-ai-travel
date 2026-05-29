import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "Developer Bypass",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string) || "test@example.com";
        
        // Dynamic import to prevent next-auth init circular dependencies
        const { prisma } = await import("@/lib/prisma");

        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
            image: `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 99) + 1}`,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret-key-change-in-production",
});
