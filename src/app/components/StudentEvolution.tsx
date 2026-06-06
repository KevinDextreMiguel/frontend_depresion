import React, { useEffect, useState } from "react";
import { fetchStudentEvolution } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { isAuthenticated, getAccessToken } from "@/lib/auth";
import { toast } from "sonner";

type Point = {
  fecha: string;
  puntaje: number;
  nivel_riesgo: string;
  alerta_suicidio: boolean;
};

export function StudentEvolution({ onBack }: { onBack: () => void }) {
  const [series, setSeries] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated()) {
        toast.error("Debes iniciar sesión para ver tu evolución");
        return;
      }

      setLoading(true);
      try {
        const token = getAccessToken();
        const data = await fetchStudentEvolution(token || "");
        // normalize dates to readable strings
        const normalized = (data || []).map((p: any) => ({
          fecha: new Date(p.fecha).toLocaleDateString(),
          puntaje: p.puntaje,
          nivel_riesgo: p.nivel_riesgo,
          alerta_suicidio: p.alerta_suicidio,
        }));
        setSeries(normalized);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "No se pudo cargar la evolución");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Mi evolución</h2>
        <button className="btn-ghost" onClick={onBack}>Volver</button>
      </div>

      {loading && <p>Cargando...</p>}

      {!loading && series.length === 0 && <p>No hay evaluaciones registradas.</p>}

      {!loading && series.length > 0 && (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="puntaje" stroke="#8884d8" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {series.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Detalles</h3>
          <ul className="space-y-2">
            {series.map((s, idx) => (
              <li key={idx} className="p-2 border rounded">
                <strong>{s.fecha}</strong> — Puntaje: {s.puntaje} — Nivel: {s.nivel_riesgo}{' '}
                {s.alerta_suicidio && <span className="text-rose-600">(Alerta suicidio)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default StudentEvolution;
