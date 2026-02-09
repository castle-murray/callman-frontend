import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import api from '../api'
import { useMessages } from '../contexts/MessageContext'

export function FillRequestWorkerList({ 
    workers,
    laborRequirementType,
}) {
    const navigate = useNavigate()
    const { slug } = useParams()
    const queryClient = useQueryClient()
    const { addMessage } = useMessages()
    const [selectedWorkers, setSelectedWorkers] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [perPage, setPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedPhones, setSelectedPhones] = useState({})

    function formatPhoneNumber(phoneNumber) {
        if (!phoneNumber) return null
        
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '')
        
        // Handle different formats
        let digits = cleaned
        if (cleaned.startsWith('1') && cleaned.length === 11) {
            // Remove country code 1 for US numbers
            digits = cleaned.slice(1)
        } else if (cleaned.length === 10) {
            // Already 10 digits, use as is
            digits = cleaned
        }
        
        // Format as (XXX) XXX-XXXX if we have 10 digits
        const match = digits.match(/^(\d{3})(\d{3})(\d{4})$/)
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`
        }
        
        // Return original if we can't format it
        return phoneNumber
    }

    const handleWorkerSelect = (workerId) => {
        if (selectedWorkers.includes(workerId)) {
            setSelectedWorkers(selectedWorkers.filter(id => id !== workerId))
        } else {
            setSelectedWorkers([...selectedWorkers, workerId])
        }
    }

    const requestWorkerMutation = useMutation({
        mutationFn: async (workerId) => {
            const response = await api.post(`/request/${slug}/worker/`, {
                worker_id: workerId,
                action: 'request'
            })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['fillRequestList', slug])
            addMessage('Worker requested successfully', 'success')
        }
    })

    const requestWorker = (workerId) => {
        requestWorkerMutation.mutate(workerId)
    }

    const reserveWorkerMutation = useMutation({
        mutationFn: async (workerId) => {
            const response = await api.post(`/request/${slug}/worker/`, {
                worker_id: workerId,
                action: 'reserve'
            })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['fillRequestList', slug])
            addMessage('Worker reserved successfully', 'success')
        }
    })

    const reserveWorker = (workerId) => {
        reserveWorkerMutation.mutate(workerId)
    }

    const reserveWorkersMutation = useMutation({
        mutationFn: async () => {
            const promises = selectedWorkers.map(workerId =>
                api.post(`/request/${slug}/worker/`, {
                    worker_id: workerId,
                    action: 'reserve'
                })
            )
            return Promise.all(promises)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['fillRequestList', slug])
            setSelectedWorkers([])
            addMessage('Workers reserved successfully', 'success')
        }
    })

    const reserveWorkers = () => {
        reserveWorkersMutation.mutate()
    }

    // First filter by search query
    const searchFilteredWorkers = workers.filter(worker => {
        if (!searchQuery.trim()) return true
        
        const query = searchQuery.toLowerCase()

        return worker.name.toLowerCase().includes(query) ||
               worker.phone_number.toLowerCase().includes(query)
    })

    // Then separate by labor type match
    const matchedWorkers = searchFilteredWorkers.filter(worker => 
        worker.labor_types.some(type => type.id === laborRequirementType?.id)
    )
    const unmatchedWorkers = searchFilteredWorkers.filter(worker => 
        !worker.labor_types.some(type => type.id === laborRequirementType?.id)
    )

    // Combine with matched workers first
    const allWorkers = [...matchedWorkers, ...unmatchedWorkers]

    // Pagination
    const totalPages = Math.ceil(allWorkers.length / perPage)
    const startIndex = (currentPage - 1) * perPage
    const paginatedWorkers = allWorkers.slice(startIndex, startIndex + perPage)

    return (
        <div id="fill-list" className="mt-4">
            {allWorkers.length > 0 && (
                <div className="flex justify-between items-center">
                    <div className="mb-4 flex items-center">
                        <label htmlFor="per_page" className="mr-4 text-text-tertiary dark:text-dark-text-tertiary">
                            Items per page:
                        </label>
                        <select 
                            name="per_page" 
                            id="per_page"
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value))
                                setCurrentPage(1)
                            }}
                            className="p-2 pr-8 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or phone..."
                            className="p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                    </div>
                </div>
            )}

            {selectedWorkers.length > 0 && (
                <div className="mb-4">
                    <button 
                        onClick={reserveWorkers}
                        className="bg-success text-dark-text-primary px-4 py-2 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover"
                        disabled={reserveWorkersMutation.isPending}
                    >
                        Reserve {selectedWorkers.length} Selected Workers
                    </button>
                </div>
            )}

            <div className="bg-card-bg p-6 rounded-lg shadow-md dark:bg-dark-card-bg dark:shadow-dark-shadow">
                {paginatedWorkers.length > 0 ? (
                    <ul className="space-y-2">
                        {paginatedWorkers.map((worker) => (
                            <li key={worker.id} className={`flex justify-between items-center p-2 rounded ${
                                worker.conflicts?.some(c => c.status === 'Confirmed') 
                                    ? 'bg-light-green dark:bg-dark-bg-light-green' 
                                    : worker.conflicts?.length > 0 
                                    ? 'bg-light-yellow dark:bg-dark-bg-light-yellow' 
                                    : ''
                            } text-text-tertiary dark:text-dark-text-tertiary`}>
                                <div>
                                    <div className="font-medium">
                                        {worker.name || "Unnamed Worker"} - {worker.formatted_phone_number || formatPhoneNumber(worker.phone_number) || "No phone"}

                                        {worker.alt_phones && worker.alt_phones.length > 0 && (
                                            <div className="ml-4 mt-1">
                                                {worker.alt_phones.map(alt => (
                                                    <div key={alt.id} className="text-sm text-text-secondary dark:text-dark-text-secondary">
                                                        {alt.label}: {formatPhoneNumber(alt.phone_number)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {!worker.sent_consent_msg && (
                                            <span className="text-text-yellow dark:text-dark-text-yellow text-sm">
                                                - Requires Consent
                                            </span>
                                        )}
                                        
                                        {worker.stop_sms && (
                                            <span className="text-text-red dark:text-dark-text-red text-sm font-semibold">
                                                - BLOCKED
                                            </span>
                                        )}
                                        
                                        {worker.sent_consent_msg && !worker.sms_consent && (
                                            <span className="text-text-blue dark:text-dark-text-blue text-sm">
                                                - Consent Pending
                                            </span>
                                        )}
                                        
                                        {worker.nocallnoshow >= 2 && (
                                            <span className="text-text-purple dark:text-dark-text-purple text-sm ml-2">
                                                - {worker.nocallnoshow} NCNS
                                            </span>
                                        )}
                                        
                                        {worker.canceled_requests > 0 && (
                                            <span className="text-text-red dark:text-dark-text-red text-sm ml-2">
                                                - {worker.canceled_requests} Cancels
                                            </span>
                                        )}
                                    </div>
                                    
                                    {worker.conflicts?.length > 0 && (
                                        <ul className="ml-4 mt-1 text-sm">
                                            {worker.conflicts.map((conflict, index) => (
                                                <li key={index} className={
                                                    conflict.confirmed
                                                        ? 'text-text-green dark:text-dark-text-green'
                                                        : conflict.availability_response === 'yes'
                                                        ? 'text-text-blue dark:text-dark-text-blue'
                                                        : conflict.availability_response === 'no'
                                                        ? 'text-text-red dark:text-dark-text-red'
                                                        : 'text-text-yellow dark:text-dark-text-yellow'
                                                }>
                                                    <span className="font-medium">
                                                        {conflict.confirmed
                                                            ? 'Confirmed' 
                                                            : conflict.availability_response === 'yes' 
                                                            ? 'Available' 
                                                            : conflict.availability_response === 'no' 
                                                            ? 'Declined' : 'Pending'}
                                                </span> - {conflict.event} ({conflict.call_time}, {conflict.labor_type})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    {worker.requested ? (
                                        <span className="text-text-green dark:text-dark-text-green font-medium">
                                        Requested
                                        </span>
                                    ) : (
                                        <>
                                    <button
                                        onClick={() => requestWorker(worker.id)}
                                        className="bg-primary text-dark-text-primary px-2 py-1 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                                        disabled={requestWorkerMutation.isPending}
                                    >
                                        Request
                                    </button>
                                    <button
                                        onClick={() => reserveWorker(worker.id)}
                                        className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                        disabled={reserveWorkerMutation.isPending}
                                    >
                                        Reserve
                                    </button>
                                        </>
                                        )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-text-secondary dark:text-dark-text-secondary">
                        No workers found matching your search criteria.
                    </p>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-6 space-x-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded bg-card-bg text-text-tertiary disabled:opacity-50 dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        >
                            Previous
                        </button>
                        <span className="text-text-tertiary dark:text-dark-text-tertiary">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded bg-card-bg text-text-tertiary disabled:opacity-50 dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
