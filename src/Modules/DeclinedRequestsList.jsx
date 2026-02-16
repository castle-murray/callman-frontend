import { useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useMessages } from '../contexts/MessageContext'

export function DeclinedRequestsList() {
    const navigate = useNavigate()
    const { addMessage } = useMessages()
    const queryClient = useQueryClient()
    const errorShown = useRef(false)

    const { data, error, isLoading } = useQuery({
        queryKey: ['declinedList'],
        queryFn: async () => {
            const response = await api.get('/declined-list/')
            return response.data
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (token) => {
            const response = await api.post(`/request/${token}/action/`, { action: 'delete' })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['declinedList'] })
            queryClient.invalidateQueries({ queryKey: ['declinedCount'] })
            addMessage('Request deleted', 'success')
        },
        onError: (error) => {
            addMessage(error.response?.data?.message || 'Failed to delete request', 'error')
        }
    })

    useEffect(() => {
        if (error && !errorShown.current) {
            addMessage('Error loading declined requests: ' + error.message, 'error')
            errorShown.current = true
        }
    }, [error, addMessage])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Failed to load.</div>

    const requests = data?.requests || []

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">Declined Requests</h1>
            <div className="bg-card-bg p-6 rounded-lg shadow-md dark:bg-dark-card-bg dark:shadow-dark-shadow">
                {requests.length > 0 ? (
                    <ul className="space-y-2">
                        {requests.map(request => (
                            <li key={request.id} className="flex items-center justify-between border-b py-2 dark:border-dark-border-dark">
                                <span
                                    className="text-text-slate dark:text-dark-text-tertiary cursor-pointer hover:underline"
                                    onClick={() => navigate(`/dash/event/${request.labor_requirement.call_time.event.slug}`)}
                                >
                                    {request.worker?.name || 'Unnamed Worker'} - {request.labor_requirement.call_time.event.event_name} - {request.labor_requirement.call_time.name} - {request.labor_requirement.labor_type?.name} - {request.labor_requirement.call_time.date} - {request.labor_requirement.call_time.time}
                                </span>
                                <div className="ml-4 shrink-0">
                                    <button
                                        onClick={() => deleteMutation.mutate(request.token_short)}
                                        disabled={deleteMutation.isPending}
                                        className="bg-secondary text-dark-text-primary px-2 py-1 rounded hover:bg-secondary-hover dark:bg-dark-secondary dark:hover:bg-dark-secondary-hover disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-text-secondary dark:text-dark-text-secondary">No declined requests found.</p>
                )}
            </div>
            <button
                onClick={() => navigate('/dash')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
            >
                Back to Dashboard
            </button>
        </div>
    )
}
