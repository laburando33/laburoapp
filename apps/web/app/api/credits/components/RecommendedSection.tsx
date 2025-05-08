"use client"

import styles from "./RecommendedSection.module.css"

const professionals = [
  {
    name: "Carlos Gómez",
    profession: "Electricista matriculado",
    location: "Zona Norte GBA",
    image: "/fotos-pro/recomendado1.png",
  },
  {
    name: "Lucía Martínez",
    profession: "Pintora interior",
    location: "Ciudad de Buenos Aires",
    image: "/fotos-pro/recomendado2.png",
  },
  {
    name: "Juan Pérez",
    profession: "Plomero",
    location: "La Plata",
    image: "/fotos-pro/recomendado3.png",
  },
]

export default function RecommendedSection({ onContact }: { onContact: () => void }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Profesionales Recomendados</h2>
      <div className={styles.grid}>
        {professionals.map((pro, i) => (
          <div key={i} className={styles.card}>
            <img src={pro.image} alt={pro.name} className={styles.photo} />
            <h3 className={styles.name}>{pro.name}</h3>
            <p className={styles.profession}>{pro.profession}</p>
            <p className={styles.location}>{pro.location}</p>
            <button className={styles.button} onClick={onContact}>
              Pedir presupuesto
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
