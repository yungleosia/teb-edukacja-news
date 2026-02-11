import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Custom logic if needed, but the authorized callback handles the main check
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Protect /admin routes: must be logged in AND have role "ADMIN"
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "ADMIN"
        }
        // By default, if matched, require login
        return !!token
      },
    },
  }
)

export const config = { matcher: ["/admin/:path*"] }
