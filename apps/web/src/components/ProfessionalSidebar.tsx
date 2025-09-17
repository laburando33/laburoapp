'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/admin.module.css";

export default function ProfessionalSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/professional/dashboard", label: "🏠 Inicio" },
    { href: "/professional/shop", label: "💳 Mis Créditos" },
    { href: "/professional/verificacion", label: "🛂 Verificación" },
    { href: "/professional/perfil", label: "👤 Mi Perfil" },
    { href: "/professional/desbloqueos", label: "🔓 Mis Desbloqueos" },
  ];

  return (
    <nav className={styles.sidebarWrapper}>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {links.map((link) => (
          <li key={link.href} style={{ marginBottom: "1rem" }}>
            <Link
              href={link.href}
              className={pathname === link.href ? styles.activeTab : undefined}
              style={{
                textDecoration: "none",
                color: pathname === link.href ? "#000" : "#555",
                fontWeight: pathname === link.href ? "bold" : "normal",
              }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
