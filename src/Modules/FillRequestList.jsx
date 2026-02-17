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

    const autoFillMutation = useMutation({
        mutationFn: async (workerIds) => {
            const promises = workerIds.map(workerId =>
                api.post(`/request/${slug}/worker/`, {
                    worker_id: workerId,
                    action: 'request'
                })
            )
            return Promise.all(promises)
        },
        onSuccess: (_, workerIds) => {
            queryClient.invalidateQueries(['fillRequestList', slug])
            addMessage(`Auto-filled ${workerIds.length} workers`, 'success')
        },
        onError: (error) => {
            addMessage('Error auto-filling workers: ' + (error.response?.data?.message || error.message), 'error')
        }
    })

    const handleAutoFill = () => {
        if (!data || !workers || !laborRequirement) return

        // Calculate positions still needed
        const confirmedCount = laborRequests?.filter(req => req.confirmed).length || 0
        const requestedCount = laborRequests?.filter(req => !req.confirmed && !req.reserved).length || 0
        const reservedCount = laborRequests?.filter(req => req.reserved).length || 0

        const totalPositions = laborRequirement.needed_labor || 0
        const positionsNeeded = totalPositions - confirmedCount - reservedCount

        if (isNaN(positionsNeeded) || positionsNeeded <= 0) {
            addMessage(`No positions available to fill (Total: ${totalPositions}, Confirmed: ${confirmedCount}, Reserved: ${reservedCount})`, 'info')
            return
        }

        // Filter out workers with conflicts or already reserved
        // Allow workers who are already "requested" to be selected again if needed
        const availableWorkers = workers.filter(worker => {
            // Exclude if reserved
            if (worker.reserved) return false

            // Exclude if they have any conflicts
            if (worker.conflicts && worker.conflicts.length > 0) return false

            return true
        })

        if (availableWorkers.length === 0) {
            addMessage('No available workers to auto-fill (all have conflicts or are reserved)', 'info')
            return
        }

        // Separate matched and unmatched workers
        const matchedWorkers = availableWorkers.filter(worker =>
            worker.labor_types.some(type => type.id === laborRequirement.labor_type?.id)
        )
        const unmatchedWorkers = availableWorkers.filter(worker =>
            !worker.labor_types.some(type => type.id === laborRequirement.labor_type?.id)
        )

        // Shuffle unmatched workers randomly
        const shuffledUnmatched = [...unmatchedWorkers].sort(() => Math.random() - 0.5)

        // Combine: matched first, then randomized unmatched
        const orderedWorkers = [...matchedWorkers, ...shuffledUnmatched]

        // Take only what we need
        const workersToRequest = orderedWorkers.slice(0, positionsNeeded)

        if (workersToRequest.length === 0) {
            addMessage('No workers available to request', 'info')
            return
        }

        // Request the selected workers
        autoFillMutation.mutate(workersToRequest.map(w => w.id))
    }

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
        <div className="my-4 flex justify-between">
            <button
                onClick={() => sendListedMutation.mutate()}
                disabled={sendListedMutation.isPending}
                className="shadow-sm shadow-secondary dark:shadow-dark-secondary bg-success text-dark-text-primary px-4 py-2 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover disabled:opacity-50"
            >
                {sendListedMutation.isPending ? 'Sending...' : 'Send Listed'}
            </button>
            <button
                onClick={handleAutoFill}
                disabled={autoFillMutation.isPending}
                className="shadow-sm shadow-secondary dark:shadow-dark-secondary bg-primary text-dark-text-primary px-4 py-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
            >
                {autoFillMutation.isPending ? 'Auto Filling...' : 'Auto Fill'}
            </button>
        </div>
        <FillRequestWorkerList
            workers={workers}
            laborRequirementType={laborRequirement?.labor_type}
        />
        </>
    )


}
