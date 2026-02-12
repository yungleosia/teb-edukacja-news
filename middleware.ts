
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;

    // --- VPN BLOCKER LOGIC ---
    // Exclude certain paths from VPN check
    const isExcluded = [
      "/vpn-blocked",
      "/api/",
      "/_next/",
      "/favicon.ico",
      "/static/"
    ].some(path => pathname.startsWith(path));

    if (!isExcluded) {
      // Get IP
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

      // Skip local development
      if (ip !== "127.0.0.1" && ip !== "::1") {
        const apiKey = process.env.VPN_API_KEY;
        if (apiKey) {
          try {
            const res = await fetch(`https://vpnapi.io/api/${ip}?key=${apiKey}`);
            const data = await res.json();

            if (data.security && (data.security.vpn || data.security.proxy || data.security.tor)) {
              const url = req.nextUrl.clone();
              url.pathname = "/vpn-blocked";
              return NextResponse.rewrite(url);
            }
          } catch (e) {
            console.error("VPN Check Failed", e);
          }
        }
      }
    }
    // --- END VPN BLOCKER LOGIC ---
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Admin check logic
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }
        // Allow other routes by default if they are not explicitly protected here
        // The middleware matcher controls which routes run this.
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    // We need to match pretty much everything for VPN check, but withAuth might be restrictive.
    // Making withAuth match everything forces auth on everything, which is BAD for public pages.
    // Strategy: Separate Middleware or conditional logic.
    // Better strategy for this task:
    // Use a standard middleware export that delegates to next-auth ONLY for admin routes,
    // and runs VPN check for global routes.
    // However, Next.js only allows ONE middleware file.
    // SO: We need to wrap the whole thing or use standard middleware structure.
  ]
};
