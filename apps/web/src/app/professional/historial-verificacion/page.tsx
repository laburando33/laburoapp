import useMiHistorial from "@hooks/useMiHistorial";

export default function HistorialVerificacion() {
  const { data, loading } = useMiHistorial();

  if (loading) return <p>Cargando…</p>;
  if (data.length === 0) return <p>No hay eventos de verificación.</p>;

  return (
    <section>
      <h1 className="text-xl font-bold mb-4">Historial de verificación</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Fecha</th>
            <th>Estado</th>
            <th>Comentario</th>
            <th>Archivo(s)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-t">
              <td>{new Date(row.verified_at).toLocaleDateString()}</td>
              <td>{row.status}</td>
              <td>{row.comentario ?? "—"}</td>
              <td>
                {row.trabajos_url?.map((u) => (
                  <a
                    key={u}
                    href={u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline mr-2"
                  >
                    archivo
                  </a>
                )) || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
