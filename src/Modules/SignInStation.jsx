import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import QrScanner from 'qr-scanner'
import api from '../api'

export function SignInStation() {
    const { token } = useParams()
    const videoRef = useRef(null)
    const scannerRef = useRef(null)
    const [eventName, setEventName] = useState('')
    const [expiresAt, setExpiresAt] = useState('')
    const [validating, setValidating] = useState(true)
    const [stationError, setStationError] = useState('')
    const [isScanning, setIsScanning] = useState(false)
    const [feedback, setFeedback] = useState(null)
    const [cameras, setCameras] = useState([])
    const [selectedCamera, setSelectedCamera] = useState('')
    const processingRef = useRef(false)

    // Validate station token on mount
    useEffect(() => {
        const validate = async () => {
            try {
                const response = await api.get(`/api/station/${token}/validate/`)
                setEventName(response.data.event_name)
                setExpiresAt(response.data.expires_at)
                setValidating(false)
            } catch (err) {
                setStationError(err.response?.data?.message || 'Invalid or expired station.')
                setValidating(false)
            }
        }
        validate()
    }, [token])

    // List available cameras
    useEffect(() => {
        QrScanner.listCameras(true).then((cams) => {
            setCameras(cams)
            if (cams.length > 0) {
                setSelectedCamera(cams[0].id)
            }
        })
    }, [])

    const startScanning = async () => {
        if (!scannerRef.current) return
        try {
            await scannerRef.current.start()
            setIsScanning(true)
        } catch (err) {
            console.error('Failed to start scanner:', err)
            setStationError('Failed to access camera. Please check permissions.')
        }
    }

    const handleScan = async (data) => {
        if (processingRef.current) return
        processingRef.current = true

        if (scannerRef.current) {
            scannerRef.current.stop()
            setIsScanning(false)
        }

        const match = data.match(/clock-in\/([0-9a-f-]{36})/)
        if (!match) {
            setFeedback({ type: 'error', message: 'Invalid QR code format.' })
            setTimeout(() => {
                setFeedback(null)
                processingRef.current = false
                startScanning()
            }, 3000)
            return
        }
        const workerToken = match[1]

        try {
            const response = await api.post(`/api/station/${token}/clock/`, {
                worker_token: workerToken,
            })
            setFeedback({
                type: 'success',
                message: response.data.message,
                workerName: response.data.worker_name,
            })
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.response?.data?.message || 'Clock action failed.',
            })
        }

        setTimeout(() => {
            setFeedback(null)
            processingRef.current = false
            startScanning()
        }, 3000)
    }

    // Initialize scanner once validated and video element ready
    useEffect(() => {
        if (validating || stationError || !videoRef.current) return
        if (scannerRef.current) return

        scannerRef.current = new QrScanner(
            videoRef.current,
            (result) => handleScan(result.data),
            {
                onDecodeError: () => {},
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
        ;(async () => {
            try {
                await scannerRef.current.start()
                setIsScanning(true)
            } catch (err) {
                console.error('Failed to start scanner:', err)
                setStationError('Failed to access camera. Please check permissions.')
            }
        })()

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop()
                scannerRef.current.destroy()
                scannerRef.current = null
            }
        }
    }, [validating, stationError]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleCameraChange = (e) => {
        const camId = e.target.value
        setSelectedCamera(camId)
        if (scannerRef.current) {
            scannerRef.current.setCamera(camId)
        }
    }

    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <p className="text-xl">Loading station...</p>
            </div>
        )
    }

    if (stationError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <p className="text-2xl text-red-400 mb-4">{stationError}</p>
                    <p className="text-gray-400">This sign-in station is no longer available.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
            <div className="w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-center mb-2">{eventName}</h1>
                <p className="text-gray-400 text-center mb-6">Sign In Station</p>

                {cameras.length > 1 && (
                    <div className="mb-4 flex justify-center">
                        <select
                            value={selectedCamera}
                            onChange={handleCameraChange}
                            className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
                        >
                            {cameras.map((cam) => (
                                <option key={cam.id} value={cam.id}>
                                    {cam.label || `Camera ${cam.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="relative mb-4">
                    <video
                        ref={videoRef}
                        className="w-full max-w-xl mx-auto border-2 border-gray-600 rounded-lg aspect-square"
                        playsInline
                        muted
                    />
                    {feedback && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                            <div className="text-center p-6">
                                {feedback.workerName && (
                                    <p className="text-3xl font-bold mb-2">{feedback.workerName}</p>
                                )}
                                <p className={`text-2xl font-semibold ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                    {feedback.message}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-center text-gray-400">
                    {isScanning ? 'Scan a worker\'s QR code to clock in/out' : 'Scanner paused...'}
                </p>

                {expiresAt && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                        Station expires: {new Date(expiresAt).toLocaleString()}
                    </p>
                )}
            </div>
        </div>
    )
}
