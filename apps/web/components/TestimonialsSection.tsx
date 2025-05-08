"use client"

import styles from "./TestimonialsSection.module.css"

const testimonials = [
  {
    name: "María López",
    comment: "Muy buena atención y trabajo impecable. Recomendado 100%.",
    rating: 5
  },
  {
    name: "José Ramírez",
    comment: "Llegó puntual y solucionó todo en el mismo día.",
    rating: 4
  },
  {
    name: "Ana Fernández",
    comment: "Excelente servicio, prolijo y de confianza.",
    rating: 5
  },
]

export default function TestimonialsSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Lo que opinan nuestros clientes</h2>
      <div className={styles.grid}>
        {testimonials.map((t, i) => (
          <div key={i} className={styles.card}>
            <img src={t.avatar} alt={t.name} className={styles.avatar} />
            <p className={styles.comment}>"{t.comment}"</p>
            <div className={styles.rating}>
              {"★".repeat(t.rating)}
              {"☆".repeat(5 - t.rating)}
            </div>
            <p className={styles.name}>— {t.name}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
