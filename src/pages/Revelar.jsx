import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSearchParams  } from "react-router-dom";

export default function Revelar() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [resultado, setResultado] = useState(null);
  const [mostrar, setMostrar] = useState(false);
  const [sorteoId, setSorteoId] = useState(null);
  const [grupo, setGrupo]= useState(null);

  useEffect(() => {
    const cargar = async () => {
      const { data: participante } = await supabase
        .from("participantes")
        .select("id, nombre, grupo_id")
        .eq("magic_token", token)
        .single();

      const { data: name } = await supabase
        .from("grupos")
        .select("nombre")
        .eq("id", participante.grupo_id)
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

      setGrupo(name.nombre)

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
            <h1>Hola {resultado.quien}, <br></br>
            👥 Este es el resultado para "{grupo}", <br></br>
            🎁🎅🎄 ¿Listo para descubrir tu santa secreto?</h1>

            <p className="subtitle">
              Recuerda lo siguiente:<br></br>
             👀 1. Presiona el botón para revelar a quién le darás tu regalo<br></br>
             🤫 2. Anote a la persona que se reveló en un lugar seguro sin decirle a nadie<br></br>
             🚪 3. Cierra la aplicación <br></br>
             🏃‍♂️ 5. Corra a comprar el regalo <br></br>
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
              <div className="texto">
                <h2>
                  {resultado.quien}, te toca regalarle a:
                </h2>

                <h1  style={{ marginTop: 12 }}>
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
