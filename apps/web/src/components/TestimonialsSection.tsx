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
    comment: "Excelente servicio, prolijo, amable ... y de confianza.",
    rating: 5
  },
]

export default function TestimonialsSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Los vecinos andan diciendo...</h2>
      <div className={styles.grid}>
        {testimonials.map((t, i) => (
          <div key={i} className={styles.card}>
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
