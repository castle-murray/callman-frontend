import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api'

export function UpcomingEvents() {
    const { data, error, isLoading } = useQuery({
        queryKey: ['upcomingEvents'],
        queryFn: async () => {
            const response = await api.get('/api/upcoming-event-count/')
            return response.data
        }
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div className="bg-card-bg p-4 rounded-lg shadow dark:bg-dark-card-bg dark:shadow-dark-shadow w-auto">
            <h1>Upcoming Events</h1>
            <p>{data.count}</p>
        </div>
    )
}
