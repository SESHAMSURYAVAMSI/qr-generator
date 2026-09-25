import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email = String(
          credentials?.email ?? ""
        ).trim();

        const password = String(
          credentials?.password ?? ""
        );

        const adminEmail =
          process.env.ADMIN_EMAIL;

        const adminPassword =
          process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          console.error(
            "ADMIN_EMAIL or ADMIN_PASSWORD is missing."
          );

          return null;
        }

        if (
          email !== adminEmail ||
          password !== adminPassword
        ) {
          return null;
        }

        return {
          id: "admin",
          name: "Administrator",
          email: adminEmail,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export {
  handler as GET,
  handler as POST,
};