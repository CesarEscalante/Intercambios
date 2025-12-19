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
  const [exclusiones, setExclusiones] = useState([]);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");

  const [grupo, setGrupo] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [sorteos, setSorteos] = useState([]);

  const cargarExclusiones = async () => {
    const { data } = await supabase
      .from("exclusiones")
      .select(`
        id,
        from_participante,
        to_participante
      `)
      .eq("grupo_id", id);

    setExclusiones(data);
  };


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
    // 1️⃣ Cargar exclusiones del grupo
    const { data: exclusiones, error } = await supabase
      .from("exclusiones")
      .select("from_participante, to_participante")
      .eq("grupo_id", id);

    if (error) {
      alert("Error cargando exclusiones");
      return;
    }

    // 2️⃣ Generar mapa de bloqueos
    const bloqueos = {};
    exclusiones.forEach(e => {
      if (!bloqueos[e.from_participante]) {
        bloqueos[e.from_participante] = new Set();
      }
      bloqueos[e.from_participante].add(e.to_participante);
    });

    // 3️⃣ Generar sorteo respetando exclusiones
    let resultado;
    try {
      resultado = generarSorteo(participantes, bloqueos);
    } catch (err) {
      alert(err.message);
      return;
    }

    console.log(resultado)
    // 4️⃣ Guardar sorteo
    await supabase.from("sorteos").insert(
      resultado.map(r => ({
        ...r,
        grupo_id: id,
      }))
    );

    await supabase.from("grupos").update({ sorteado: true }).eq("id", id);
    alert("🎉 Sorteo realizado con exclusiones");
    cargarGrupo();
    cargarParticipantes();
  };

  const eliminarGrupo = async () => {
    const confirmar = confirm(
      "⚠️ Esto eliminará el grupo, participantes y sorteos.\n¿Seguro?"
    );

    if (!confirmar) return;

    await supabase.from("grupos").delete().eq("id", id);
    await supabase.from("exclusiones").delete().eq("grupo_id", id);
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
    cargarExclusiones();
  }, [id]);

  const agregarExclusion = async () => {
    if (!fromId || !toId || fromId === toId) return;

    console.log(toId, fromId);
    await supabase.from("exclusiones").insert([
      { grupo_id: id, from_participante: fromId, to_participante: toId, created_at: new Date().toISOString() },
      { grupo_id: id, from_participante: toId, to_participante: fromId, created_at: new Date().toISOString() }
    ]);

    setFromId("");
    setToId("");
    cargarExclusiones();
  };

  const eliminarExclusion = async (exclusionId) => {
    await supabase.from("exclusiones").delete().eq("id", exclusionId);
    cargarExclusiones();
  };

  const eliminarParticipante = async (eliminado) => {
    await supabase.from("participantes").delete().eq("id", eliminado);
    cargarParticipantes();
  }

  if (!grupo) return <p>Cargando...</p>;

  return (
    <div className="page">
      <div className="card">
        <h1>{grupo.nombre}</h1>

        <p className="subtitle">
          Administra participantes y realiza el sorteo
        </p>

        <div style={{ justifyContent: "center", display: "flex" }}>
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
            {participantes.map((p) => {
              const sorteo = sorteos.find(
                (s) => s.participante_id === p.id
              );

              const yaRevelado = sorteo?.revelado;
              return (
                <li key={p.id}>
                  <div className="list" >
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
                    {!grupo.sorteado && (
                      <div style={{ marginTop: 2, textAlign: "center" }}>
                        <button onClick={() => eliminarParticipante(p.id)}>❌ Eliminar</button>
                      </div>
                    )}
                  </div>
                  <hr />

                </li>
              );
            }
            )}
          </ul>
        )}

        <h2>Exclusiones</h2>
        {!grupo.sorteado && participantes.length >= 2 && (
          <>
            <div className="form" style={{ gap: 8 }}>
              <select value={fromId} onChange={e => setFromId(e.target.value)}>
                <option value="">Quién NO regala</option>
                {participantes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>

              <select value={toId} onChange={e => setToId(e.target.value)}>
                <option value="">A quién</option>
                {participantes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>

              <button onClick={agregarExclusion}>➕ Agregar</button>
            </div>
          </>
        )
        }
        {exclusiones.length === 0 ? (
          <p className="empty">No hay exclusiones</p>
        ) : (
          <ul className="list">
            {exclusiones.map(e => {
              const from = participantes.find(p => p.id == e.from_participante);
              const to = participantes.find(p => p.id == e.to_participante);

              return (
                <li key={e.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="texto">
                    🚫 {from?.nombre} → {to?.nombre}
                  </span>
                  {!grupo.sorteado && (<button onClick={() => eliminarExclusion(e.id)}>❌ Eliminar</button>)}
                </li>
              );
            })}
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
