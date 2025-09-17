"use client";

import { useRouter } from "next/navigation";
import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return <button onClick={handleLogout} className={styles.logoutBtn}>🚪 Cerrar sesión</button>;
}
