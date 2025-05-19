'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, CreditCard, LogOut } from "lucide-react"; // Importamos íconos
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-web";
import styles from "@/components/MobileNav.module.css"; // Ahora CSS aparte

interface MobileNavProps {
  role: string;
}

export default function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = role === "admin" ? [
    { href: "/admin/dashboard", icon: <Home size={42} /> },
    { href: "/admin/profesionales", icon: <User size={42} /> },
    { href: "/admin/shop", icon: <CreditCard size={42} /> },
    { href: "/admin/profile", icon: <User size={42} /> },
  ] : [
    { href: "/professional/dashboard", icon: <Home size={22} />, label: "Inicio" },
    { href: "/professional/perfil", icon: <User size={22} />, label: "Perfil" },
    { href: "/professional/shop", icon: <CreditCard size={22} />, label: "Créditos" },
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

      {/* Botón de logout */}
      <button onClick={handleLogout} className={styles.link}>
        <LogOut size={22} />
        <span>Salir</span>
      </button>
    </nav>
  );
}
