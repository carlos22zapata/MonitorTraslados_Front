import { useState, useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import DashboardKDS from './components/DashboardKDS'

const SIGNALR_HUB_URL = 'http://localhost:5206/trasladohub'

function App() {
  const [movimientos, setMovimientos] = useState([])
  const [connectionState, setConnectionState] = useState('Desconectado')
  const [lastUpdate, setLastUpdate] = useState(null)
  const connectionRef = useRef(null)

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const delays = [0, 2000, 5000, 10000, 15000]
          return delays[retryContext.previousRetryCount] || 15000
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build()

    connectionRef.current = connection

    connection.on('RecibirMovimientos', (data) => {
      setMovimientos(data)
      setLastUpdate(new Date())
    })

    connection.onreconnecting(() => {
      setConnectionState('Reconectando...')
    })

    connection.onreconnected(() => {
      setConnectionState('Conectado')
    })

    connection.onclose((error) => {
      setConnectionState('Desconectado')
      if (error) {
        console.error('Conexión cerrada con error:', error)
      }
    })

    const startConnection = async () => {
      try {
        await connection.start()
        setConnectionState('Conectado')
        console.log('Conexión SignalR establecida')
      } catch (err) {
        console.error('Error al conectar:', err)
        setConnectionState('Error de conexión')
        setTimeout(startConnection, 5000)
      }
    }

    startConnection()

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop()
      }
    }
  }, [])

  const handleRefresh = async () => {
    if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
      try {
        await connectionRef.current.invoke('SolicitarActualizacion')
      } catch (err) {
        console.error('Error al solicitar actualización:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-white via-blue-500 to-blue-900 shadow-lg">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/LogoInfrared.png" alt="Logo" className="h-14 w-auto" />
              <button 
                onClick={handleRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                title="Actualizar ahora"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Monitor de Traslados</h1>
              <p className="text-blue-100 text-sm">Sistema KDS - Tiempo Real</p>
            </div>
            <div className="flex flex-col items-end space-y-1 text-white">
              {lastUpdate && (
                <span className="text-blue-100 text-sm">
                  Última actualización: {lastUpdate.toLocaleTimeString('es-VE')}
                </span>
              )}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${
                    connectionState === 'Conectado' 
                      ? 'bg-green-400 animate-pulse' 
                      : connectionState === 'Reconectando...'
                        ? 'bg-yellow-400 animate-pulse'
                        : 'bg-red-400'
                  }`}></span>
                  <span className="text-sm font-medium">{connectionState}</span>
                </div>
                <div className="bg-blue-800 px-3 py-1 rounded-full">
                  <span className="font-bold">{movimientos.length}</span>
                  <span className="text-blue-200 ml-1">artículos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 py-6">
        <DashboardKDS movimientos={movimientos} />
      </main>
    </div>
  )
}

export default App
