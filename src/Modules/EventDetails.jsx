import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { LaborRequirementStatus } from './LaborRequirementStatus'
import { Dropdown } from '../components/Dropdown'
import { SignInStationModal } from '../components/SignInStationModal'
import { useMessages } from '../contexts/MessageContext'
import { ConfirmDialog } from '../components/ConfirmDialog'


export function EventDetails() {
    const navigate = useNavigate()
    const { slug } = useParams()
    const [currentDropdown, setCurrentDropdown] = useState(null)
    const [selectedIndexCallTime, setSelectedIndexCallTime] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [actionsOpen, setActionsOpen] = useState(false)
    const [actionsSelectedIndex, setActionsSelectedIndex] = useState(0)
    const queryClient = useQueryClient()
    const { addMessage } = useMessages()
    const [refreshKey, setRefreshKey] = useState(0)
    const [stationModalOpen, setStationModalOpen] = useState(false)
    const [isLegendOpen, setIsLegendOpen] = useState(false)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [deleteCallTimeSlug, setDeleteCallTimeSlug] = useState(null)

    const { data, error, isLoading } = useQuery({
        queryKey: ['eventDetails', slug, refreshKey],
        queryFn: async () => {
            const response = await api.get(`/event/${slug}`)
            return response.data
        }
    })

    const sendMessagesMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post(`/event/${slug}/send-messages/`)
            return response.data
        },
        onSuccess: (data) => {
            const type = data.message.toLowerCase().includes('no') || data.message.toLowerCase().includes('error') ? 'error' : 'success'
            addMessage(data.message, type)
        },
        onError: (error) => {
            addMessage('Error sending messages: ' + error.message, 'error')
        }
    })

    const deleteCallTimeMutation = useMutation({
        mutationFn: async (callTimeSlug) => {
            const response = await api.delete(`/call-times/${callTimeSlug}/delete/`)
            return response.data
        },
        onMutate: async (callTimeSlug) => {
            // Optimistically remove the call time
            queryClient.setQueryData(['eventDetails', slug, refreshKey], (oldData) => {
                if (oldData) {
                    return {
                        ...oldData,
                        call_times: oldData.call_times.filter(ct => ct.slug !== callTimeSlug)
                    }
                }
                return oldData
            })
            setCurrentDropdown(null)
            setDeleteCallTimeSlug(null)
        },
        onSuccess: (data) => {
            addMessage(data.message, 'success')
        },
        onError: (error) => {
            // Refetch to restore if error
            queryClient.invalidateQueries(['eventDetails', slug])
            addMessage('Error deleting call time: ' + error.message, 'error')
        }
    })



    const cancelEventMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post(`/event/${slug}/cancel/`)
            return response.data
        },
        onSuccess: (data) => {
            setCancelDialogOpen(false)
            addMessage(data.message, 'success')
            if (data.sms_errors?.length > 0) {
                addMessage(`SMS errors: ${data.sms_errors.join(', ')}`, 'error')
            }
            queryClient.invalidateQueries({ queryKey: ['eventDetails', slug] })
            queryClient.invalidateQueries({ queryKey: ['events'] })
        },
        onError: (error) => {
            addMessage('Error canceling event: ' + (error.response?.data?.message || error.message), 'error')
        }
    })

    const sendCallTimeMessages = async (callTimeSlug) => {
        try {
            const response = await api.post(`/call-times/${callTimeSlug}/send-messages/`)
            const type = response.data.message.toLowerCase().includes('no') || response.data.message.toLowerCase().includes('error') ? 'error' : 'success'
            addMessage(response.data.message, type)
        } catch (error) {
            addMessage('Error sending messages: ' + error.message, 'error')
        }
    }

    const sendReminder = async (callTimeSlug) => {
        try {
            const response = await api.post(`/call-times/${callTimeSlug}/send-reminder/`)
            addMessage(response.data.message, 'success')
        } catch (error) {
            addMessage('Error sending reminder: ' + (error.response?.data?.message || error.message), 'error')
        }
    }


    

    function convertto12Hour(time24) {
        if (time24 === null) {
            return ""
        }
        const [hours, minutes] = time24.split(':');
        const period = hours >= 12 ? 'PM' : 'AM';
        let hours12 = hours % 12;
        hours12 = hours12 ? hours12 : 12;
        return `${hours12}:${minutes} ${period}`;
    }

    function handleNavigateTo(path) {
        navigate(path)
    }

    const toggleDropdown = (callTimeSlug) => {
        setCurrentDropdown(currentDropdown === callTimeSlug ? null : callTimeSlug)
        if (currentDropdown !== callTimeSlug) {
            setSelectedIndexCallTime(callTimeSlug)
            setSelectedIndex(0)
        } else {
            setSelectedIndexCallTime(null)
        }
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    function sortCallTimes(callTimes) {
        //sorts call times by call_unixtime
        return callTimes.sort((a, b) => {
            return a.call_unixtime - b.call_unixtime
        })
    }
    const callTimes = data?.call_times
    const sortedCallTimes = sortCallTimes(callTimes)

    if (!data || !data.event) return <div>Event not found.</div>

    return (
        <div>
            <h1 className="text-3xl ml-5 font-bold mb-6 text-text-heading dark:text-dark-text-primary">
                {data.event.event_name}
                {data.event.canceled && (
                    <span className="ml-3 text-lg font-medium text-danger dark:text-dark-danger">Canceled</span>
                )}
            </h1>

            {(() => {
                const actionsItems = [
                    { text: 'Edit Event', onClick: () => navigate(`/dash/event/${slug}/edit`) },
                    { text: 'Send Messages', onClick: () => sendMessagesMutation.mutate(), disabled: sendMessagesMutation.isPending },
                    ...(!data.event.canceled ? [{ text: 'Cancel Event', onClick: () => setCancelDialogOpen(true), className: 'text-danger dark:text-dark-danger' }] : []),
                ]
                if (data.event.company?.time_tracking) {
                    actionsItems.push(
                        { text: 'Send QR to all', onClick: () => {} },
                        { text: 'Scan QR Code', onClick: () => navigate(`/dash/event/${slug}/scan-qr`) },
                        { text: 'Sign In Station', onClick: () => setStationModalOpen(true) }
                    )
                }
                return (
                    <div className="mb-6 ml-5 relative">
                        <button
                            onClick={() => setActionsOpen(!actionsOpen)}
                            className="shadow-sm shadow-secondary dark:shadow-dark-secondary bg-primary text-dark-text-primary p-4 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover flex items-center"
                        >
                            Actions
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <Dropdown
                            items={actionsItems}
                            isOpen={actionsOpen}
                            onClose={() => setActionsOpen(false)}
                            selectedIndex={actionsSelectedIndex}
                            onSelect={setActionsSelectedIndex}
                            position="left-0"
                            size="w-48"
                        />
                    </div>
                )
            })()}


            <div className="bg-card-bg p-6 rounded-lg shadow mb-6 dark:bg-dark-card-bg dark:shadow-dark-shadow">
                <p className="text-text-tertiary dark:text-dark-text-tertiary">
                    <strong>Date:</strong> {data.event.is_single_day
                        ? new Date(data.event.start_date + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : `${new Date(data.event.start_date + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${new Date(data.event.end_date + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                </p>
                <p className="text-text-tertiary dark:text-dark-text-tertiary">
                    <strong>Location:</strong> {data.event.location_profile?.name || "Not specified"}
                </p>
                <p className="text-text-tertiary dark:text-dark-text-tertiary">
                    {data.event.event_description || "No description provided"}
                </p>
            </div>

            <div className="divide-y divide-primary dark:divide-dark-primary bg-card-bg p-2 w-full rounded-lg shadow mb-6 dark:bg-dark-card-bg dark:shadow-dark-shadow">
                <h2 className="text-xl font-semibold mb-4 text-text-heading dark:text-dark-text-primary">Call Times</h2>
                
                {sortedCallTimes?.length > 0 ? (
                    sortedCallTimes.map((callTime) => (
                        <div key={callTime.slug} className="mb-4">
                            <h3 className="text-lg font-semibold text-text-heading dark:text-dark-text-primary">
                                <a href={`/dash/call-times/${callTime.slug}/requests`} className="text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover">
                                    {callTime.name} - {convertto12Hour(callTime.time)} {!data.event.is_single_day && callTime.date}
                                </a>
                                
                                <div className="relative inline-block">
                                    <button 
                                        onClick={() => toggleDropdown(callTime.slug)}
                                        className="ml-2 mt-1 shadow-sm shadow-secondary dark:shadow-dark-secondary bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover flex items-center"
                                    >
                                        Actions
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    
                                    <Dropdown
                                        items={[
                                            ...(data.event.company?.time_tracking ? [{ text: 'Time Sheet', onClick: () => navigate(`/dash/call-times/${callTime.slug}/tracking`) }] : []),
                                            { text: 'Edit Call Time', onClick: () => navigate(`/dash/events/${slug}/call-times/${callTime.slug}/edit`) },
                                            { text: 'Copy Call Time', onClick: () => navigate(`/dash/events/${slug}/add-call-time?copy=${callTime.slug}`) },
                                            ...(callTime.time_has_changed ? [{ text: 'Confirmations', onClick: () => navigate(`/dash/events/${slug}/call-times/${callTime.slug}/confirmations`) }] : []),
                                            { text: 'Send Reminder', onClick: () => sendReminder(callTime.slug) },
                                            { text: 'Delete', onClick: () => setDeleteCallTimeSlug(callTime.slug), className: 'text-danger dark:text-dark-danger' }
                                        ]}
                                        isOpen={currentDropdown === callTime.slug}
                                        onClose={() => setCurrentDropdown(null)}
                                        selectedIndex={selectedIndexCallTime === callTime.slug ? selectedIndex : 0}
                                        onSelect={(index) => { setSelectedIndexCallTime(callTime.slug); setSelectedIndex(index) }}
                                    />
                                </div>
                                
                                <button
                                    onClick={() => sendCallTimeMessages(callTime.slug)}
                                    className="shadow-sm shadow-secondary dark:shadow-dark-secondary bg-success text-dark-text-primary ml-2 p-2 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover"
                                >
                                    Send Call Time
                                </button>
                            </h3>
                            
                            <ul className="mt-2 divide-y divide-success dark:divide-dark-secondary mb-2">
                                {callTime.labor_requirements?.map((labor) => (
                                    <li key={labor.slug} className="p-1 flex rounded-md box-shadow shadow-md shadow-neutral-400 inset-shadow-md dark:shadow-neutral-800 justify-between bg-body-bg dark:bg-dark-card-bg items-center">
                                        <LaborRequirementStatus laborSlug={labor.slug} eventSlug={slug} />
                                    </li>
                                ))}
                            </ul>
                            
                            <button 
                                onClick={() => navigate(`/dash/events/${slug}/add-labor/${callTime.slug}`)}
                                className="inline-block bg-primary text-dark-text-primary px-2 py-1 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                            >
                                Add Labor
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-text-secondary dark:text-dark-text-secondary">No call times defined yet.</p>
                )}
                
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => navigate(`/dash/events/${slug}/add-call-time`)}
                        className="inline-block bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                    >
                        Add Call Time
                    </button>
                    <button
                        onClick={() => navigate(`/dash/event/${slug}/scan-qr`)}
                        className="inline-block bg-success text-dark-text-primary p-2 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover"
                    >
                        Scan QR Code
                    </button>
                </div>
            </div>
            <details onToggle={(e) => setIsLegendOpen(e.target.open)} className="border border-gray-200 dark:border-dark-border rounded-lg p-4 mt-4 group">
                <summary className="text-2xl font-semibold cursor-pointer flex justify-between">
                    <span>{isLegendOpen ? '−' : '+'} Legend</span>
                </summary>
                <div className="overflow-hidden transition-all duration-300 max-h-0 group-open:max-h-96">
                    <div className="mt-4 space-y-2">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-success dark:bg-dark-success rounded-full mr-2"></div>
                                <span className="text-text-primary dark:text-dark-text-primary">Confirmed</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-bg-available dark:bg-dark-bg-available rounded-full mr-2"></div>
                                <span className="text-text-primary dark:text-dark-text-primary">Available</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-yellow dark:bg-dark-yellow rounded-full mr-2"></div>
                                <span className="text-text-primary dark:text-dark-text-primary">Pending</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-danger dark:bg-dark-danger rounded-full mr-2"></div>
                                <span className="text-text-primary dark:text-dark-text-primary">Declined</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-success dark:text-dark-success mr-2 font-semibold">Filled</span>
                                <span className="text-text-primary dark:text-dark-text-primary">Filled Status</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-danger dark:text-dark-danger mr-2 font-semibold">Overbooked</span>
                                <span className="text-text-primary dark:text-dark-text-primary">Overbooked Status</span>
                            </div>
                        </div>
                    </div>
                </div>
            </details>
            <SignInStationModal isOpen={stationModalOpen} onClose={() => setStationModalOpen(false)} slug={slug} />
            <ConfirmDialog
                isOpen={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                onConfirm={() => cancelEventMutation.mutate()}
                title="Cancel Event"
                message="This will cancel the event and notify all workers via SMS."
                confirmWord="CANCEL"
                isPending={cancelEventMutation.isPending}
            />
            <ConfirmDialog
                isOpen={!!deleteCallTimeSlug}
                onClose={() => setDeleteCallTimeSlug(null)}
                onConfirm={() => deleteCallTimeMutation.mutate(deleteCallTimeSlug)}
                title="Delete Call Time"
                message="Are you sure you want to delete this call time?"
                isPending={deleteCallTimeMutation.isPending}
            />
        </div>
    )
}
