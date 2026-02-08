import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export function StewardDashboard() {
    const navigate = useNavigate()

    const { data, error, isLoading } = useQuery({
        queryKey: ['stewardEvents'],
        queryFn: async () => {
            const response = await api.get('/api/steward/events/')
            return response.data
        }
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div className="max-w-6xl mx-auto p-6 bg-card-bg dark:bg-dark-card-bg rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">Steward Dashboard</h1>
            
            {data.length === 0 ? (
                <p className="text-text-tertiary dark:text-dark-text-tertiary">No events assigned.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map(event => (
                        <div key={event.slug} className="bg-body-bg dark:bg-dark-body-bg p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
                            <h2 className="text-xl font-semibold mb-2 text-text-heading dark:text-dark-text-primary">{event.event_name}</h2>
                            <p className="text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                <strong>Date:</strong> {event.is_single_day ? event.start_date : `${event.start_date} - ${event.end_date}`}
                            </p>
                            <p className="text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                <strong>Location:</strong> {event.location_profile?.name || "Not specified"}
                            </p>
                            <p className="text-text-tertiary dark:text-dark-text-tertiary mb-3">
                                <strong>Unfilled:</strong> {event.unfilled_count}
                            </p>
                            <button
                                onClick={() => navigate(`/dash/event/${event.slug}`)}
                                className="w-full bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                            >
                                View Event
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}