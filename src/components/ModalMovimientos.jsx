import { useState, useEffect, useCallback, useRef } from 'react'
import VendedorDropdown from './VendedorDropdown'
import ModalDetalleDocumento from './ModalDetalleDocumento'

const API_BASE = 'http://localhost:5206'

const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function formatDateISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function CalendarDropdown({ value, onChange, label }) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d)
  })
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const selected = value ? value.split('-').map(Number) : null

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selectDay = (day) => {
    const iso = formatDateISO(new Date(year, month, day))
    onChange(iso)
    setOpen(false)
  }

  const isToday = (day) => {
    const now = new Date()
    return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day
  }

  const isSelected = (day) => selected && selected[0] === year && selected[1] === month + 1 && selected[2] === day

  return (
    <div className="flex flex-col relative" ref={ref}>
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-700 hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-all duration-200 shadow-sm"
      >
        <span>{formatDisplay(value)}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-[100] w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-bold text-gray-800">{MESES[month]} {year}</span>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DIAS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => (
              <div key={i} className="flex items-center justify-center">
                {day !== null ? (
                  <button
                    onClick={() => selectDay(day)}
                    className={`w-8 h-8 rounded-full text-xs font-semibold transition-all duration-150 ${
                      isSelected(day)
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : isToday(day)
                          ? 'bg-blue-50 text-blue-600 font-bold ring-1 ring-blue-200'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {day}
                  </button>
                ) : <div />}
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-center">
            <button
              onClick={() => { onChange(formatDateISO(new Date())); setOpen(false) }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ModalMovimientos({ coArt: initialCoArt, artDes: initialArtDes, onClose }) {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [docDetalle, setDocDetalle] = useState(null)
  const [sortField, setSortField] = useState('fecha')
  const [sortDir, setSortDir] = useState('desc')
  const [internalCoArt, setInternalCoArt] = useState(initialCoArt)
  const [internalArtDes, setInternalArtDes] = useState(initialArtDes)

  const today = new Date()
  const [fechaDesde, setFechaDesde] = useState(formatDateISO(today))
  const [fechaHasta, setFechaHasta] = useState(formatDateISO(today))
  const [coVen, setCoVen] = useState('')

  const fetchData = useCallback((desde, hasta, ven) => {
    if (!internalCoArt) return
    setLoading(true)
    setError(null)
    let url = `${API_BASE}/api/Traslado/movimientos-articulo/${encodeURIComponent(internalCoArt)}?fechaDesde=${desde}&fechaHasta=${hasta}T23:59:59`
    if (ven) url += `&coVen=${encodeURIComponent(ven)}`
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`)
        return res.json()
      })
      .then(data => { setMovimientos(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [internalCoArt])

  useEffect(() => {
    fetchData(fechaDesde, fechaHasta, coVen)
  }, [internalCoArt, fechaDesde, fechaHasta, coVen, fetchData])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sortedMovimientos = [...movimientos].sort((a, b) => {
    let valA = a[sortField]
    let valB = b[sortField]
    if (sortField === 'fecha') {
      valA = new Date(valA).getTime()
      valB = new Date(valB).getTime()
    } else if (sortField === 'movNum' || sortField === 'cantidad') {
      valA = Number(valA)
      valB = Number(valB)
    } else {
      valA = (valA || '').toString().toLowerCase()
      valB = (valB || '').toString().toLowerCase()
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <svg className="w-3 h-3 ml-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
    return sortDir === 'asc'
      ? <svg className="w-3 h-3 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
      : <svg className="w-3 h-3 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
  }

  const getEstiloTipo = (tipo) => {
    switch (tipo) {
      case 'Entrada': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '↓', dot: 'bg-emerald-500' }
      case 'Salida': return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: '↑', dot: 'bg-rose-500' }
      case 'Devolución': return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', icon: '↩', dot: 'bg-sky-500' }
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: '?', dot: 'bg-gray-500' }
    }
  }

  const totalEntradas = movimientos.filter(m => m.cantidad > 0).reduce((sum, m) => sum + m.cantidad, 0)
  const totalSalidas = movimientos.filter(m => m.cantidad < 0).reduce((sum, m) => sum + Math.abs(m.cantidad), 0)
  const saldo = totalEntradas - totalSalidas

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-visible">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[88vh] flex flex-col border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Movimientos del artículo</h2>
            <p className="text-blue-200 text-sm mt-0.5">
              <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{internalCoArt}</span>
              <span className="mx-1.5">—</span>
              <span className="text-blue-100">{internalArtDes}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filtros + Resumen */}
        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100 relative z-20">
          <div className="flex items-end gap-4 mb-4">
            <CalendarDropdown value={fechaDesde} onChange={setFechaDesde} label="Desde" />
            <CalendarDropdown value={fechaHasta} onChange={setFechaHasta} label="Hasta" />
            <VendedorDropdown value={coVen} onChange={setCoVen} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Entradas</div>
                <div className="text-xl font-bold text-emerald-600">{totalEntradas}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-rose-100 px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Salidas</div>
                <div className="text-xl font-bold text-rose-600">{totalSalidas}</div>
              </div>
            </div>

            <div className={`bg-white rounded-xl border px-4 py-3 flex items-center gap-3 shadow-sm ${saldo >= 0 ? 'border-emerald-100' : 'border-rose-100'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${saldo >= 0 ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                <span className={`text-lg font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{saldo >= 0 ? '+' : ''}</span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Saldo</div>
                <div className={`text-xl font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{saldo}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <span className="mt-4 text-sm text-gray-400 font-medium">Cargando movimientos...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-rose-500 font-medium">Error al cargar: {error}</p>
            </div>
          )}

          {!loading && !error && movimientos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
              <p className="text-sm text-gray-400 font-medium">No hay movimientos en el rango seleccionado</p>
            </div>
          )}

          {!loading && !error && movimientos.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th onClick={() => handleSort('tipo')} className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none">Tipo <SortIcon field="tipo" /></th>
                  <th onClick={() => handleSort('motivo')} className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none">Motivo <SortIcon field="motivo" /></th>
                  <th onClick={() => handleSort('movNum')} className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none">Documento <SortIcon field="movNum" /></th>
                  <th onClick={() => handleSort('cantidad')} className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none">Cantidad <SortIcon field="cantidad" /></th>
                  <th onClick={() => handleSort('fecha')} className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none">Fecha / Hora <SortIcon field="fecha" /></th>
                  <th onClick={() => handleSort('responsable')} className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none">Responsable <SortIcon field="responsable" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedMovimientos.map((mov, idx) => {
                  const estilo = getEstiloTipo(mov.tipo)
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${estilo.bg} ${estilo.text} border ${estilo.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${estilo.dot}`}></span>
                          {mov.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs font-medium text-gray-600">{mov.motivo || '-'}</td>
                      <td
                        className="px-6 py-3 font-mono text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                        onClick={() => setDocDetalle({ num: mov.movNum, tipo: mov.tipo })}
                      >#{mov.movNum}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center font-bold text-sm ${mov.cantidad > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {mov.cantidad > 0 ? '+' : ''}{mov.cantidad}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-xs">{new Date(mov.fecha).toLocaleString('es-VE')}</td>
                      <td className="px-6 py-3 text-gray-700 text-xs font-medium">{mov.responsable || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {docDetalle && (
        <ModalDetalleDocumento
          numDoc={docDetalle.num}
          tipo={docDetalle.tipo}
          onClose={() => setDocDetalle(null)}
          onArticuloClick={(coArt, artDes) => {
            setDocDetalle(null)
            setInternalCoArt(coArt)
            setInternalArtDes(artDes)
          }}
        />
      )}
    </div>
  )
}

export default ModalMovimientos
