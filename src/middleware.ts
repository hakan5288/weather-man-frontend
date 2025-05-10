import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check authentication by calling backend
  try {
    const response = await fetch("https://weatherbackend.duckdns.org/auth/profile", {
      method: "GET",
      headers: {
        Cookie: request.headers.get("cookie") || "", // Forward cookies
      },
      credentials: "include", // Include token cookie
    });

    const isLoggedIn = response.ok;

    const isAuthRoute = pathname.startsWith("/auth") || pathname === "/";
    const isDashboardRoute = pathname.startsWith("/dashboard");

    if (isLoggedIn && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!isLoggedIn && isDashboardRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (!isLoggedIn && pathname === "/") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  } catch (error) {
    console.error("Middleware auth check failed:", error);
    // Redirect to login on error
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Allow request to proceed
  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: ["/", "/auth/:path*", "/dashboard/:path*"],
};
