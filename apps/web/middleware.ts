import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl;
  const isLoggedIn = !!session?.user;
  const isLoginPage = url.pathname === "/login";
  const isAdminRoot = url.pathname === "/admin";

  // 🔐 Usuario no logueado
  if (!isLoggedIn) {
    if (isLoginPage) return res;
    return NextResponse.redirect(new URL("/login?msg=auth", req.url));
  }

  // ✅ Usuario logueado: buscamos perfil
  const { data: profile } = await supabase
    .from("professionals")
    .select("role")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.redirect(new URL("/login?msg=noprofile", req.url));
  }

  // 🚫 Usuario ya logueado, intenta ver /login
  if (isLoginPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 🚪 Ruta raíz de admin
  if (isAdminRoot) {
    return profile.role === "administrador"
      ? res
      : NextResponse.redirect(new URL("/admin/profile", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/login"],
};
