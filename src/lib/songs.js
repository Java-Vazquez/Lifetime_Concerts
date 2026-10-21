// Qué cuenta como "canción tocada". Única fuente de verdad: la usan tanto el
// setlist de cada concierto como las estadísticas, así cualquier show que se
// agregue después queda filtrado igual sin tocar nada más.
//
// setlist.fm no se equivoca al registrar esto: marca con `tape` la música
// grabada que suena por los altavoces (intros, outros, caminatas al escenario)
// y anota partes del show que no son temas. Nada de eso lo tocó la banda.

// "Drum Solo", "Bass Solo", "Intro", "Jam"… los repite cualquier banda y
// ensucian tanto el setlist como el ranking de canciones.
const PLACEHOLDER = /^(?:\w+\s+)?(?:solo|jam)$|^(?:intro|outro|interlude|intermission)$/i

export function isPerformedSong(song) {
  const name = song?.name?.trim()
  if (!name) return false
  if (song.is_tape ?? song.isTape) return false
  return !PLACEHOLDER.test(name)
}

// Lo que la banda tocó, en orden.
export function performedSongs(songs = []) {
  return songs.filter(isPerformedSong).sort((a, b) => a.position - b.position)
}
