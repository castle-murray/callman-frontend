import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import QrScanner from 'qr-scanner'
import { useMessages } from '../contexts/MessageContext'
import api from '../api'

export function QRScanner() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addMessage } = useMessages()
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const [lastAction, setLastAction] = useState('')

  useEffect(() => {
    if (videoRef.current && !scannerRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        result => handleScan(result.data),
        {
          onDecodeError: err => {
            console.warn('QR scan error:', err)
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          calculateScanRegion: (video) => {
            const size = Math.min(video.videoWidth, video.videoHeight) * 0.9
            const x = (video.videoWidth - size) / 2
            const y = (video.videoHeight - size) / 2
            return { x, y, width: size, height: size }
          },
        }
      )
      // Auto start scanning
      ;(async () => {
        try {
          await scannerRef.current.start()
          setIsScanning(true)
        } catch (err) {
          console.error('Failed to start scanner:', err)
          setError('Failed to access camera. Please check permissions.')
          addMessage('Failed to access camera', 'error')
        }
      })()
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
        scannerRef.current = null
      }
    }
  }, [])

  const handleScan = async (data) => {
    setIsScanning(false)
    scannerRef.current.stop()

    // Extract token from data
    const match = data.match(/clock-in\/([^\/]+)/)
    if (!match) {
      setError('Invalid QR code format.')
      // Restart scanning after error
      setTimeout(() => startScanning(), 2000)
      return
    }
    const token = match[1]

    // Clock in/out with QR
    try {
      const response = await api.post(`/api/clock-in-qr/${token}/`)
      const message = response.data.message || 'Clock action completed'
      setLastAction(message)
      setError('')
      addMessage(message, 'success')
      setTimeout(() => setLastAction(''), 5000)
      setTimeout(() => startScanning(), 3000)
    } catch (error) {
      console.error('QR clock error:', error)
      const errMsg = 'Failed to clock: ' + (error.response?.data?.message || error.message)
      setLastAction(errMsg)
      setError(errMsg)
      setTimeout(() => startScanning(), 2000)
    }
  }

  const startScanning = async () => {
    if (!scannerRef.current) return

    try {
      setError('')
      await scannerRef.current.start()
      setIsScanning(true)
    } catch (err) {
      console.error('Failed to start scanner:', err)
      setError('Failed to access camera. Please check permissions.')
      addMessage('Failed to access camera', 'error')
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop()
    }
    setIsScanning(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card-bg dark:bg-dark-card-bg rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">
        QR Code Scanner
      </h1>

      <div className="mb-4">
        <video
          ref={videoRef}
          className="w-full max-w-xl mx-auto border rounded aspect-square"
          playsInline
          muted
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-danger text-dark-text-primary rounded">
          {error}
        </div>
      )}

      {lastAction && !error && (
        <div className="mb-4 p-4 bg-success text-dark-text-primary rounded text-center text-xl font-bold">
          {lastAction}
        </div>
      )}

      <div className="text-center">
        <p className="mb-4 text-text-primary dark:text-dark-text-primary">
          {isScanning ? 'Scanning for QR codes...' : 'Scanner stopped'}
        </p>
        <button
          onClick={stopScanning}
          className="bg-secondary text-dark-text-primary px-6 py-2 rounded hover:bg-secondary-hover dark:bg-dark-secondary dark:hover:bg-dark-secondary-hover"
        >
          Stop Scanning
        </button>
      </div>

      <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-4 text-center">
        Point your camera at a worker's QR code to clock them in/out.
      </p>
    </div>
  )
}
