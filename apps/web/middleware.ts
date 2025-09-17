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
  const isAdminRoute = url.pathname.startsWith("/admin");
  const isProRoute = url.pathname.startsWith("/professional");

  if (!isLoggedIn) {
    if (isLoginPage) return res;
    return NextResponse.redirect(new URL("/login?msg=auth", req.url));
  }

  const { data: profile } = await supabase
    .from("professionals")
    .select("role")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!profile) {
    console.log("👤 Perfil no encontrado. Creando automáticamente...");

    const { error } = await supabase.from("professionals").insert({
      user_id: session.user.id,
      email: session.user.email,
      full_name: session.user.user_metadata.name || "",
      phone: session.user.user_metadata.phone || "",
      category: session.user.user_metadata.category || "",
      is_verified: false,
      role: "profesional",
    });

    if (error) {
      console.error("❌ Error al crear el perfil automáticamente:", error.message);
      return NextResponse.redirect(new URL("/login?msg=noprofile", req.url));
    }

    // 🔁 Redireccionar según rol predeterminado
    return NextResponse.redirect(new URL("/professional/perfil", req.url));
  }

  if (isLoginPage) {
    return profile.role === "administrador"
      ? NextResponse.redirect(new URL("/admin", req.url))
      : NextResponse.redirect(new URL("/professional", req.url));
  }

  if (isAdminRoute && profile.role !== "administrador") {
    return NextResponse.redirect(new URL("/professional/perfil", req.url));
  }

  if (isProRoute && profile.role !== "profesional") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/professional/:path*",
    "/professional",
    "/login",
  ],
};
