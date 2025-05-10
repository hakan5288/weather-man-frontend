import { NextResponse } from "next/server";
  import type { NextRequest } from "next/server";

  export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    console.log("Middleware: Checking auth for", pathname); // Debug log

    try {
      const cookieHeader = request.headers.get("cookie") || "";
      console.log("Middleware: Cookie header:", cookieHeader); // Debug cookie

      const response = await fetch("https://weatherbackend.duckdns.org/auth/profile", {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
          Origin: "https://main.d3g541h41hp0zb.amplifyapp.com", // Match CORS origin
        },
        credentials: "include", // Include token cookie
      });

      console.log("Middleware: /auth/profile response status:", response.status); // Debug status

      const isLoggedIn = response.ok;

      const isAuthRoute = pathname.startsWith("/auth") || pathname === "/";
      const isDashboardRoute = pathname.startsWith("/dashboard");

      if (isLoggedIn && isAuthRoute) {
        console.log("Middleware: Redirecting authenticated user to /dashboard");
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (!isLoggedIn && isDashboardRoute) {
        console.log("Middleware: Redirecting unauthenticated user to /auth/login");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      if (!isLoggedIn && pathname === "/") {
        console.log("Middleware: Redirecting unauthenticated root to /auth/login");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    } catch (error) {
      console.error("Middleware auth check failed:", error);
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    console.log("Middleware: Allowing request to proceed");
    return NextResponse.next();
  }

  export const config = {
    matcher: ["/", "/auth/:path*", "/dashboard/:path*"],
  };
