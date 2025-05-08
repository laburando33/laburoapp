import DebugCredits from "@/components/DebugCredits";

export default function DebugCreditsPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>🧪 Página de Diagnóstico de Créditos</h1>
      <p>Esto verifica que puedas obtener tu usuario actual y ver cuántos créditos tiene asignados.</p>
      <DebugCredits />
    </main>
  );
}
