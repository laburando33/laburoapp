// app/politica-devoluciones/page.tsx
"use client";

import React from "react";
import styles from "../page.module.css";
export default function PoliticaDevoluciones() {
  return (
    <div className={styles.page}>
      
        <section className={styles.legalSection}>
          <h1 className={styles.sectionTitle}>Política de Devoluciones - Laburando App</h1>
          <p><strong>Fecha de entrada en vigencia:</strong> [Fecha]</p>

          <h2 className={styles.subTitle}>Naturaleza del Servicio</h2>
          <p>
            Laburando App vende leads a prestadores de servicio. No garantizamos que los leads resulten en trabajos, ya que solo ofrecemos una herramienta publicitaria para conectar a los prestadores con potenciales clientes.
          </p>
          <p>
            El costo de adquisición de cada lead cubre gastos de publicidad, operación y mantenimiento de la plataforma.
          </p>

          <h2 className={styles.subTitle}>Criterios de Devolución</h2>
          <p>No realizamos devoluciones en dinero bajo ninguna circunstancia.</p>
          <p>Las devoluciones se realizarán exclusivamente en créditos y solo en los siguientes casos:</p>
          <ul>
            <li>Si el lead adquirido corresponde a otro prestador de servicio.</li>
            <li>Si la solicitud corresponde a una ubicación fuera de Argentina.</li>
          </ul>

          <h2 className={styles.subTitle}>Casos No Cubiertos</h2>
          <ul>
            <li>Leads que no resulten en trabajo.</li>
            <li>Falta de respuesta del usuario.</li>
            <li>Datos incompletos o incorrectos sin evidencia de intención fraudulenta.</li>
            <li>Errores del prestador al comprar el lead.</li>
            <li>Vencimiento de créditos.</li>
          </ul>

          <h2 className={styles.subTitle}>Procedimiento de Solicitud</h2>
          <p>
            La revisión debe solicitarse dentro de las 48h de la compra. Laburando evaluará y decidirá si corresponde crédito.
            La decisión no podrá ser apelada.
          </p>

          <h2 className={styles.subTitle}>Créditos Compensados</h2>
          <p>
            No son transferibles ni canjeables por dinero. Tienen validez de [determinar tiempo].
          </p>

          <h2 className={styles.subTitle}>Modificación de la Política</h2>
          <p>
            Laburando App se reserva el derecho de modificar esta política. El uso de la app implica la aceptación de estos términos.
          </p>
        </section>
     
    </div>
  );
}

