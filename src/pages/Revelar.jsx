import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSearchParams  } from "react-router-dom";

export default function Revelar() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [resultado, setResultado] = useState(null);
  const [mostrar, setMostrar] = useState(false);
  const [sorteoId, setSorteoId] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      const { data: participante } = await supabase
        .from("participantes")
        .select("id, nombre")
        .eq("magic_token", token)
        .single();

      const { data: sorteo } = await supabase
        .from("sorteos")
        .select(`
          id,
          revelado,
          recibe:recibe_id ( nombre )
        `)
        .eq("participante_id", participante.id)
        .single();

      setResultado({
        quien: participante.nombre,
        recibe: sorteo.recibe.nombre,
        yaRevelado: sorteo.revelado,
      });

      setSorteoId(sorteo.id);

      // Si ya estaba revelado, mostrar directamente
      if (sorteo.revelado) {
        setMostrar(true);
      }
    };

    cargar();
  }, [token]);

  const revelar = async () => {
    setMostrar(true);

    await supabase
      .from("sorteos")
      .update({
        revelado: true,
        revelado_at: new Date().toISOString(),
      })
      .eq("id", sorteoId);
  };

  if (!resultado) return <p>Cargando...</p>;

  return (
    <div className="page">
      <div className="card" style={{ textAlign: "center" }}>
        {!mostrar ? (
          <>
            <h1>🎁🎅🎄 ¿Listo para descubrir tu santa secreto?</h1>

            <p className="subtitle">
             👀 1. Presiona el botón para revelar a quién le darás tu regalo
             🤫 2. Anote a la persona que se reveló en un lugar seguro sin decirle a nadie
             🚪 3. Cierra la aplicación 
             🏃‍♂️ 5. Corra a comprar el regalo 
            </p>

            <button
              onClick={revelar}
              style={{
                marginTop: 20,
                padding: "12px 24px",
                borderRadius: 10,
                border: "none",
                background: "#4f46e5",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Revelar
            </button>
          </>
        ) : (
          <>
            {resultado.yaRevelado && (
              <p
                className="empty"
                style={{ marginTop: 16 }}
              >
                👁️🕵️🔒 Este resultado ya fue revelado anteriormente. 
                😎✨🛡️ Recuerda guardar bien tus santa secreto.
              </p>
            )}
            {!resultado.yaRevelado && (
              <div>
                <h2>
                  {resultado.quien}, te toca regalarle a:
                </h2>

                <h1 style={{ marginTop: 12 }}>
                  🎉🎉🎉 {resultado.recibe} 🎉🎉🎉
                </h1>

                <h3>
                  🔍 Recuerda guardar este resultado en un lugar seguro.
                </h3>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
