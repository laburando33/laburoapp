"use client"

import styles from "./ServiceCarousel.module.css"

const services = [
  {
    title: "Servicio de Electricista",
    image: "/servicio-electricista-laburandoapp.jpg",
    action: "Solicitar presupuesto"
  },
  {
    title: "Servicio de pintura",
    image: "/servicios-pintor-laburandoapp.jpg",
    action: "Solicitar presupuesto"
  },
  {
    title: "Servicio de plomeria",
    image: "/plomero.png",
    action: "Solicitar presupuesto"
  },
  {
    title: "Mudanzas",
    image: "/plomero.png",
    action: "Solicitar presupuesto"
  }

]

export default function ServiceCarousel() {
  return (
    <section className={styles.carouselSection}>
        <h2 className={styles.sectionTitle}>Los mas solicitados</h2>
      <div className={styles.carousel}>
        {services.map((service, index) => (
          <div key={index} className={styles.card}>
            <img src={service.image} alt={service.title} className={styles.image} />
            <div className={styles.info}>
              <h3>{service.title}</h3>
              <button className={styles.action}>{service.action}</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
