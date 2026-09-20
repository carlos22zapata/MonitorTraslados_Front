import { useState, useEffect, useRef } from 'react'

const API_BASE = 'http://localhost:5206'

function VendedorDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [vendedores, setVendedores] = useState([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/Traslado/vendedores`)
      .then(res => res.json())
      .then(data => { setVendedores(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const selected = vendedores.find(v => v.coVen === value)
  const displayText = value ? `${selected?.coVen || value} — ${selected?.venDes || ''}` : 'Todos'

  const selectVendedor = (coVen) => {
    onChange(coVen)
    setOpen(false)
  }

  return (
    <div className="flex flex-col relative" ref={ref}>
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Vendedor</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-all duration-200 shadow-sm min-w-[220px]"
      >
        <span className="truncate">{displayText}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100] w-[280px] max-h-[260px] overflow-y-auto">
          <button
            onClick={() => selectVendedor('')}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center gap-2 ${
              !value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${!value ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
            Todos
          </button>

          <div className="border-t border-gray-100 my-1"></div>

          {loading && (
            <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600"></div>
              Cargando...
            </div>
          )}

          {!loading && vendedores.map(v => (
            <button
              key={v.coVen}
              onClick={() => selectVendedor(v.coVen)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center gap-2 ${
                value === v.coVen ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${value === v.coVen ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
              <span className="font-mono text-xs text-gray-500 shrink-0 w-8">{v.coVen}</span>
              <span className="truncate">{v.venDes}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default VendedorDropdown
