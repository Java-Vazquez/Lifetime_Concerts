// Qué cuenta como parte del show. Única fuente de verdad: la usan tanto el
// setlist de cada concierto como las estadísticas, así cualquier show que se
// agregue después queda filtrado igual sin tocar nada más.
//
// El criterio es uno solo: se excluye lo pregrabado. setlist.fm marca con
// `tape` la música que sonó por los altavoces sin que la banda la tocara
// (intros, outros, caminatas al escenario).
//
// Lo que la banda sí ejecutó se conserva, aunque no sea una canción con
// nombre propio: los solos de batería o guitarra son parte del show.
//
// Ojo al leer los datos: un mismo título puede aparecer dos veces, una como
// pista y otra tocada en vivo. Rammstein abrió con una grabación de
// "Deutschland" y después la tocó; se conserva la segunda.

export function isPerformedSong(song) {
  if (!song?.name?.trim()) return false
  return !(song.is_tape ?? song.isTape)
}

// Lo que sonó en vivo, en orden.
export function performedSongs(songs = []) {
  return songs.filter(isPerformedSong).sort((a, b) => a.position - b.position)
}
