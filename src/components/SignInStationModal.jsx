import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '../api'

export function SignInStationModal({ isOpen, onClose, slug }) {
    const [generated, setGenerated] = useState(null)

    const generateMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post(`/api/event/${slug}/generate-station/`)
            return response.data
        },
        onSuccess: (data) => {
            setGenerated(data)
        },
    })

    const handleClose = () => {
        setGenerated(null)
        generateMutation.reset()
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
            <div
                className="bg-card-bg dark:bg-dark-card-bg rounded-lg shadow-lg p-6 w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-heading dark:text-dark-text-primary">
                        Sign In Station
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {!generated ? (
                    <div className="text-center">
                        <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
                            Generate a QR code to set up a sign-in station. Scan it with a tablet or phone to open a kiosk where workers can clock in/out.
                        </p>
                        <button
                            onClick={() => generateMutation.mutate()}
                            disabled={generateMutation.isPending}
                            className="bg-primary text-dark-text-primary px-6 py-3 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                        >
                            {generateMutation.isPending ? 'Generating...' : 'Generate QR Code'}
                        </button>
                        {generateMutation.isError && (
                            <p className="text-danger dark:text-dark-danger mt-3">
                                {generateMutation.error?.response?.data?.message || 'Failed to generate station.'}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-text-primary dark:text-dark-text-primary font-semibold mb-2">
                            {generated.event_name}
                        </p>
                        <img
                            src={`data:image/png;base64,${generated.qr_code_data}`}
                            alt="Sign In Station QR Code"
                            className="mx-auto mb-4 max-w-64"
                        />
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-2">
                            Scan this QR code with a kiosk device to open the sign-in station.
                        </p>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">
                            Expires: {new Date(generated.expires_at).toLocaleString()}
                        </p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={() => navigator.clipboard?.writeText(generated.station_url)}
                                className="bg-secondary text-dark-text-primary px-4 py-2 rounded hover:bg-secondary-hover dark:bg-dark-secondary dark:hover:bg-dark-secondary-hover"
                            >
                                Copy URL
                            </button>
                            <button
                                onClick={handleClose}
                                className="bg-primary text-dark-text-primary px-4 py-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
