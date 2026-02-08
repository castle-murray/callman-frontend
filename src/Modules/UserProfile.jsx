import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ShadowedText } from '../components/ShadowedText'


function CollapsibleSection({ title, children, right, defaultOpen = true, className = '' }) {
    return (
        <details open={defaultOpen} className={`border border-gray-200 dark:border-dark-border rounded-lg p-4 ${className}`}>
            <summary className="text-2xl font-semibold cursor-pointer flex justify-between">
                <span>{title}</span>
                {right && <span className="text-sm">{right}</span>}
            </summary>
            <div className="mt-4 space-y-2">
                {children}
            </div>
        </details>
    )
}

export function UserProfile() {
    const queryClient = useQueryClient()
    const { data, isLoading, error } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const response = await api.get('/api/user/profile/')
            return response.data
        }
    })
    
    console.log(data)

    const requestActionMutation = useMutation({
        mutationFn: async ({ requestId, action }) => {
            if (action === 'cancel') {
                const response = await api.post(`/api/user/request/${requestId}/action/`, { action: 'cancel' })
                return response.data
            } else {
                const response = await api.post(`/api/user/request/${requestId}/action/`, { action: "available", response: action })
                return response.data
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['userProfile'])
        },
        onError: (error) => {
            alert('Action failed: ' + error.message)
        }
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    const { companies, upcoming, past } = data

    const groupByEvent = (requests) => {
        return requests.reduce((acc, request) => {
            const event = request.labor_requirement.call_time.event
            const eventId = event.id
            if (!acc[eventId]) {
                acc[eventId] = {
                    ...event,
                    requests: []
                }
            }
            acc[eventId].requests.push(request)
            return acc
        }, {})
    }

    const calculateCounts = (requests) => {
        let confirmed = 0, pending = 0, available = 0, declined = 0, canceled = 0
        for (const req of requests) {
            if (req.canceled) canceled++
            else if (req.confirmed) confirmed++
            else if (req.availability_response === 'yes') available++
            else if (req.availability_response === 'no') declined++
            else pending++
        }
        return { confirmed, pending, available, declined, canceled }
    }

    const upcomingGrouped = groupByEvent(upcoming)
    const pastGrouped = groupByEvent(past)

    for (const event of Object.values(upcomingGrouped)) {
        event.counts = calculateCounts(event.requests)
    }
    for (const event of Object.values(pastGrouped)) {
        event.counts = calculateCounts(event.requests)
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
        <div className="space-y-6 max-h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold">User Profile</h1>

            <CollapsibleSection title={<span className="text-text-heading dark:text-dark-text-primary text-shadow-lg dark:text-shadow-lg text-shadow-gray-400 dark:text-shadow-black">Past Events</span>} className="bg-body-bg dark:bg-dark-body-bg bg-linear-to-br dark:from-dark-body-bg dark:to-dark-card-bg dark:shadow-lg dark:shadow-dark-card-bg ">
                <div className="max-h-10/12 overflow-y-auto bg-body-bg dark:bg-dark-body-bg rounded-2xl dark:shadow-lg dark:shadow-dark-card-bg space-y-2">
                    {Object.values(upcomingGrouped).map((event) => {
                    const right = (
                        <div className="flex space-x-2">
                            {event.counts.confirmed > 0 && <span className="text-success dark:text-dark-success">{event.counts.confirmed} confirmed</span>}
                            {event.counts.pending > 0 && <span className="text-secondary dark:text-yellow">{event.counts.pending} pending</span>}
                            {event.counts.available > 0 && <span className="text-available dark:text-dark-text-available">{event.counts.available} awaiting confirmation</span>}
                            {event.counts.declined > 0 && <span className="text-secondary dark:text-dark-secondary">{event.counts.declined} declined</span>}
                            {event.counts.canceled > 0 && <span className="text-danger dark:text-dark-danger">{event.counts.canceled} canceled</span>}
                        </div>
                    )
                    return (
                        <CollapsibleSection key={event.id} title={`${event.event_name} - ${formatDate(event.start_date)}`} right={right} defaultOpen={false} className="mb-2">
                        <div className="mb-4">
                            <p className="font-medium">Location: {event.location_profile?.name || 'Not specified'}</p>
                            <p className="text-sm">{event.event_description || 'No description'}</p>
                        </div>
                        <div className="space-y-2">
                            {event.requests.map((request) => (
                    <div key={request.id} className={`p-4 rounded shadow ${request.canceled ? 'bg-red-100 dark:bg-red-900' : 'bg-card-bg dark:bg-dark-card-bg'}`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className={`font-medium ${request.availability_response === 'yes' && !request.confirmed ? 'text-available dark:text-dark-text-available' : ''}`}>{request.labor_requirement.call_time.name}</p>
                                <p className={`text-sm ${request.availability_response === 'yes' && !request.confirmed ? 'text-available dark:text-dark-text-available' : ''}`}>{request.labor_requirement.labor_type.name} at {request.labor_requirement.call_time.time}</p>
                                {request.canceled && <p className="text-danger dark:text-dark-danger font-bold">CANCELED</p>}
                                {request.availability_response === 'no' && <p className="text-secondary dark:text-dark-secondary">Declined</p>}
                            </div>
                            {request.confirmed && !request.canceled ? (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => requestActionMutation.mutate({ requestId: request.token_short, action: 'cancel' })}
                                        disabled={requestActionMutation.isPending}
                                        className="bg-danger text-white px-3 py-1 rounded hover:bg-danger-hover dark:bg-dark-danger dark:hover:bg-dark-danger-hover text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : request.availability_response === null && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => requestActionMutation.mutate({ requestId: request.token_short, action: 'yes' })}
                                        disabled={requestActionMutation.isPending}
                                        className="bg-success text-dark-text-primary px-3 py-1 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover text-sm"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => requestActionMutation.mutate({ requestId: request.token_short, action: 'no' })}
                                        disabled={requestActionMutation.isPending}
                                        className="bg-warning text-dark-text-primary px-3 py-1 rounded hover:bg-warning-hover dark:bg-dark-warning dark:hover:bg-dark-warning-hover text-sm"
                                    >
                                        Decline
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                            ))}
                        </div>
                    </CollapsibleSection>
                    )
                })}
                {Object.keys(upcomingGrouped).length === 0 && <p>No upcoming events.</p>}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title={<span className="text-text-heading dark:text-dark-text-primary text-shadow-lg text-shadow-gray-400 dark:text-shadow-black dark:text-shadow-lg">Past Events</span>} className="bg-body-bg dark:bg-dark-body-bg bg-linear-to-br dark:from-dark-body-bg dark:to-dark-card-bg dark:shadow-lg dark:shadow-dark-card-bg ">
                <div className="max-h-10/12 overflow-y-auto bg-body-bg dark:bg-dark-body-bg rounded-2xl dark:shadow-lg dark:shadow-dark-card-bg space-y-2">
                    {Object.values(pastGrouped).map((event) => {
                    const right = (
                        <div className="flex space-x-2">
                            {event.counts.confirmed > 0 && <span className="text-success dark:text-dark-success">{event.counts.confirmed} confirmed</span>}
                            {event.counts.pending > 0 && <span className="text-secondary dark:text-yellow">{event.counts.pending} pending</span>}
                            {event.counts.available > 0 && <span className="text-available dark:text-dark-text-available">{event.counts.available} awaiting confirmation</span>}
                            {event.counts.declined > 0 && <span className="text-secondary dark:text-dark-secondary">{event.counts.declined} declined</span>}
                            {event.counts.canceled > 0 && <span className="text-danger dark:text-dark-danger">{event.counts.canceled} canceled</span>}
                        </div>
                    )
                    return (
                        <CollapsibleSection key={event.id} title={`${event.event_name} - ${formatDate(event.start_date)}`} right={right} defaultOpen={false} className="mb-2">
                        <div className="mb-4">
                            <p className="font-medium">Location: {event.location_profile?.name || 'Not specified'}</p>
                            <p className="text-sm">{event.event_description || 'No description'}</p>
                        </div>
                        <div className="space-y-2">
                            {event.requests.map((request) => (
                                <div key={request.id} className="bg-card-bg dark:bg-dark-card-bg p-4 rounded shadow-md shadow-dark-card-bg">
                                    <p className="font-medium">{request.labor_requirement.call_time.name}</p>
                                    <p className="text-sm">{request.labor_requirement.labor_type.name} at {request.labor_requirement.call_time.time}</p>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>
                    )
                })}
                {Object.keys(pastGrouped).length === 0 && <p>No past events.</p>}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title={<span className="text-text-heading dark:text-dark-text-primary text-shadow-lg text-shadow-gray-400 dark:text-shadow-black dark:text-shadow-lg">Companies</span>} defaultOpen={false} className="bg-body-bg dark:bg-dark-body-bg bg-linear-to-br dark:from-dark-body-bg dark:to-dark-card-bg dark:shadow-lg dark:shadow-dark-card-bg ">
                <div className="max-h-96 overflow-y-auto bg-body-bg dark:bg-dark-body-bg rounded-2xl dark:shadow-lg dark:shadow-dark-card-bg">
                    {companies.map((company, index) => (
                        <div key={index} className="bg-card-bg dark:bg-dark-card-bg p-4 rounded shadow">
                            <p className="font-medium">{company}</p>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>
        </div>
    )
}
