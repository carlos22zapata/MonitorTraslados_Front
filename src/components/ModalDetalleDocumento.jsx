import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:5206'

function ModalDetalleDocumento({ numDoc, tipo, onClose, onArticuloClick }) {
  const [detalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!numDoc || !tipo) return
    setLoading(true)
    setError(null)

    const endpoint = tipo === 'Entrada'
      ? `${API_BASE}/api/Traslado/traslado/${numDoc}`
      : tipo === 'Salida'
        ? `${API_BASE}/api/Traslado/factura/${numDoc}`
        : `${API_BASE}/api/Traslado/devolucion/${numDoc}`

    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`)
        return res.json()
      })
      .then(data => { setDetalle(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [numDoc, tipo])

  const getTitulo = () => {
    switch (tipo) {
      case 'Entrada': return 'Traslado'
      case 'Salida': return 'Factura de Venta'
      case 'Devolución': return 'Devolución de Cliente'
      default: return 'Documento'
    }
  }

  const getHeaderGradient = () => {
    switch (tipo) {
      case 'Entrada': return 'from-emerald-600 via-teal-600 to-teal-700'
      case 'Salida': return 'from-rose-600 via-pink-600 to-pink-700'
      case 'Devolución': return 'from-sky-600 via-blue-600 to-blue-700'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  const InfoRow = ({ label, children }) => (
    <div className="flex items-start py-3 border-b border-gray-200 last:border-b-0 px-1">
      <div className="w-40 shrink-0 text-[11px] font-bold text-gray-400 uppercase tracking-wider pt-0.5">{label}</div>
      <div className="text-sm text-gray-800 font-medium">{children}</div>
    </div>
  )

  const isTraslado = tipo === 'Entrada'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getHeaderGradient()} px-6 py-5 flex items-center justify-between rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {isTraslado ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              ) : tipo === 'Salida' ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{getTitulo()}</h2>
              <p className="text-white/70 text-xs font-mono mt-0.5">#{numDoc}</p>
            </div>
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

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
              <span className="mt-4 text-sm text-gray-400 font-medium">Cargando detalle...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-rose-500 font-medium">Error: {error}</p>
            </div>
          )}

          {!loading && !error && detalle && (
            <div className="p-6">
              {/* Encabezado */}
              <div className="bg-gray-50 rounded-xl px-5 py-2 mb-6 border border-gray-200">
                {isTraslado ? (
                  <>
                    <InfoRow label="Almacén Origen">
                      <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded mr-2">{detalle.almOrig}</span>
                      {detalle.almOrigDes}
                    </InfoRow>
                    <InfoRow label="Almacén Destino">
                      <span className="font-mono text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded mr-2">{detalle.almDest}</span>
                      {detalle.almDestDes}
                    </InfoRow>
                    <InfoRow label="Fecha">
                      {new Date(detalle.fecha).toLocaleString('es-VE')}
                    </InfoRow>
                    <InfoRow label="Confirmado">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        detalle.confirmado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${detalle.confirmado ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {detalle.confirmado ? 'Sí' : 'No'}
                      </span>
                    </InfoRow>
                    <InfoRow label="Motivo">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{detalle.motivoGlo || '-'}</span>
                    </InfoRow>
                    {detalle.comentario && (
                      <InfoRow label="Comentario">{detalle.comentario}</InfoRow>
                    )}
                  </>
                ) : (
                  <>
                    <InfoRow label="Cliente">
                      <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded mr-2">{detalle.coCli}</span>
                      {detalle.cliente}
                    </InfoRow>
                    <InfoRow label="Vendedor">
                      <span className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded mr-2">{detalle.coVen}</span>
                      {detalle.vendedor}
                    </InfoRow>
                    <InfoRow label="Fecha">
                      {new Date(detalle.fechaEmis).toLocaleDateString('es-VE')}
                    </InfoRow>
                    {detalle.comentario && (
                      <InfoRow label="Comentario">{detalle.comentario}</InfoRow>
                    )}
                  </>
                )}
              </div>

              {/* Tabla de items */}
              <div className={`bg-gradient-to-r ${getHeaderGradient()} text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-t-xl text-center`}>Productos</div>
              <div className="border border-gray-200 border-t-0 rounded-b-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">#</th>
                      <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">Código</th>
                      <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">Nombre</th>
                      <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Cantidad</th>
                      {!isTraslado && (
                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Precio</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.items?.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 text-xs">{item.rengNum}</td>
                        <td
                          className={`px-4 py-3 font-mono text-xs font-semibold ${isTraslado && onArticuloClick ? 'text-blue-600 hover:text-blue-800 cursor-pointer hover:underline' : 'text-gray-700'}`}
                          onClick={() => isTraslado && onArticuloClick && onArticuloClick(item.coArt, item.artDes)}
                        >{item.coArt}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{item.artDes}</td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-800 text-center">{item.cantidad}</td>
                        {!isTraslado && (
                          <td className="px-4 py-3 text-xs text-gray-600 text-right">
                            {item.precioVta?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(!detalle.items || detalle.items.length === 0) && (
                <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">No hay items en este documento</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalDetalleDocumento
