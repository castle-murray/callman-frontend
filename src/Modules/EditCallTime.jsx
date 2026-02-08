import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api from '../api'

export function EditCallTime() {
    const navigate = useNavigate()
    const { slug: eventSlug, callTimeSlug } = useParams()
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        minimum_hours: '',
        message: ''
    })

    const { data, error, isLoading } = useQuery({
        queryKey: ['eventDetails', eventSlug],
        queryFn: async () => {
            const response = await api.get(`/api/event/${eventSlug}`)
            return response.data
        }
    })

    const event = data?.event
    const call_time = data?.call_times?.find(ct => ct.slug === callTimeSlug)

    const getDateOptions = () => {
        if (!event || event.is_single_day) return []
        const options = []
        const start = new Date(event.start_date)
        const end = new Date(event.end_date)
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            options.push(d.toISOString().split('T')[0])
        }
        return options
    }

    const dateOptions = getDateOptions()

    const callTimeMutation = useMutation({
        mutationFn: async (callTimeData) => {
            const response = await api.patch(`/api/call-times/${callTimeSlug}/edit/`, callTimeData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['eventDetails', eventSlug])
            navigate(`/dash/event/${eventSlug}`)
        }
    })

    useEffect(() => {
        if (call_time) {
            setFormData({
                name: call_time.name || '',
                date: call_time.date || '',
                time: call_time.time || '',
                minimum_hours: call_time.minimum_hours || '',
                message: call_time.message || ''
            })
        }
    }, [call_time])

    // Add this useEffect to populate minimum_hours
    useEffect(() => {
        if (event && !formData.minimum_hours) {
            const defaultMinHours = event.minimum_hours || event.company?.minimum_hours || ''
            setFormData(prev => ({
                ...prev,
                minimum_hours: defaultMinHours
            }))
        }
    }, [event, formData.minimum_hours])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        callTimeMutation.mutate(formData)
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">Edit Call Time for {event?.event_name}</h1>
            <div className="bg-card-bg p-6 rounded-lg shadow-md max-w-2xl mx-auto dark:bg-dark-card-bg dark:shadow-dark-shadow">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 text-text-tertiary dark:text-dark-text-tertiary"> 
                        <div>
                            <label htmlFor="name" className="block mb-1">Call Time Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            />
                        </div>

                        <div>
                            <label htmlFor="date" className="block mb-1">Date:</label>
                            {event?.is_single_day ? (
                                <input
                                    type="date"
                                    value={event.start_date}
                                    disabled
                                    className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border opacity-50 cursor-not-allowed"
                                />
                            ) : (
                                <select
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                                >
                                    <option value="">Select a date</option>
                                    {dateOptions.map(date => (
                                        <option key={date} value={date}>{date}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label htmlFor="time" className="block mb-1">Time:</label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            />
                        </div>

                        <div>
                            <label htmlFor="minimum_hours" className="block mb-1">Minimum Hours:</label>
                            <input
                                type="number"
                                id="minimum_hours"
                                name="minimum_hours"

                                value={formData.minimum_hours}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block mb-1">Message:</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={callTimeMutation.isPending}
                        className="mt-6 bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                    >
                        {callTimeMutation.isPending ? 'Updating...' : 'Update Call Time'}
                    </button>
                    <button 
                        type="button"
                        onClick={() => navigate(`/dash/event/${eventSlug}`)}
                        className="mt-4 ml-4 inline-block text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    )
}
