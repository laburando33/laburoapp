"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiUsers, FiCheckCircle, FiDollarSign, FiClipboard, FiLogOut } from "react-icons/fi";
import { supabase } from "@/lib/supabase-web";
import styles from "./AdminSidebar.module.css";
import { FiUnlock } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
import { FiBell } from "react-icons/fi";



export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin", label: "Dashboard", icon: <FiClipboard /> }, // ← corregido
    { href: "/admin/profesionales", label: "Profesionales", icon: <FiUsers /> },
    { href: "/admin/verificacion", label: "Verificación", icon: <FiCheckCircle /> },
    { href: "/admin/shop", label: "Créditos", icon: <FiDollarSign /> },
    { href: "/admin/desbloqueos", label: "Desbloqueos", icon: <FiUnlock /> },
    { href: "/admin/pendientes", label: "Pendientes", icon: <FiEyeOff /> },
    { href: "/admin/notificaciones", label: "Notificaciones", icon: <FiBell /> },
    { href: "/admin/historial", label: "Historial", icon: <FiBell /> },

  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // Redirigir al login
  };

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>🛠️ Admin</h2>
      <nav className={styles.nav}>
        {links.map(({ href, label, icon }) => (
          <Link key={href} href={href} className={`${styles.navLink} ${pathname === href ? styles.active : ""}`}>
            {icon}
            <span>{label}</span>
          </Link>
        ))}
        <button className={styles.logoutButton} onClick={handleLogout}>
          <FiLogOut />
          <span>Salir</span>
        </button>
      </nav>
    </aside>
  );
}
