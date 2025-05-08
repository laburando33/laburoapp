"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoMenu, IoClose } from "react-icons/io5";
import { isMobile } from "react-device-detect";
import { QRCodeSVG } from "qrcode.react";
import styles from "./Header.module.css";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleQuieroLaburar = () => {
    setIsMobileMenuOpen(false);
    if (isMobile) {
      window.location.href = "https://expo.dev/@tulaburando/laburando-app";
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
        <Link href="/">
  <Image
    src="/logo.png"
    alt="Laburando Logo"
    width={180}
    height={130}
    priority // 👈 importante para LCP
    style={{ width: "auto", height: "auto" }} // 👈 previene warning de aspect ratio
  />
</Link>
        </div>

        <nav
          className={`${styles.nav} ${
            isMobileMenuOpen ? styles.navMobileOpen : ""
          }`}
        >
          <Link href="/" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>
            Inicio
          </Link>
          <Link href="/login" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>
            Iniciar sesión
          </Link>
          <button className={styles.ctaButton} onClick={handleQuieroLaburar} aria-label="Quiero laburar">
            Quiero laburar
          </button>
        </nav>

        <div className={styles.mobileMenuIcon}>
          <button onClick={toggleMobileMenu} className={styles.menuButton} aria-label="Menú móvil">
            {isMobileMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
          </button>
        </div>
      </header>

      {/* Modal QR */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowModal(false)}>
              ×
            </button>
            <p className={styles.qrText}>Escaneá el código QR con la app Expo Go:</p>
            <QRCodeSVG
              value="https://expo.dev/@tulaburando/laburando-app"
              size={180}
              fgColor="#333"
              bgColor="#fff"
            />
            <p className={styles.qrHint}>También podés buscar “Laburando” en Expo Go.</p>
            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              <a href="https://play.google.com/store/apps/details?id=com.laburando.app" target="_blank" rel="noopener noreferrer">
                <img src="/LogoStore/LogoPlayStore.jpg" alt="Disponible en Google Play" style={{ height: 50 }} />
              </a>
              <a href="https://apps.apple.com/app/id0000000000" target="_blank" rel="noopener noreferrer">
                <img src="/LogoStore/LogoAppStore.jpg" alt="Disponible en App Store" style={{ height: 50 }} />
              </a>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/register/profesional">
                <span style={{ color: "#000", textDecoration: "underline", fontSize: "0.95rem", fontWeight: 500, cursor: "pointer" }}>Continuar en la web</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}