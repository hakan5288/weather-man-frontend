import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get cookie header for debugging
  const cookieHeader = request.headers.get("cookie") || "";
  console.log("Middleware: Pathname:", pathname);
  console.log("Middleware: Cookie header:", cookieHeader);

  // Assume unauthenticated by default
  let isLoggedIn = false;

  // Check for token cookie presence (temporary)
  if (cookieHeader.includes("token=")) {
    try {
      const response = await fetch("https://weatherbackend.duckdns.org/auth/profile", {
        method: "GET",
        headers: {
          "Cookie": cookieHeader,
          "Origin": "https://main.d3g541h41hp0zb.amplifyapp.com",
        },
        credentials: "include",
      });
      isLoggedIn = response.ok;
      console.log("Middleware: /auth/profile status:", response.status);
    } catch (error) {
      console.error("Middleware: Auth check error:", error);
    }
  }

  const isAuthRoute = pathname.startsWith("/auth") || pathname === "/";
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (isLoggedIn && isAuthRoute) {
    console.log("Middleware: Redirecting to /dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isLoggedIn && isDashboardRoute) {
    console.log("Middleware: Redirecting to /auth/login");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (!isLoggedIn && pathname === "/") {
    console.log("Middleware: Redirecting to /auth/login");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  console.log("Middleware: Allowing request");
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth/:path*", "/dashboard/:path*"],
};
