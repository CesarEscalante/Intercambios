export function generarSorteo(participantes, bloqueos = {}) {
  const maxIntentos = 1000;

  for (let intento = 0; intento < maxIntentos; intento++) {
    const disponibles = [...participantes];
    const resultado = [];
    let valido = true;

    for (const p of participantes) {
      const posibles = disponibles.filter(d =>
        d.id !== p.id &&
        !bloqueos[p.id]?.has(d.id)
      );

      if (posibles.length === 0) {
        valido = false;
        break;
      }

      const elegido =
        posibles[Math.floor(Math.random() * posibles.length)];

      resultado.push({
        participante_id: p.id,
        recibe_id: elegido.id,
      });

      disponibles.splice(disponibles.indexOf(elegido), 1);
    }

    if (valido) return resultado;
  }

  throw new Error("❌ No existe una combinación válida con estas exclusiones");
}