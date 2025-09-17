"use client"

import { useState } from "react"
import styles from "./HeroSection.module.css"
import dynamic from "next/dynamic"
import { ArrowRight } from 'lucide-react';


const BudgetRequestModal = dynamic(() => import("../components/BudgetRequestModal"), { ssr: false })

export default function HeroSection() {
  const [showModal, setShowModal] = useState(false)

      return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.imageTextWrapper}>
            <div className={styles.imageContainer}>
              <div className={styles.statusItem}>
                <div className={styles.statusIconWrapper}>
                  <img
                    src="/pintor.png"
                    width={330}
                    height={330}
                    className={styles.statusIcon}
                    alt="Profesionales Destacados"
                  />
                </div>
              </div>
            </div>

            <div className={styles.textContent}>
              <h1 className={styles.heroTitle}>
              ¿Necesitás arreglar tu casa?
              </h1>
              <p className={styles.heroSubtitle}>
              <span>soluciones</span> sin vueltas y a la vuelta!
              </p>
                  <div className={styles.searchSection}>
            <button
              className={styles.ctaModernButtonFull}
              onClick={() => setShowModal(true)}
            >
              Solicitar presupuesto  <span className={styles.iconCircle}>
    <ArrowRight size={14}  />
  </span>
            </button>
          </div>
            </div>
          

      
        </div>
        </div>
      </section>

      {showModal && <BudgetRequestModal onClose={() => setShowModal(false)} />}
    </>
  )
}
