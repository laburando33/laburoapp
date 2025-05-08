"use client";

import Link from "next/link";
import { IoLogoInstagram, IoLogoFacebook, IoLogoTiktok } from "react-icons/io5";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.socials}>
          <a href="https://www.instagram.com/laburandoapp/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <IoLogoInstagram size={28} />
          </a>
          <a href="https://www.facebook.com/share/1AZ3YMHeLN/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <IoLogoFacebook size={28} />
          </a>
          <a href="https://www.tiktok.com/@laburando.app?_t=ZN-8viLpAqdclK&_r=1" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            <IoLogoTiktok size={28} />
          </a>
        </div>
        <p>© {new Date().getFullYear()} Laburando. Todos los derechos reservados.</p>
        <p className={styles.footerLinks}>
          <Link href="/terminos">Términos y Condiciones</Link> · {" "}
          <Link href="/politica-devoluciones">Política de Devoluciones</Link>
        </p>
      </div>
    </footer>
  );
}