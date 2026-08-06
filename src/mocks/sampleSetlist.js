// Forma de datos normalizada que devuelve la Edge Function "fetch-setlist",
// tanto en modo mock como cuando llama de verdad a la API de setlist.fm.
export const sampleSetlists = [
  {
    setlistfmId: '63de4613',
    artistName: 'Radiohead',
    venueName: 'Estadio Vélez Sarsfield',
    city: 'Buenos Aires',
    country: 'Argentina',
    eventDate: '2018-03-20',
    songs: [
      { position: 1, name: 'Daydreaming', info: null, isTape: false },
      { position: 2, name: '15 Step', info: null, isTape: false },
      { position: 3, name: 'Ful Stop', info: null, isTape: false },
      { position: 4, name: 'Airbag', info: null, isTape: false },
      { position: 5, name: 'Bloom', info: null, isTape: false },
      { position: 6, name: 'Karma Police', info: null, isTape: false },
      { position: 7, name: 'Idioteque', info: null, isTape: false },
      { position: 8, name: 'Paranoid Android', info: null, isTape: false },
      { position: 9, name: 'Street Spirit (Fade Out)', info: 'encore', isTape: false },
    ],
  },
]

export function findMockSetlist({ artistName }) {
  const needle = (artistName || '').trim().toLowerCase()
  if (!needle) return sampleSetlists
  return sampleSetlists.filter((s) => s.artistName.toLowerCase().includes(needle))
}
