"use client";

import { motion } from "framer-motion";
import { IoLogoGooglePlaystore, IoLogoApple } from "react-icons/io5";
import { QRCodeSVG } from "qrcode.react";
import styles from "./HowItWorks.module.css"; // ✅ usamos tu CSS

export default function DownloadApp() {
  return (
    <section className={styles.downloadApp}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Subtítulo */}
 
        

        {/* Contenido */}
        <div className={styles.content}>
          {/* Texto + Botones */}
          <div className={styles.textSection}>
            {/* Título */}
            <h2 className={styles.title}>¡Labura con nosotros!</h2>
            <p className={styles.description}>
              Con LaburandoApp encontrá clientes cerca tuyo de forma fácil y segura desde tu celular.
            </p>

            <div className={styles.buttons}>
              <motion.a
                href="https://play.google.com/store/apps/details?id=com.laburando.app"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.button}
                whileHover={{ scale: 1.05 }}
              >
                <IoLogoGooglePlaystore size={28} />
                Google Play
              </motion.a>

              <motion.a
                href="https://apps.apple.com/app/id0000000000"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.button}
                whileHover={{ scale: 1.05 }}
              >
                <IoLogoApple size={28} />
                App Store
              </motion.a>
            </div>
          </div>

    
          
        </div>
      </motion.div>
    </section>
  );
}
