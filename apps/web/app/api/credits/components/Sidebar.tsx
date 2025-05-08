'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/admin.module.css";

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/profesionales", label: "Profesionales" },
    { href: "/admin/verificacion", label: "Verificación" },
    { href: "/admin/shop", label: "Créditos" },
    { href: "/admin/profile", label: "Mi Perfil" },
  ];

  const professionalLinks = [
    { href: "/professional/dashboard", label: "Inicio" },
    { href: "/professional/perfil", label: "Mi Perfil" },
    { href: "/professional/verificacion", label: "Verificación" },
    { href: "/professional/shop", label: "Créditos" },
  ];

  const links = role === "administrador" ? adminLinks : professionalLinks;

  return (
    <aside className={styles.sidebarWrapper}>
      <ul style={{ listStyle: "none", padding: "1rem" }}>
        {links.map((link) => (
          <li key={link.href} style={{ marginBottom: "1rem" }}>
            <Link
              href={link.href}
              className={pathname === link.href ? styles.activeTab : ""}
              style={{
                textDecoration: "none",
                fontWeight: pathname === link.href ? "bold" : "normal",
                color: pathname === link.href ? "#000" : "#555",
              }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
