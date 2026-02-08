import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api'

export function SMSCount() {
    const { data, error, isLoading } = useQuery({
        queryKey: ['smsCount'],
        queryFn: async () => {
            const response = await api.get('/api/sms-count/')
            return response.data
        }
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div className="bg-card-bg p-4 rounded-lg shadow dark:bg-dark-card-bg dark:shadow-dark-shadow">
            <h1>SMS Sent</h1>
            <p>{data.count}</p>
        </div>
    )
}
