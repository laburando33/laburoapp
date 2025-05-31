"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProfessionalsByService } from "./list";
import styles from "../page.module.css";
import { IoCheckmarkCircle } from "react-icons/io5";

interface Profesional {
  professionals: {
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    avatar_url?: string;
    location?: string;
    category: string;
  };
  services: {
    name: string;
  };
}

export default function ProfesionalesPage() {
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [servicio, setServicio] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const servicioParam = searchParams.get("servicio") || "";
  const locationParam = searchParams.get("location") || "";

  useEffect(() => {
    const fetch = async () => {
      if (!servicioParam) return;
      setLoading(true);
      const data = await getProfessionalsByService(servicioParam);
      setProfesionales(data);
      setServicio(servicioParam);
      setLocation(locationParam);
      setLoading(false);
    };
    fetch();
  }, [servicioParam, locationParam]);

  const goToForm = () => {
    router.push(`/solicitar?categoria=${encodeURIComponent(servicio)}&location=${encodeURIComponent(location)}`);
  };

  const filtered = profesionales.filter((item) =>
    location === "" || item.professionals.location?.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.sectionTitle}>Profesionales: {servicio}</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : filtered.length > 0 ? (
        <ul className={styles.servicesGrid}>
          {filtered.map((item) => (
            <li key={item.professionals.user_id} className={styles.serviceItem}>
              <img
                src={item.professionals.avatar_url || "/default-user.png"}
                alt={item.professionals.full_name}
                className={styles.proAvatar}
              />
              <h3>{item.professionals.full_name}</h3>
              <p><strong>Servicio:</strong> {item.services.name}</p>
              <p><strong>Ubicación:</strong> {item.professionals.location}</p>
              <p>⭐ 4.8 (12 reseñas)</p>
              <button className={styles.ctaButton} onClick={goToForm}>Pedir presupuesto</button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div className={styles.modalBox}>
            <h2>No hay profesionales disponibles en {location} para {servicio}</h2>
            <p>Próximamente se sumarán profesionales en esta zona.</p>
            <button className={styles.ctaButton} onClick={() => setShowModal(true)}>
              Ver profesionales relacionados
            </button>
          </div>

          {showModal && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={() => setShowModal(false)}>X</button>
                <div className={styles.serviceItem}>
                  <img
                    src="/default-user.png"
                    alt="Próximamente"
                    className={styles.proAvatar}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <h3>Nombre Profesional</h3>
                    <IoCheckmarkCircle color="#4caf50" title="Verificado" />
                  </div>
                  <p><strong>Servicio:</strong> {servicio}</p>
                  <p><strong>Ubicación:</strong> {location}</p>
                  <p>⭐ 5.0 (25 reseñas)</p>
                  <p>🛠 18 trabajos realizados</p>
                  <blockquote>
                    "Excelente atención y servicio. Puntual y muy profesional."
                  </blockquote>
                  <button className={styles.ctaButton} onClick={goToForm}>Pedir presupuesto</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
