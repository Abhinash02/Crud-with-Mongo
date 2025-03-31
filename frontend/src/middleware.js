import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;

  // If no token, redirect to login page
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Apply middleware only to protected routes (including CRUD pages)
export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/profile/:path*", 
    "/protected-page", 
    "/crud/:path*"   // ✅ Protects CRUD pages
  ],
};
