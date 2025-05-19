'use client';

import React, { useState, useEffect } from "react";
import styles from "./IconSlider.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

const services = [
  {
    image: "/icons/seguridad-hogar-servicios-laburandoapp.png",
    title: "Seguridad y Confianza",
    description: "Trabajamos con personas calificadas para garantizar la seguridad de tu hogar.",
  },
  {
    image: "/icons/verificados-servicios-laburandoapp.png",
    title: "Trabajadores verificados",
    description: "Todos nuestros trabajadores pasan por un proceso de verificación para garantizar su calidad.",
  },
  {
    image: "/icons/icon-servicio-verificado-laburandoapp.png",
    title: "Ahorra tiempo",
    description: "Solicita tu presupuesto en minutos y recibe respuestas rápidas y a un click de distancia.",
  },
];

const IconSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      next();
    }, 5000); // cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.carouselSection}>
      <h2 className={styles.sectionTitle}>
        ¿Por qué <strong>nos eligen?</strong>
      </h2>
      <div className={styles.carouselWrapper}>
        <button onClick={prev} className={styles.arrowLeft}>
          <ChevronLeft size={28} />
        </button>
        <div className={styles.carousel}>
          {services.map((service, index) => (
            <div
              key={index}
              className={`${styles.card} ${
                index === currentIndex ? styles.active : styles.inactive
              }`}
            >
              <div className={styles.cardContent}>
                <img src={service.image} alt={service.title} className={styles.icon} />
                <div className={styles.textContent}>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={next} className={styles.arrowRight}>
          <ChevronRight size={28} />
        </button>
      </div>
      <div className={styles.dots}>
        {services.map((_, index) => (
          <span
            key={index}
            className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default IconSlider;
