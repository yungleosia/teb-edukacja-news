import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Custom logic can go here
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Check if the route is /admin and if the user has the ADMIN role
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "ADMIN"
        }
        // For other protected routes (if any), just require a session
        return !!token
      },
    },
  }
)

export const config = { matcher: ["/admin/:path*"] }
