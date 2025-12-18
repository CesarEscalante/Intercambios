/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { generarSorteo } from "../utils/sorteo";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/styles.css";

export default function Grupo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grupo, setGrupo] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [nombre, setNombre] = useState("");

  const cargarGrupo = async () => {
    const { data } = await supabase
      .from("grupos")
      .select("*")
      .eq("id", id)
      .single();

    setGrupo(data);
  };

  const cargarParticipantes = async () => {
    const { data } = await supabase
      .from("participantes")
      .select("*")
      .eq("grupo_id", id);

    setParticipantes(data || []);
  };

  const agregar = async () => {
    if (!nombre.trim()) return;

    await supabase.from("participantes").insert({
      grupo_id: id,
      nombre,
      magic_token: crypto.randomUUID(),
    });

    setNombre("");
    cargarParticipantes();
  };

  const sortear = async () => {
    const resultado = generarSorteo(participantes);

    await supabase.from("sorteos").insert(
      resultado.map(r => ({
        ...r,
        grupo_id: id,
      }))
    );

    await supabase.from("grupos").update({ sorteado: true }).eq("id", id);
    alert("🎉 Sorteo realizado");
  };

  const eliminarGrupo = async () => {
    const confirmar = confirm(
      "⚠️ Esto eliminará el grupo, participantes y sorteos.\n¿Seguro?"
    );

    if (!confirmar) return;

    await supabase.from("grupos").delete().eq("id", id);
    navigate("/");
  };

  useEffect(() => {
    cargarGrupo();
    cargarParticipantes();
  });

  if (!grupo) return <p>Cargando...</p>;

  return (
    <div className="page">
      <div className="card">
        <h1>{grupo.nombre}</h1>

        <p className="subtitle">
          Administra participantes y realiza el sorteo
        </p>

        <button
          onClick={eliminarGrupo}
          style={{ color: "red", marginBottom: 20 }}
        >
          🗑️ Eliminar grupo
        </button>

        <h2>Participantes</h2>

        {!grupo.sorteado && (
          <div className="form">
            <input
              placeholder="Nombre del participante"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <button onClick={agregar}>
              Agregar
            </button>
          </div>
        )}

        {participantes.length === 0 ? (
          <p className="empty">
            No hay participantes aún
          </p>
        ) : (
          <ul className="list">
            {participantes.map((p) => (
              <li key={p.id}>
                <div className="groupBtn">
                  {p.nombre}

                  {grupo.sorteado && (
                    <small style={{ display: "block", marginTop: 6 }}>
                      🔗 {window.location.origin}/revelar/{p.magic_token}
                    </small>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!grupo.sorteado && participantes.length >= 3 && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button onClick={sortear}>
              🎲 Realizar sorteo
            </button>
          </div>
        )}
      </div>
    </div>

  );
}
