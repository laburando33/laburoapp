"use client"

import styles from "./ServiceCarousel.module.css"

const services = [
  {
    title: "Servicio de Electricista",
    subtitle: "-Seba, elige LaburandoApp y no falla en su oficio.",
    image: "/servicio-electricista-laburandoapp.jpg",
    action: "Solicitar presupuesto"
  },
  {
    title: "Servicio de pintura",
    subtitle: "-Marcos es un pintor con todas las letras.",
    image: "/servicios-pintor-laburandoapp.jpg",
    action: "Solicitar presupuesto"
  },
  {
    title: "Servicio de plomeria",
    subtitle: "-Juan  hace mas de 10 años eligio la plomeria.",
    image: "/plomero.png",
    action: "Solicitar presupuesto"
  },
  {
    title: "Mudanzas",
    subtitle: "-Damian elige LaburandoApp y le va de 10.",
    image: "/servicios-mudanza-laburandoapp.png",
    action: "Solicitar presupuesto"
  }

]

export default function ServiceCarousel() {
  return (
    <section className={styles.carouselSection}>
        <h2 className={styles.sectionTitle}>Solicita desde la <strong>comodidad de tu hogar</strong> en pocos minutos.</h2>
        
      <div className={styles.carousel}>
        {services.map((service, index) => (
          <div key={index} className={styles.card}>
            <img src={service.image} alt={service.title} alt={service.subtitle} className={styles.image} />
            <div className={styles.info}>
              <h3>{service.title}</h3>
              <p>{service.subtitle}</p>
              <button className={styles.action}>{service.action}</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
