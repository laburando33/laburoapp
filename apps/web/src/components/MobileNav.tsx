'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, CreditCard, Settings, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@lib/supabase-web";
import styles from "@components/MobileNav.module.css";

interface MobileNavProps {
  role: string;
}

export default function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = role === "admin" ? [
    { href: "/admin/dashboard", icon: <Home size={24} />, label: "Inicio" },
    { href: "/admin/profesionales", icon: <User size={24} />, label: "Profesionales" },
    { href: "/admin/compras", icon: <CreditCard size={24} />, label: "Compras" },
    { href: "/admin/settings", icon: <Settings size={24} />, label: "Config" },
  ] : [
    { href: "/professional/dashboard", icon: <Home size={24} />, label: "Inicio" },
    { href: "/professional/shop", icon: <CreditCard size={24} />, label: "Créditos" },
    { href: "/professional/verificacion", icon: <CheckCircle2 size={24} />, label: "Verificación" },
    { href: "/professional/perfil", icon: <User size={24} />, label: "Perfil" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <nav className={styles.mobileNav}>
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={pathname === link.href ? styles.activeLink : styles.link}
        >
          {link.icon}
          <span>{link.label}</span>
        </Link>
      ))}
      <button onClick={handleLogout} className={styles.link}>
        <span>Salir</span>
      </button>
    </nav>
  );
}
