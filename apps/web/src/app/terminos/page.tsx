// app/terminos/page.tsx
"use client";

import React from "react";
import styles from "../page.module.css"; // Reutiliza estilos de tu landing principal
export default function Terminos() {
  return (
    <div className={styles.page}>
     
        <section className={styles.legalSection}>
          <h1 className={styles.sectionTitle}>Términos y Condiciones de Laburando App</h1>
          <p><strong>Fecha de entrada en vigencia:</strong> [Fecha]</p>

          <h2 className={styles.subTitle}>Introducción</h2>
          <p>Al registrarse y utilizar Laburando App, aceptás estos términos. Laburando App conecta a usuarios que necesitan servicios del hogar con prestadores de servicio, pero no nos hacemos responsables de los servicios prestados.</p>

          <h2 className={styles.subTitle}>Función de la Plataforma</h2>
          <p>Laburando App actúa únicamente como un canal de comunicación entre usuarios y prestadores de servicio. No garantizamos la calidad, cumplimiento ni responsabilidad por los servicios realizados.</p>

          <h2 className={styles.subTitle}>Registro</h2>
          <ul>
            <li>Los usuarios deben proporcionar información veraz al solicitar un servicio.</li>
            <li>Los prestadores deben registrarse, adquirir créditos y usarlos para acceder a los leads.</li>
          </ul>

          <h2 className={styles.subTitle}>Uso de Datos</h2>
          <p>Los datos de usuarios y prestadores serán utilizados únicamente dentro de la plataforma. Está prohibido compartir o vender datos fuera de Laburando App.</p>

          <h2 className={styles.subTitle}>Responsabilidad del Prestador</h2>
          <p>Cada prestador es responsable de sus obligaciones fiscales. Si incumple, podrá ser sancionado y se compartirá su información con las autoridades si la ley lo exige.</p>

          <h2 className={styles.subTitle}>Exclusión de Responsabilidad</h2>
          <p>Laburando App no se hace responsable de disputas entre usuarios y prestadores ni garantiza el cumplimiento de los servicios.</p>

          <h2 className={styles.subTitle}>Modificación de los Términos</h2>
          <p>Laburando App puede modificar estos términos y notificará a través de la plataforma.</p>

          <h2 className={styles.subTitle}>Sanciones</h2>
          <p>El incumplimiento puede causar la eliminación de la cuenta sin derecho a reembolso.</p>

          <h2 className={styles.subTitle}>Uso de Marca</h2>
          <p>Está prohibido el uso de nuestro logo o nombre sin autorización previa.</p>

          <h2 className={styles.subTitle}>Contacto</h2>
          <p>Para consultas, escribinos a: [correo electrónico]</p>
        </section>
   
    </div>
  );
}
