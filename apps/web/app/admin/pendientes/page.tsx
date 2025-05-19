import SolicitudesSinDesbloquear from "@/components/admin/SolicitudesSinDesbloquear";
import SolicitudesDesbloqueadas from "@/components/admin/SolicitudesDesbloqueadas";

export default function PendientesPage() {
  return (
    <div className="grid grid-cols-2 gap-4 p-5">
      <div>
        <h2 className="text-xl font-bold mb-3">🔒 Solicitudes Sin Desbloquear</h2>
        <SolicitudesSinDesbloquear />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-3">🔓 Solicitudes Desbloqueadas</h2>
        <SolicitudesDesbloqueadas />
      </div>
    </div>
  );
}
