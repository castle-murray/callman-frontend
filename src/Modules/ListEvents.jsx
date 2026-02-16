import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'
import { UpcomingEvents } from './UpcomingEvents'
import { PendingRequests } from './PendingRequests'
import { DeclinedCount } from './DeclinedCount'
import { SMSCount } from './SmsCount'
import { MainMenu } from './MainMenu'
import { useMessages } from '../contexts/MessageContext'
import { ConfirmDialog } from '../components/ConfirmDialog'

function StewardInvite() {
    const [search, setSearch] = useState('')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [selectedWorker, setSelectedWorker] = useState(null)
    const searchRef = useRef(null)
    const queryClient = useQueryClient()
    const { addMessage } = useMessages()

    const { data: workersData } = useQuery({
        queryKey: ['workers'],
        queryFn: async () => {
            const response = await api.get('/workers/')
            return response.data
        }
    })

    const inviteMutation = useMutation({
        mutationFn: async (worker) => {
            const response = await api.post('/send-steward-invite/', {
                phone: worker.phone_number,
                name: worker.name
            })
            return response.data
        },
        onSuccess: (data) => {
            addMessage(data.message, 'success')
            setSearch('')
            setSelectedWorker(null)
            queryClient.invalidateQueries(['stewards'])
        },
        onError: (error) => {
            addMessage(error.response?.data?.message || 'Failed to send steward invite', 'error')
        }
    })

    const filteredWorkers = workersData?.workers?.filter(worker => {
        if (!search.trim()) return false
        const query = search.toLowerCase()
        return worker.name?.toLowerCase().includes(query) ||
               worker.phone_number?.includes(query)
    })?.slice(0, 8) || []

    const selectWorker = (worker) => {
        setSelectedWorker(worker)
        setSearch(worker.name || worker.phone_number)
        setDropdownOpen(false)
        setHighlightedIndex(-1)
    }

    const handleKeyDown = (e) => {
        if (!dropdownOpen || filteredWorkers.length === 0) {
            if (e.key === 'Enter' && selectedWorker) {
                e.preventDefault()
                inviteMutation.mutate(selectedWorker)
            }
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlightedIndex(prev => prev < filteredWorkers.length - 1 ? prev + 1 : 0)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlightedIndex(prev => prev > 0 ? prev - 1 : filteredWorkers.length - 1)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (highlightedIndex >= 0 && highlightedIndex < filteredWorkers.length) {
                selectWorker(filteredWorkers[highlightedIndex])
            }
        } else if (e.key === 'Escape') {
            setDropdownOpen(false)
            setHighlightedIndex(-1)
        }
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setDropdownOpen(false)
                setHighlightedIndex(-1)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-2 text-text-heading dark:text-dark-text-primary">Invite Steward</h3>
            <div className="flex gap-2 items-start">
                <div className="relative flex-1 max-w-md" ref={searchRef}>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setSelectedWorker(null)
                            setDropdownOpen(true)
                            setHighlightedIndex(-1)
                        }}
                        onFocus={() => { if (!selectedWorker) setDropdownOpen(true) }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search workers by name or phone..."
                        className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                    />
                    {dropdownOpen && filteredWorkers.length > 0 && (
                        <ul className="absolute z-20 w-full mt-1 bg-card-bg dark:bg-dark-card-bg border dark:border-dark-border rounded shadow-lg max-h-60 overflow-y-auto">
                            {filteredWorkers.map((worker, index) => (
                                <li
                                    key={worker.id}
                                    onClick={() => selectWorker(worker)}
                                    className={`px-3 py-2 cursor-pointer text-text-tertiary dark:text-dark-text-tertiary ${
                                        index === highlightedIndex
                                            ? 'bg-primary/10 dark:bg-dark-primary/20'
                                            : 'hover:bg-body-bg dark:hover:bg-dark-body-bg'
                                    }`}
                                >
                                    <span className="font-medium">{worker.name || 'Unnamed'}</span>
                                    <span className="ml-2 text-text-secondary dark:text-dark-text-secondary text-sm">
                                        {worker.phone_number}
                                    </span>
                                    {worker.is_steward && (
                                        <span className="ml-2 text-text-green dark:text-dark-text-green text-sm">
                                            Already Steward
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button
                    onClick={() => selectedWorker && inviteMutation.mutate(selectedWorker)}
                    disabled={!selectedWorker || inviteMutation.isPending}
                    className="bg-primary text-dark-text-primary px-4 py-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                >
                    {inviteMutation.isPending ? 'Sending...' : 'Invite'}
                </button>
            </div>
        </div>
    )
}

function upcomingEvents(events) {
    if (!events) return []
    
    const upcoming = []
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 2)
    yesterday.setHours(0, 0, 0, 0)
    
    for (const event of events) {
        const compareDate = new Date(event.end_date)
        compareDate.setHours(0, 0, 0, 0)
        
        if (compareDate >= yesterday) {
            upcoming.push(event)
        }
    }
    return upcoming
}

function filterEvents(events, searchQuery) {
    if (!searchQuery.trim()) return events
    
    const terms = searchQuery.toLowerCase().split(' ').filter(term => term.trim())
    
    return events.filter(event => {
        return terms.every(term => 
            event.event_name.toLowerCase().includes(term) ||
            event.location.toLowerCase().includes(term) ||
            (event.event_description && event.event_description.toLowerCase().includes(term))
        )
    })
}

export function ListEvents() {
  const [includePast, setIncludePast] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [cancelSlug, setCancelSlug] = useState(null)
  const [deleteSlug, setDeleteSlug] = useState(null)
  const eventsPerPage = 10
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addMessage } = useMessages()

  // Debounce search with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to first page when search changes
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data, error, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get('/events/list')
      for (const event of response.data) {
        if (event.location_profile) {
          event.location = event.location_profile.name
        } else {
          event.location = 'No location'
        }

      }
      return response.data
    }
  })

  const { data: stewards } = useQuery({
    queryKey: ['stewards'],
    queryFn: async () => {
      const response = await api.get('/stewards/')
      return response.data
    }
  })

  const assignStewardMutation = useMutation({
    mutationFn: async ({ eventSlug, stewardId }) => {
      const response = await api.post(`/event/${eventSlug}/assign-steward/`, { steward_id: stewardId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events'])
      addMessage('Steward assigned successfully', 'success')
    },
    onError: (error) => {
      addMessage('Failed to assign steward: ' + error.message, 'error')
    }
  })

  const deleteEventMutation = useMutation({
      mutationFn: async (eventSlug) => {
          const response = await api.delete(`/event/${eventSlug}/`)
          return response.data
      },
      onSuccess: () => {
          setDeleteSlug(null)
          queryClient.invalidateQueries(['events'])
      },
      onError: (error) => {
          addMessage('Error deleting event: ' + error.message, 'error')
      }
  })

  const cancelEventMutation = useMutation({
      mutationFn: async (eventSlug) => {
          const response = await api.post(`/event/${eventSlug}/cancel/`)
          return response.data
      },
      onSuccess: (data) => {
          setCancelSlug(null)
          queryClient.invalidateQueries(['events'])
          addMessage(data.message, 'success')
          if (data.sms_errors?.length > 0) {
              addMessage(`SMS errors: ${data.sms_errors.join(', ')}`, 'error')
          }
      },
      onError: (error) => {
          addMessage('Error canceling event: ' + (error.response?.data?.message || error.message), 'error')
      }
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  const eventsToShow = includePast ? data : upcomingEvents(data)
  const filteredEvents = filterEvents(eventsToShow, debouncedSearch)
  const sortedEvents = filteredEvents?.sort((b, a) => new Date(a.start_date) - new Date(b.start_date))
  
  // Pagination logic
  const totalPages = Math.ceil(sortedEvents?.length / eventsPerPage)
  const startIndex = (currentPage - 1) * eventsPerPage
  const paginatedEvents = sortedEvents?.slice(startIndex, startIndex + eventsPerPage)

  return (
      <div>
          <div className="hidden md:flex flex-col lg:flex-row justify-between mb-4">
          <UpcomingEvents />
          <PendingRequests />
          <DeclinedCount />
          <SMSCount />
          </div>

    <div>
      <MainMenu />
      <StewardInvite />
      <h1 className="text-3xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">Events</h1>
      <div className=" bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow-md">
      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, location, or description"
          className="w-full max-w-md p-2 border rounded bg-card-bg text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border dark:focus:ring-dark-primary"
        />
        <label className="flex items-center text-text-primary dark:text-dark-text-primary">
          <input 
            type="checkbox" 
            checked={includePast}
            onChange={(e) => {
              setIncludePast(e.target.checked)
              setCurrentPage(1)
            }}
            className="h-4 w-4 text-text-blue dark:text-dark-text-blue mr-2"
          />
          Include Past Events
        </label>
      </div>

      {/* Subtle pagination at top */}
      {totalPages > 1 && (
        <div className="mb-4 flex justify-end items-center space-x-3 text-sm">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="text-text-tertiary dark:text-dark-text-tertiary hover:text-primary dark:hover:text-dark-primary disabled:opacity-30 disabled:hover:text-text-tertiary dark:disabled:hover:text-dark-text-tertiary"
            aria-label="Previous page"
          >
            &lt;
          </button>
          <span className="text-text-tertiary dark:text-dark-text-tertiary">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="text-text-tertiary dark:text-dark-text-tertiary hover:text-primary dark:hover:text-dark-primary disabled:opacity-30 disabled:hover:text-text-tertiary dark:disabled:hover:text-dark-text-tertiary"
            aria-label="Next page"
          >
            &gt;
          </button>
        </div>
      )}

      <div className="space-y-4">
        {paginatedEvents?.map(event => (
          <div key={event.id}
            onClick={() => navigate(`/dash/event/${event.slug}`)}
            className={`border-b p-2 rounded-md pb-4 cursor-pointer dark:border-dark-border-dark ${
              event.canceled
              ? 'bg-cancelled-event-gradient dark:bg-dark-cancelled-event-gradient'
              : event.filled
              ? 'bg-filled-event-gradient dark:bg-dark-filled-event-gradient'
              : ''
            }`}>
            <div className="flex items-center space-x-2">
              <div className="block flex-grow">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-primary dark:text-dark-text-primary text-shadow-light dark:text-shadow-dark">
                    {event.event_name}
                  </h3>
                  <div className="flex flex-col items-end space-y-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/dash/event/${event.slug}/edit`)}
                        className="bg-primary text-dark-text-primary px-3 py-1 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteSlug(event.slug)}
                        className="bg-danger text-dark-text-primary px-3 py-1 rounded hover:bg-danger-hover dark:bg-dark-danger dark:hover:bg-dark-danger-hover"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary">Steward:</label>
                      <select
                        value={event.steward ? event.steward.id : ''}
                        onChange={(e) => assignStewardMutation.mutate({ eventSlug: event.slug, stewardId: e.target.value || null })}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-dark-card-bg dark:border-dark-border dark:text-dark-text-primary w-40"
                        disabled={assignStewardMutation.isPending}
                      >
                        <option value="">No Steward</option>
                        {stewards?.map(steward => (
                          <option key={steward.id} value={steward.id}>{steward.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <p className="text-text-secondary dark:text-dark-text-secondary">
                  {event.is_single_day ? 
                    event.start_date : 
                    `${event.start_date} - ${event.end_date}`
                  } @ {event.location}

                </p>
                <p className="text-text-secondary dark:text-dark-text-secondary">
                  {event.event_description || "No description provided"}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    {event.canceled && (
                      <span className="text-lg block font-medium text-danger dark:text-dark-danger">
                        Canceled
                      </span>
                    )}
                    {event.filled && (
                      <span className="text-lg block font-medium text-secondary dark:text-dark-text-secondary">
                        Filled
                      </span>
                    )}
                    {!event.canceled && !event.filled && (
                      <span className="text-lg block font-medium text-yellow dark:text-dark-yellow">
                        {event.unfilled_count} Unfilled Positions.
                      </span>
                    )}
                  </div>
                  {!event.canceled && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setCancelSlug(event.slug) }}
                      className="bg-secondary text-dark-text-primary px-3 py-1 rounded hover:bg-secondary-hover dark:bg-dark-secondary dark:hover:bg-dark-secondary-hover"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full pagination at bottom */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50 dark:bg-dark-primary dark:text-dark-text-primary"
          >
            Previous
          </button>
          <span className="text-text-primary dark:text-dark-text-primary">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50 dark:bg-dark-primary dark:text-dark-text-primary"
          >
            Next
          </button>
        </div>
      )}
    </div>
    </div>
    <ConfirmDialog
      isOpen={!!cancelSlug}
      onClose={() => setCancelSlug(null)}
      onConfirm={() => cancelEventMutation.mutate(cancelSlug)}
      title="Cancel Event"
      message="This will cancel the event and notify all workers via SMS."
      confirmWord="CANCEL"
      isPending={cancelEventMutation.isPending}
    />
    <ConfirmDialog
      isOpen={!!deleteSlug}
      onClose={() => setDeleteSlug(null)}
      onConfirm={() => deleteEventMutation.mutate(deleteSlug)}
      title="Delete Event"
      message="Are you sure you want to delete this event?"
      confirmWord="DELETE"
      isPending={deleteEventMutation.isPending}
    />
    </div>
  )
}
