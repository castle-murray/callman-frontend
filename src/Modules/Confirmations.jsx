import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useMessages } from '../contexts/MessageContext'

export function Confirmations() {
    const { callTimeSlug } = useParams()
    const navigate = useNavigate()
    const { addMessage } = useMessages()

    const { data, error, isLoading } = useQuery({
        queryKey: ['callTimeConfirmations', callTimeSlug],
        queryFn: async () => {
            const response = await api.get(`/api/call-times/${callTimeSlug}/confirmations/`)
            return response.data
        }
    })

    if (error) {
        addMessage('Error loading confirmations: ' + error.message, 'error')
        return <div>Failed to load.</div>
    }

    if (isLoading) return <div>Loading...</div>

    if (!data) return <div>No data</div>

    const { call_time, confirmed_requests, unconfirmed_requests, cant_do_it_requests } = data

    const renderRequests = (requests, title, colorClass) => (
        <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-2 ${colorClass}`}>{title}</h2>
            {requests && requests.length > 0 ? (
                <ul className="space-y-2">
                    {requests.map(request => (
                        <li key={request.id} className={colorClass}>
                            {request.worker?.name || "Unnamed Worker"} ({request.worker?.phone_number}) - {request.labor_requirement?.labor_type?.name}
                            {request.message && (
                                <p className="text-text-secondary dark:text-dark-text-secondary ml-4">{request.message}</p>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-text-secondary dark:text-dark-text-secondary">No {title.toLowerCase()}.</p>
            )}
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto p-6 bg-card-bg rounded-lg shadow-md dark:bg-dark-card-bg dark:shadow-dark-shadow">
            <h1 className="text-2xl font-bold mb-4 text-text-heading dark:text-dark-text-primary">Confirmations for {call_time?.name}</h1>
            {renderRequests(confirmed_requests, 'Confirmed', 'text-text-green dark:text-dark-text-green')}
            {renderRequests(unconfirmed_requests, 'Unconfirmed', 'text-text-yellow dark:text-dark-text-yellow')}
            {renderRequests(cant_do_it_requests, 'Cant Do It', 'text-text-red dark:text-dark-text-red')}
            <a href="#" onClick={() => navigate(`/event/${call_time?.event?.slug}`)} className="inline-block text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover">Back to Event</a>
        </div>
    )
}