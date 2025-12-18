/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";

export default function CrearGrupo() {
  const [nombre, setNombre] = useState("");
  const [grupos, setGrupos] = useState([]);
  const [password, setPassword] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const navigate = useNavigate();

  const PASSWORD = import.meta.env.VITE_APP_PASSWORD;

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
    if (autorizado) {
      cargarGrupos();
    }
  }, [autorizado]);

  const validarPassword = () => {
    if (password === PASSWORD) {
      setAutorizado(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const crearGrupo = async () => {
    if (!nombre.trim()) return;

    await supabase.from("grupos").insert({ nombre });
    setNombre("");
    cargarGrupos();
  };

  /* 🔒 PANTALLA DE PASSWORD */
  if (!autorizado) {
    return (
      <div className="page">
        <div className="card" style={{ maxWidth: 420 }}>
          <h1>🔐 Acceso</h1>
          <p className="subtitle">
            Ingresa la contraseña para continuar
          </p>

          <div className="form">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={validarPassword}>
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ✅ CONTENIDO NORMAL */
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
          <button onClick={crearGrupo}>
            Crear grupo
          </button>
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
