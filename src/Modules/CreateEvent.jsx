import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export function CreateEvent() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        event_name: '',
        start_date: '',
        end_date: '',
        is_single_day: false,
        location_profile: '',
        event_description: '',
        minimum_hours: '',
        meal_penalty_trigger_time: '',
        hour_round_up: ''
    })

    const { data: company, error, isLoading } = useQuery({
        queryKey: ['createEvent'],
        queryFn: async () => {
            const response = await api.get('/api/create-event/')
            return response.data
        }
    })


    const createEventMutation = useMutation({
        mutationFn: async (eventData) => {
            const response = await api.post('/api/create-event/', eventData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['events'])
            navigate(`/event/${data.slug}`)
        }
    })

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        createEventMutation.mutate(formData)
    }

    // Auto-sync end_date when single day is checked
    useEffect(() => {
        if (formData.is_single_day) {
            setFormData(prev => ({
                ...prev,
                end_date: prev.start_date
            }))
        }
    }, [formData.is_single_day, formData.start_date])

    // Set defaults from company
    useEffect(() => {
        if (company) {
            setFormData(prev => ({
                ...prev,
                minimum_hours: company.company?.minimum_hours || '',
                meal_penalty_trigger_time: company.company?.meal_penalty_trigger_time || '',
                hour_round_up: company.company?.hour_round_up || ''
            }))
        }
    }, [company])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">Create New Event</h1>
            <div className="bg-card-bg p-6 rounded-lg shadow-md max-w-2xl mx-auto dark:bg-dark-card-bg dark:shadow-dark-shadow">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 text-text-tertiary dark:text-dark-text-tertiary"> 
                        <div>
                            <label htmlFor="event_name" className="block mb-1">Event Name:</label>
                            <input
                                type="text"
                                id="event_name"
                                name="event_name"
                                value={formData.event_name}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            />
                        </div>

                        <div>
                            <label htmlFor="start_date" className="block mb-1">Start Date:</label>
                            <input
                                type="date"
                                id="start_date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            />
                        </div>

                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_single_day"
                                    checked={formData.is_single_day}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-text-blue border-light rounded dark:bg-dark-card-bg dark:border-dark-border dark:text-dark-text-blue mr-2"
                                />
                                Single Day Event
                            </label>
                        </div>

                        <div>
                            <label htmlFor="end_date" className="block mb-1">End Date:</label>
                            <input
                                type="date"
                                id="end_date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleInputChange}
                                required
                                disabled={formData.is_single_day}
                                className={`w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border ${formData.is_single_day ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        <div>
                            <label htmlFor="location_profile" className="block mb-1">Location Profile:</label>
                            <select
                                id="location_profile"
                                name="location_profile"
                                value={formData.location_profile}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            >
                                <option value="">Select a location</option>
                                {company?.location_profiles?.map(profile => (
                                    <option key={profile.id} value={profile.id}>
                                        {profile.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="event_description" className="block mb-1">Event Description:</label>
                            <textarea
                                id="event_description"
                                name="event_description"
                                value={formData.event_description}
                                onChange={handleInputChange}
                                rows="3"
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
                            <label htmlFor="meal_penalty_trigger_time" className="block mb-1">Meal Penalty Trigger Time (hours):</label>
                            <input
                                type="number"
                                id="meal_penalty_trigger_time"
                                name="meal_penalty_trigger_time"
                                value={formData.meal_penalty_trigger_time}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            />
                        </div>
                        <div>
                            <label htmlFor="hour_round_up" className="block mb-1">Hour Round Up (minutes):</label>
                            <input
                                type="number"
                                id="hour_round_up"
                                name="hour_round_up"
                                value={formData.hour_round_up}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={createEventMutation.isPending}
                        className="mt-6 bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                    >
                        {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                    </button>
                    <button 
                        type="button"
                        onClick={() => navigate('/dash')}
                        className="mt-4 ml-4 text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    )
}
