import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { LaborRequestList } from './LaborRequestList'
import { FillRequestWorkerList } from './FillRequestWorkerList'
import { useMessages } from '../contexts/MessageContext'

export function FillRequestList() {
    const navigate = useNavigate()
    const { slug } = useParams()
    const queryClient = useQueryClient()
    const { addMessage } = useMessages()
    const errorShown = useRef(false)

    const { data, error, isLoading } = useQuery({
        queryKey: ['fillRequestList', slug],
        queryFn: async () => {
            const response = await api.get(`/request/${slug}/fill-list/`)
            return response.data
        }
    })

    const sendListedMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post(`/request/${slug}/send-messages/`)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['fillRequestList', slug])
            const type = data.message.toLowerCase().includes('no') || data.message.toLowerCase().includes('error') ? 'error' : 'success'
            addMessage(data.message, type)
        },
        onError: (error) => {
            addMessage('Error sending messages: ' + (error.response?.data?.message || error.message), 'error')
        }
    })

    useEffect(() => {
        if (error && !errorShown.current) {
            addMessage('Error loading fill request list: ' + error.message, 'error')
            errorShown.current = true
        }
    }, [error, addMessage])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Failed to load.</div>

    const laborRequirement = data?.labor_requirement
    const laborRequests = data?.labor_requests
    const laborTypes = data?.labor_types
    const event = data?.event
    const workers = data?.workers

    if (!laborRequirement || !laborRequests) {
        return (
            <div>
                <p>Missing required data. Please navigate from the event page.</p>
                <button 
                    onClick={() => navigate('/dash/events')}
                    className="bg-primary text-white px-4 py-2 rounded"
                >
                    Back to Events
                </button>
            </div>
        )
    }

    return (
        <>
        <LaborRequestList
            laborRequirement={laborRequirement}
            laborRequests={laborRequests}
            backUrl={`/dash/event/${event.slug}`}
            backText="Back to Event"
            isCallTimePage={true}
        />
        <div className="my-4">
            <button
                onClick={() => sendListedMutation.mutate()}
                disabled={sendListedMutation.isPending}
                className="shadow-sm shadow-secondary dark:shadow-dark-secondary bg-success text-dark-text-primary px-4 py-2 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover disabled:opacity-50"
            >
                {sendListedMutation.isPending ? 'Sending...' : 'Send Listed'}
            </button>
        </div>
        <FillRequestWorkerList
            workers={workers}
            laborRequirementType={laborRequirement?.labor_type}
        />
        </>
    )


}
