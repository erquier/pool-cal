import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
