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
    const [pos, setPos] = useState({ x: 16, y: window.innerHeight - 100 })
    const dragStart = useRef(null)

    useEffect(() => {
        const onMove = (e) => {
            if (!dragStart.current) return
            const clientX = e.touches ? e.touches[0].clientX : e.clientX
            const clientY = e.touches ? e.touches[0].clientY : e.clientY
            setPos({
                x: dragStart.current.px + clientX - dragStart.current.mx,
                y: dragStart.current.py + clientY - dragStart.current.my,
            })
        }
        const onUp = () => { dragStart.current = null }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        window.addEventListener('touchmove', onMove)
        window.addEventListener('touchend', onUp)
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
            window.removeEventListener('touchmove', onMove)
            window.removeEventListener('touchend', onUp)
        }
    }, [])

    const handleDragStart = (e) => {
        e.preventDefault()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        dragStart.current = { mx: clientX, my: clientY, px: pos.x, py: pos.y }
    }

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
        const positionsNeeded = totalPositions - confirmedCount - reservedCount - requestedCount

        if (isNaN(positionsNeeded) || positionsNeeded <= 0) {
            addMessage(`No positions available to fill (Total: ${totalPositions}, Confirmed: ${confirmedCount}, Reserved: ${reservedCount}, Requested: ${requestedCount})`, 'info')
            return
        }

        const availableWorkers = workers.filter(worker => {
            if (worker.reserved) return false
            if (worker.requested) return false
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

    const remaining = laborRequirement.needed_labor - laborRequests.length
    const counterColor = remaining < 0
        ? 'bg-danger dark:bg-dark-danger'
        : remaining === 0
        ? 'bg-success dark:bg-dark-success'
        : 'bg-primary dark:bg-dark-primary'

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
        <div
            style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 50 }}
            className={`flex flex-col items-center px-5 py-2 rounded-lg shadow-lg cursor-grab active:cursor-grabbing select-none ${counterColor}`}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
        >
            <span className="text-3xl font-bold text-white leading-none">{Math.abs(remaining)}</span>
            <span className="text-xs font-medium text-white/80 uppercase tracking-wide mt-0.5">
                {remaining < 0 ? 'overbooked' : `slot${remaining !== 1 ? 's' : ''} remaining`}
            </span>
        </div>
        <FillRequestWorkerList
            workers={workers}
            laborRequirementType={laborRequirement?.labor_type}
        />
        </>
    )


}
