/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { generarSorteo } from "../utils/sorteo";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/styles.css";

export default function Grupo() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id")
  const navigate = useNavigate();
  const [grupo, setGrupo] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [sorteos, setSorteos] = useState([]);

  const cargarGrupo = async () => {
    const { data } = await supabase
      .from("grupos")
      .select("*")
      .eq("id", id)
      .single();

    setGrupo(data);
  };

  const cargarSorteos = async () => {
    const { data, error } = await supabase
      .from("sorteos")
      .select("participante_id, revelado")
      .eq("grupo_id", id);

    if (error) {
      console.error(error);
      return;
    }

    setSorteos(data || []);
  };


  const cargarParticipantes = async () => {
    const { data } = await supabase
      .from("participantes")
      .select(`*`)
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
    cargarGrupo();
    cargarParticipantes();
  };

  const eliminarGrupo = async () => {
    const confirmar = confirm(
      "⚠️ Esto eliminará el grupo, participantes y sorteos.\n¿Seguro?"
    );

    if (!confirmar) return;

    await supabase.from("grupos").delete().eq("id", id);
    navigate("/");
  };

  const volver = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    cargarGrupo();
    cargarParticipantes();
    cargarSorteos();
  }, [id]);

  if (!grupo) return <p>Cargando...</p>;

  return (
    <div className="page">
      <div className="card">
        <h1>{grupo.nombre}</h1>

        <p className="subtitle">
          Administra participantes y realiza el sorteo
        </p>

        <div style={{justifyContent:"center", display:"flex"}}>
          <button
            onClick={volver}
            style={{ color: "white", marginBottom: 20, marginRight: 50 }}
          >
            ← Volver
          </button>

          <button
            onClick={eliminarGrupo}
            style={{ color: "red", marginBottom: 20 }}
          >
            🗑️ Eliminar grupo
          </button>
        </div>

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
            {console.log(participantes)}
            {participantes.map((p) => {
              const sorteo = sorteos.find(
                (s) => s.participante_id === p.id
              );

              const yaRevelado = sorteo?.revelado;
              return (

                <li key={p.id}>
                  <div className="list">
                    <h3 className="texto">{p.nombre}</h3>
                    {grupo.sorteado && (
                      <>
                        <p className="texto">
                          🔗 <a href={window.location.origin + "/revelar?token=" + p.magic_token}>Santa secreto</a>
                        </p>
                        <p className="texto">
                          {yaRevelado ? "✅ Revelado" : "⏳ Pendiente"}
                        </p>
                      </>
                    )}
                  </div>
                  <hr />

                </li>
              );
            }
            )}
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
