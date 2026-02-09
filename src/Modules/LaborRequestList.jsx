import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'
import { useMessages } from '../contexts/MessageContext'

export function LaborRequestList({
    callTime = null,
    laborRequirement = null,
    laborRequests = [],
    laborTypes = [],
    title,
    backUrl,
    backText = "Back",
    isCallTimePage = false
}) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { addMessage } = useMessages()

    const [selectedLaborType, setSelectedLaborType] = useState('All')

    // Determine if we're showing a call time (multiple labor types) or single labor requirement
    const isCallTime = !!callTime
    const displayTitle = title || (isCallTime 
        ? `Requests for ${callTime.name} at ${callTime.time} on ${callTime.date}`
        : `${laborRequirement.labor_type.name} - ${laborRequirement.needed_labor} needed`
    )

    const handleRequestMutation = useMutation({
        mutationFn: async ({ laborRequest, action, avresponse }) => {

            const response = await api.post(`/request/${laborRequest}/action/`, {
                action: action,
                response: avresponse
            })
            return response.data

        },
        onSuccess: () => {
            const queryKey = isCallTime
                ? ['callTimeRequests', callTime.slug]
                : ['laborRequests', laborRequirement.slug]
            queryClient.invalidateQueries(queryKey)
            addMessage('Request updated successfully', 'success')
        }
    })

    const bulkConfirmMutation = useMutation({
        mutationFn: async (laborRequestIds) => {
            const response = await api.post('/confirm/bulk/', {
                labor_requests: laborRequestIds.map(id => ({ id }))
            })
            return response.data
        },
        onSuccess: (data) => {
            const queryKey = isCallTime
                ? ['callTimeRequests', callTime.slug]
                : ['laborRequests', laborRequirement.slug]
            queryClient.invalidateQueries(queryKey)
            addMessage(data.message, 'success')
        },
        onError: (error) => {
            addMessage('Error confirming requests: ' + error.message, 'error')
        }
    })

    const handleRequestAction = (laborRequest, action, avresponse) => {
        handleRequestMutation.mutate({ laborRequest, action, avresponse })

    }

    const handleBulkConfirm = (requests) => {
        const ids = requests.map(req => req.id)
        if (ids.length === 0) {
            addMessage('No requests to confirm', 'info')
            return
        }
        bulkConfirmMutation.mutate(ids)
    }

    // Filter requests by type
    const pendingRequests = laborRequests.filter(req => !req.availability_response)
    const availableRequests = laborRequests.filter(req => req.availability_response === 'yes' && !req.confirmed)
    const confirmedRequests = laborRequests.filter(req => req.confirmed && !req.canceled && !req.ncns)
    const declinedRequests = laborRequests.filter(req => req.availability_response === 'no' && !req.canceled && !req.ncns)
    const ncnsRequests = laborRequests.filter(req => req.ncns)
    const canceledRequests = laborRequests.filter(req => req.canceled)

    // Filter by labor type if selected (only for call times)
    const filterByLaborType = (requests) => {
        if (!isCallTime || selectedLaborType === 'All') return requests
        return requests.filter(req => req.labor_requirement.labor_type.id.toString() === selectedLaborType)
    }

    const RequestList = ({ requests, title, textColor, actionButtons, bulkConfirm }) => (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <h2 className={`text-xl font-semibold ${textColor}`}>{title}</h2>
                {bulkConfirm?.show && (
                    <button
                        onClick={() => bulkConfirm.onConfirm(requests)}
                        disabled={bulkConfirmMutation.isPending}
                        className="bg-success text-dark-text-primary px-4 py-2 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover disabled:opacity-50"
                    >
                        {bulkConfirmMutation.isPending ? 'Confirming...' : bulkConfirm.label}
                    </button>
                )}
            </div>
            {requests.length > 0 ? (
                <ul className="space-y-2 mb-4">
                    {requests.map((request) => (
                        <li key={request.id} className={`flex items-center justify-between ${textColor}`}>
                            <span>
                                {request.worker.name || "Unnamed Worker"} ({request.worker.phone_number})
                                {request.worker.nocallnoshow >= 2 && (
                                    <span className="text-text-purple dark:text-dark-text-purple ml-2">
                                        {request.worker.nocallnoshow} NCNS
                                    </span>
                                )}
                                {!request.sms_sent && (
                                    <span className="text-text-available dark:text-dark-text-available ml-2">
                                        Not Sent
                                    </span>
                                )}
                                {request.sent_consent_msg && !request.worker.sms_consent && (
                                    <span className="text-text-purple dark:text-dark-text-purple ml-2">
                                        Pending Consent
                                    </span>
                                )}
                                
                                {isCallTime && ` - ${request.labor_requirement.labor_type.name}`}
                            </span>
                            <div className="space-x-2">
                                {actionButtons.map((button, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleRequestAction(request.token_short, button.action, button.response)}
                                        className={button.className}
                                        disabled={handleRequestMutation.isPending}
                                    >
                                        {button.text}
                                    </button>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
                    No {title.toLowerCase()} found.
                </p>
            )}
        </div>
    )

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-primary">
                    {displayTitle}
                </h1>
                <a 
                    href="#" 
                    onClick={() => navigate(backUrl)}
                    className="text-2xl text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover"
                >
                    {backText}
                </a>
            </div>

            <div className="bg-card-bg p-6 rounded-lg shadow-md max-w-6xl mx-auto dark:bg-dark-card-bg dark:shadow-dark-shadow">
                {/* Labor Type Filter - only show for call times */}
                {isCallTime && laborTypes?.length > 0 && (
                    <div className="mb-6">
                        <label htmlFor="labor_type" className="block mb-2 text-text-heading dark:text-dark-text-primary">
                            Filter by Labor Type:
                        </label>
                        <select
                            id="labor_type"
                            value={selectedLaborType}
                            onChange={(e) => setSelectedLaborType(e.target.value)}
                            className="p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        >
                            <option value="All">All Labor Types</option>
                            {laborTypes.map((laborType) => (
                                <option key={laborType.id} value={laborType.id}>
                                    {laborType.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Pending Requests */}
                <RequestList
                    requests={filterByLaborType(pendingRequests)}
                    title="Pending Requests"
                    textColor="text-text-yellow dark:text-dark-text-yellow"
                    actionButtons={[
                        {
                            text: "Confirm",
                            action: "confirm",
                            response: "yes",
                            className: "bg-success text-dark-text-primary px-2 py-1 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover"
                        },
                        {
                            text: "Decline",
                            action: "decline",
                            response: "no",
                            className: "bg-danger text-dark-text-primary px-2 py-1 rounded hover:bg-danger-hover dark:bg-dark-danger dark:hover:bg-dark-danger-hover"
                        },
                        {
                            text: "Delete",
                            action: "delete",
                            response: "delete",
                            className: "bg-secondary text-dark-text-primary px-2 py-1 rounded hover:bg-secondary-hover dark:bg-dark-secondary dark:hover:bg-dark-secondary-hover"
                        }
                    ]}
                    bulkConfirm={isCallTimePage ? {
                        show: true,
                        onConfirm: handleBulkConfirm,
                        label: 'Confirm All'
                    } : undefined}
                />

                {/* Available Requests */}
                <RequestList
                    requests={filterByLaborType(availableRequests)}
                    title="Available Requests"
                    textColor="text-text-available dark:text-dark-text-available"
                    actionButtons={[
                        {
                            text: "Confirm",
                            action: "confirm",
                            response: "yes",
                            className: "bg-success text-dark-text-primary px-2 py-1 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover"
                        },
                        {
                            text: "Decline",
                            action: "decline",
                            response: "no",
                            className: "bg-danger text-dark-text-primary px-2 py-1 rounded hover:bg-danger-hover dark:bg-dark-danger dark:hover:bg-dark-danger-hover"
                        },
                        {
                            text: "Delete",
                            action: "delete",
                            response: "delete",
                            className: "bg-secondary text-dark-text-primary px-2 py-1 rounded hover:bg-secondary-hover dark:bg-dark-secondary dark:hover:bg-dark-secondary-hover"
                        }
                    ]}
                    bulkConfirm={isCallTimePage ? {
                        show: true,
                        onConfirm: handleBulkConfirm,
                        label: 'Confirm All'
                    } : undefined}
                />

                {/* Confirmed Requests */}
                <RequestList
                    requests={filterByLaborType(confirmedRequests)}
                    title="Confirmed Requests"
                    textColor="text-text-green dark:text-dark-text-green"
                    actionButtons={[
                        {
                            text: "Decline",
                            action: "decline",
                            response: "no",
                            className: "bg-danger text-dark-text-primary px-2 py-1 rounded hover:bg-danger-hover dark:bg-dark-danger dark:hover:bg-dark-danger-hover"
                        },
                        {
                            text: "Cancel",
                            action: "cancel",
                            response: "cancel",
                            className: "bg-danger text-dark-text-primary px-2 py-1 rounded hover:bg-danger-hover dark:bg-dark-danger dark:hover:bg-dark-danger-hover"
                        },
                        {
                            text: "NCNS",
                            action: "ncns",
                            response: "ncns",
                            className: "bg-purple text-dark-text-primary px-2 py-1 rounded hover:bg-purple-hover dark:bg-dark-purple dark:hover:bg-dark-purple-hover"
                        },
                        {
                            text: "Delete",
                            action: "delete",
                            response: "delete",
                            className: "bg-secondary text-dark-text-primary px-2 py-1 rounded hover:bg-secondary-hover dark:bg-dark-secondary dark:hover:bg-dark-secondary-hover"
                        }
                    ]}
                />

                {/* Declined Requests */}
                <RequestList
                    requests={filterByLaborType(declinedRequests)}
                    title="Declined Requests"
                    textColor="text-text-red dark:text-dark-text-red"
                    actionButtons={[
                        {
                            text: "Confirm",
                            action: "confirm",
                            response: "yes",
                            className: "bg-success text-dark-text-primary px-2 py-1 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover"
                        }
                    ]}
                />

                {/* Canceled Requests */}
                <RequestList
                    requests={filterByLaborType(canceledRequests)}
                    title="Canceled Requests"
                    textColor="text-text-red dark:text-dark-text-red"
                    actionButtons={[
                        {
                            text: "Confirm",
                            action: "confirm",
                            response: "yes",
                            className: "bg-success text-dark-text-primary px-2 py-1 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover"
                        }
                    ]}

                />
                {/* No Call No Show */}
                <RequestList
                    requests={filterByLaborType(ncnsRequests)}
                    title="No Call No Show"
                    textColor="text-text-purple dark:text-dark-text-purple"
                    actionButtons={[
                        {
                            text: "Confirm",
                            action: "confirm",
                            className: "bg-success text-dark-text-primary px-2 py-1 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover"
                        }
                    ]}
                />
            </div>

        </div>

    )
    
}
