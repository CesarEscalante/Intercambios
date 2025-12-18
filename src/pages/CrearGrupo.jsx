import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";


export default function CrearGrupo() {
  const [nombre, setNombre] = useState("");
  const [grupos, setGrupos] = useState([]);
  const navigate = useNavigate();

  const cargarGrupos = async () => {
    const { data, error } = await supabase
      .from("grupos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando grupos:", error);
      return;
    }

    setGrupos(data || []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarGrupos();
  }, []);

  const crearGrupo = async () => {
    if (!nombre.trim()) return;

    await supabase.from("grupos").insert({ nombre });
    setNombre("");
    cargarGrupos(); // refresca lista
  };

  return (
    <div className="page">
      <div className="card">
        <h1>🎁 Intercambios</h1>
        <p className="subtitle">
          Crea y administra tus grupos de intercambio
        </p>

        <div className="form">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del grupo"
          />
          <button onClick={crearGrupo}>Crear grupo</button>
        </div>

        <hr />

        <h2>Grupos creados</h2>

        {grupos.length === 0 ? (
          <p className="empty">No hay grupos aún</p>
        ) : (
          <ul className="list">
            {grupos.map((g) => (
              <li key={g.id}>
                <button
                  className="groupBtn"
                  onClick={() => navigate(`/grupo?id=${g.id}`)}
                >
                  🎁 {g.nombre}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

  );
}
