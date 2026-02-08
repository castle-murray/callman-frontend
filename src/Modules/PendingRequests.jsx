import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api'
import { useMessages } from '../contexts/MessageContext'

export function PendingRequests() {
    const { addMessage } = useMessages()
    const errorShown = useRef(false)
    const { data, error, isLoading } = useQuery({
        queryKey: ['pendingRequests'],
        queryFn: async () => {
            const response = await api.get('/api/pending-count/')
            return response.data
        }
    })

    useEffect(() => {
        if (error && !errorShown.current) {
            addMessage('Error loading pending requests: ' + error.message, 'error')
            errorShown.current = true
        }
    }, [error, addMessage])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Failed to load.</div>

    return (
        <div className="bg-card-bg p-4 rounded-lg shadow dark:bg-dark-card-bg dark:shadow-dark-shadow">
            <h1>Pending Requests</h1>
            <p>{data.count}</p>
        </div>
    )
}
