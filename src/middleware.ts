import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // User is authenticated.
    // Allow the request to continue.
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },

    pages: {
      signIn: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,
  }
);

export const config = {
  matcher: [
    "/",
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)",
  ],
};