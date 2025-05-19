// page.tsx
"use client";
import { Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import ServiceCarousel from "@/components/ServiceCarousel";
import IconSlider from "@/components/IconSlider";
import TestimonialsSection from "@/components/TestimonialsSection";
import HowItWorks from "@/components/HowItWorks";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Suspense fallback={<p>🔄 Cargando...</p>}>
          <HeroSection />
          <CategoriesSection />
          <ServiceCarousel />
          <IconSlider />
          <TestimonialsSection />
          <HowItWorks />
  

        </Suspense>
      </main>
    </div>
  );
}
