"use client";
import Image from 'next/image';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IoSearch,
  IoCashOutline,
  IoScaleOutline,
  IoCheckmarkCircleOutline,
  IoHammer,
  IoSnow,
  IoBrush,
  IoFlash,
  IoLayers,
  IoRainy,
  IoColorPalette,
  IoApps,
  IoWifi,
  IoCar,
  IoFlame,
  IoWater,
  IoWaterOutline
} from "react-icons/io5";
import styles from "./page.module.css";
import { supabase } from "../lib/supabase-web";
import OneSignal from "react-onesignal";
import CategoriesSection from "@/components/CategoriesSection";
import HeroSection from "@/components/HeroSection";
import Modal from "@/components/Modal";
import HowItWorks from "@/components/HowItWorks";
import ServiceCarousel from "@/components/ServiceCarousel";
import BudgetRequestModal from "@/components/BudgetRequestModal";
import RecommendedSection from "@/components/RecommendedSection";
import TestimonialsSection from "@/components/TestimonialsSection";
export default function HomePage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <HeroSection />
        
        <ServiceCarousel />
        <CategoriesSection />
        <TestimonialsSection />
        <HowItWorks />
      </main>
    </div>
  );
}
