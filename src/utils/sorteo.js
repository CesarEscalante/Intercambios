export function generarSorteo(participantes) {
    let asignados;
  
    do {
      asignados = [...participantes].sort(() => Math.random() - 0.5);
    } while (
      participantes.some((p, i) => p.id === asignados[i].id)
    );
  
    return participantes.map((p, i) => ({
      participante_id: p.id,
      recibe_id: asignados[i].id,
    }));
}
  