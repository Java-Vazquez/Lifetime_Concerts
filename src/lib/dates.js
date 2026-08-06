// new Date('YYYY-MM-DD') parsea como UTC medianoche; en zonas horarias negativas
// eso corre la fecha un día para atrás. Se arma con componentes locales.
export function parseEventDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatLong(isoDate) {
  return parseEventDate(isoDate).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDayMonth(isoDate) {
  return parseEventDate(isoDate).toLocaleDateString('es-MX', {
    month: 'short',
    day: 'numeric',
  })
}

export function yearOf(isoDate) {
  return isoDate.slice(0, 4)
}
