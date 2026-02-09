import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api'

export function DeclinedCount() {
    const { data, error, isLoading } = useQuery({
        queryKey: ['declinedCount'],
        queryFn: async () => {
            const response = await api.get('/declined-count/')
            return response.data
        }
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div className="bg-card-bg p-4 rounded-lg shadow dark:bg-dark-card-bg dark:shadow-dark-shadow">
            <h1>Declined Requests</h1>
            <p>{data.count}</p>
        </div>
    )
}

