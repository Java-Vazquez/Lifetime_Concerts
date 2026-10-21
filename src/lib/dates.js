// new Date('YYYY-MM-DD') parsea como UTC medianoche; en zonas horarias negativas
// eso corre la fecha un día para atrás. Se arma con componentes locales.
export function parseEventDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatLong(isoDate, locale = 'es-MX') {
  return parseEventDate(isoDate).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDayMonth(isoDate, locale = 'es-MX') {
  return parseEventDate(isoDate).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  })
}

export function yearOf(isoDate) {
  return isoDate.slice(0, 4)
}
