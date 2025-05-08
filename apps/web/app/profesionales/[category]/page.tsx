'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getProfessionalsByService } from '../list'
import styles from './page.module.css'

export default function ProfesionalesPorCategoria() {
  const { category } = useParams()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const servicio = decodeURIComponent(category as string)
      const data = await getProfessionalsByService(servicio)
      setResults(data)
      setLoading(false)
    }
    if (category) fetchData()
  }, [category])

  if (loading) return <p style={{ padding: 20 }}>Cargando...</p>

  if (!results.length) return <p style={{ padding: 20 }}>No se encontraron profesionales para "{category}"</p>

  return (
    <div className={styles.page}>
      <h1 className={styles.sectionTitle}>Profesionales para "{category}"</h1>
      <div className={styles.resultsGrid}>
        {results.map((item, idx) => {
          const pro = item.professionals
          return (
            <div key={idx} className={styles.proCard}>
              <img
                src={pro.avatar_url || '/default-user.png'}
                alt={pro.full_name}
                className={styles.proAvatar}
              />
              <h3>{pro.full_name}</h3>
              <p><strong>Ubicación:</strong> {pro.location || 'No especificada'}</p>
              <p><strong>Email:</strong> {pro.email}</p>
              <p><strong>Teléfono:</strong> {pro.phone}</p>
              <p><strong>Categoría:</strong> {pro.category}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
