"use client"

import React, { useState } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import {
  IoHammer,
  IoFlash,
  IoBrush,
  IoWaterOutline,
  IoColorPalette,
  IoCar,
} from "react-icons/io5"
import styles from "./CategoriesSection.module.css"

const BudgetRequestModal = dynamic(() => import("../components/BudgetRequestModal"), { ssr: false })

const categories = [
  { name: "Albañil", icon: "/icons/icon-albañil-laburandoapp.png", reactIcon: IoHammer },
  { name: "Electricista", icon: "/icons/serviciosicon.png", reactIcon: IoFlash },
  { name: "Pintor", icon: "/icons/servicios-pintor-laburandoapp.png", reactIcon: IoBrush },
  { name: "Plomero", icon: "/icons/servicios-plomero-laburandoapp.png", reactIcon: IoWaterOutline },
  { name: "Vidriero", icon: "/icons/tec-matriculados.png", reactIcon: IoColorPalette },
  { name: "Fletes", icon: "/icons/mudanzas-camion-laburandoapp.png", reactIcon: IoCar },
]

export default function CategoriesSection() {
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const useCustomIcons = true

  const openModal = (category: string) => {
    setSelectedCategory(category)
    setShowModal(true)
  }

  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          
          <div className={styles.grid}>
            {categories.map((category, i) => (
              <div key={i} className={styles.card} onClick={() => openModal(category.name)} style={{ cursor: "pointer" }}>
                <div className={styles.iconWrapper}>
                  {useCustomIcons && category.icon ? (
                    <div className={styles.imageContainer}>
                      <Image
                        src={category.icon}
                        alt={category.name}
                        width={64}
                        height={64}
                        className={`${styles.image} ${styles.jewelEffect}`}
                      />
                    </div>
                  ) : (
                    <div className={styles.reactIconContainer}>
                      {React.createElement(category.reactIcon, {
                        size: 40,
                        color: "#fcd93f",
                      })}
                    </div>
                  )}
                </div>
                <span className={styles.categoryName}>{category.name}</span>
              </div>
            ))}
          </div>

          {/* Botón adicional al final */}
          <div className={styles.ctaContainer}>
            <button className={styles.ctaButton} onClick={() => openModal("")}>
               Nuestros servicios
            </button>
          </div>
        </div>
      </section>

      {showModal && (
        <BudgetRequestModal
          onClose={() => setShowModal(false)}
          selectedCategory={selectedCategory || undefined}
        />
      )}
    </>
  )
}
