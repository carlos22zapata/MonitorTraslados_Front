import { useState, useEffect } from 'react'

function TarjetaMovimiento({ movimiento }) {
  const [minutos, setMinutos] = useState(0)

  useEffect(() => {
    const calcularMinutos = () => {
      const fechaReg = new Date(movimiento.fechaRegistroRaw)
      const ahora = new Date()
      return Math.floor((ahora - fechaReg) / 60000)
    }

    setMinutos(calcularMinutos())

    const intervalo = setInterval(() => {
      setMinutos(calcularMinutos())
    }, 60000)

    return () => clearInterval(intervalo)
  }, [movimiento.fechaRegistroRaw])

  const getEstiloTipo = (ord) => {
    switch (ord) {
      case 1: return { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-800', label: 'Traslado' }
      case 2: return { border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-800', label: 'Factura' }
      case 3: return { border: 'border-l-purple-500', badge: 'bg-purple-100 text-purple-800', label: 'Devolución' }
      default: return { border: 'border-l-gray-400', badge: 'bg-gray-100 text-gray-800', label: 'Otro' }
    }
  }

  const getEstiloMinutos = (min) => {
    if (min > 10) return { container: 'bg-red-50 border-red-500', texto: 'text-red-700 font-bold' }
    if (min > 5) return { container: 'bg-yellow-50 border-yellow-500', texto: 'text-yellow-700 font-semibold' }
    return { container: 'bg-green-50 border-green-500', texto: 'text-green-700 font-semibold' }
  }

  const estiloTipo = getEstiloTipo(movimiento.ord)
  const estiloMin = getEstiloMinutos(minutos)

  return (
    <div className={`rounded-lg shadow-md overflow-hidden border-l-4 ${estiloTipo.border} ${estiloMin.container} transition-all duration-300 hover:shadow-lg min-h-[100px]`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${estiloTipo.badge}`}>{estiloTipo.label}</span>
            <span className="text-gray-700 text-sm font-bold">#{movimiento.movNum}</span>
          </div>
          <span className={`text-sm ${estiloMin.texto}`}>{minutos} min</span>
        </div>

        <div className="text-xs text-gray-600 font-bold mb-1">{movimiento.vendTras || 'SIN VENDEDOR ASIGNADO'}</div>
        <div className="text-xs text-gray-400 mb-2 font-bold">{movimiento.fechaRegistro}</div>

        {movimiento.items && movimiento.items.length > 0 && (
          <div className="border-t border-gray-100 pt-2">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {movimiento.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center min-w-0">
                    <span className="text-gray-400 font-mono shrink-0 w-20">{item.coArt}</span>
                    <span className="text-gray-700 truncate" title={item.artDes}>{item.artDes}</span>
                  </div>
                  <span className={`font-semibold shrink-0 ml-2 ${item.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.cantidad > 0 ? '+' : ''}{item.cantidad}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TarjetaMovimiento
