import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useMessages } from '../contexts/MessageContext'

export function WorkerHistory() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const { addMessage } = useMessages()
    const errorShown = useRef(false)

    const { data, error, isLoading } = useQuery({
        queryKey: ['workerHistory', slug],
        queryFn: async () => {
            const response = await api.get(`/workers/${slug}/history/`)
            return response.data
        }
    })

    useEffect(() => {
        if (error && !errorShown.current) {
            addMessage('Error loading worker history: ' + error.message, 'error')
            errorShown.current = true
        }
    }, [error, addMessage])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Failed to load.</div>

    const { worker, confirmed_requests, declined_requests, ncns_requests, pending_requests, available_requests } = data

    const renderRequests = (requests, title, colorClass) => (
        <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-2 ${colorClass}`}>{title}</h2>
            {requests.length > 0 ? (
                <ul className="space-y-2">
                    {requests.map(request => (
                        <li key={request.id} className={`flex items-center justify-between ${colorClass}`}>
                            <a href={`/dash/event/${request.labor_requirement.call_time.event.slug}`} className="hover:underline">
                                {request.labor_requirement.call_time.event.event_name} - 
                                {request.labor_requirement.call_time.name} - 
                                {request.labor_requirement.labor_type.name} - 
                                {request.labor_requirement.call_time.date} - 
                                {request.labor_requirement.call_time.time}
                            </a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-text-secondary dark:text-dark-text-secondary">No {title.toLowerCase()}.</p>
            )}
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">Worker History</h1>
            <div className="bg-card-bg p-6 rounded-lg shadow-md dark:bg-dark-card-bg dark:shadow-dark-shadow">
                <h2 className="text-xl font-semibold mb-4 text-text-heading dark:text-dark-text-primary">{worker.name}</h2>
                {renderRequests(confirmed_requests, 'Confirmed Requests', 'text-text-green dark:text-dark-text-green')}
                {renderRequests(declined_requests, 'Declined Requests', 'text-text-red dark:text-dark-text-red')}
                {renderRequests(ncns_requests, 'NCNS Requests', 'text-text-purple dark:text-dark-text-purple')}
                {renderRequests(pending_requests, 'Pending Requests', 'text-text-yellow dark:text-dark-text-yellow')}
                {renderRequests(available_requests, 'Available Requests', 'text-text-blue dark:text-dark-text-blue')}
            </div>
            <button 
                onClick={() => navigate('/dash/contacts')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
            >
                Back to Contacts
            </button>
        </div>
    )
}