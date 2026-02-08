import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import api from '../api'
import { LaborRequestList } from './LaborRequestList'
import { useMessages } from '../contexts/MessageContext'

export function CallTimeRequestList() {
    const location = useLocation()
    const navigate = useNavigate()
    const { slug } = useParams()
    const queryClient = useQueryClient()
    const { addMessage } = useMessages()
    const errorShown = useRef(false)

    const { data, error, isLoading } = useQuery({
        queryKey: ['callTimeRequests', slug],
        queryFn: async () => {
            const response = await api.get(`/api/call-times/${slug}/requests/`)
            return response.data
        }


    })

    useEffect(() => {
        if (error && !errorShown.current) {
            addMessage('Error loading call time requests: ' + error.message, 'error')
            errorShown.current = true
        }
    }, [error, addMessage])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Failed to load.</div>

    
    const callTime = data?.call_time
    const laborRequests = data?.labor_requests
    const laborTypes = data?.labor_types
    const event = data?.event

    if (!callTime || !laborRequests) {
        return (
            <div>
                <p>Missing required data. Please navigate from the event page.</p>
                <button 
                    onClick={() => navigate('/events')}
                    className="bg-primary text-white px-4 py-2 rounded"
                >
                    Back to Events
                </button>
            </div>
        )
    }

    return (
        <LaborRequestList
            callTime={callTime}
            laborRequests={laborRequests}
            laborTypes={laborTypes}
            backUrl={`/dash/event/${event.slug}`}
            backText="Back to Event"
            isCallTimePage={true}
        />
    )
}
