import TarjetaMovimiento from './TarjetaMovimiento'

function DashboardKDS({ movimientos, onArticuloClick }) {
  if (movimientos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md flex flex-col items-center">
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Todo al día</h2>
          <p className="text-gray-500">No hay movimientos en este período</p>
        </div>
      </div>
    )
  }

  const agrupados = movimientos.reduce((acc, mov) => {
    const tipo = mov.tipo || 'Otros'
    if (!acc[tipo]) acc[tipo] = []
    acc[tipo].push(mov)
    return acc
  }, {})

  const ordenTipos = ['Traslados', 'Facturas', 'Devoluciones', 'Otros']
  const tiposExistentes = ordenTipos.filter(t => agrupados[t])

  return (
    <div className="space-y-6">
      {tiposExistentes.map(tipo => (
        <div key={tipo}>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-gray-700 text-sm font-bold">{tipo}</span>
            <span className="text-gray-400 text-sm">({agrupados[tipo].length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {agrupados[tipo].map(mov => (
              <TarjetaMovimiento key={`${mov.tipo}-${mov.movNum}`} movimiento={mov} onArticuloClick={onArticuloClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardKDS
