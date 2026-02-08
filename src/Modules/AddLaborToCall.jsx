import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'

export function AddLaborToCall() {
    const location = useLocation()
    const navigate = useNavigate()
    const { slug, callTimeSlug } = useParams()
    const queryClient = useQueryClient()

    const { data, isLoading, error } = useQuery({
        queryKey: ['addLaborToCall', callTimeSlug],
        queryFn: async () => {
            const response = await api.get(`/api/call-times/${callTimeSlug}/add-labor/`)
            return response.data
        }
    })


    const laborTypes = data?.labor_types
    const callTime = data?.call_time
    
    const [formData, setFormData] = useState({
        labor_type: '',
        needed_labor: '',
        minimum_hours: ''
    })
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (callTime?.minimum_hours && !formData.minimum_hours) {
            setFormData(prev => ({
                ...prev,
                minimum_hours: callTime.minimum_hours
            }))
        }
    }, [callTime])
    

    const addLaborMutation = useMutation({
        mutationFn: async (laborData) => {
            const response = await api.post(`/api/call-times/${callTimeSlug}/add-labor/`, laborData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['eventDetails', slug])
            navigate(`/dash/event/${slug}`)
        }
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        addLaborMutation.mutate(formData)
    }
    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    // Always render the same container structure
    return (
        <div className="min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">
                Add Labor to {callTime.name}
            </h1>
                <div className="bg-card-bg p-6 rounded-lg shadow-md max-w-2xl mx-auto dark:bg-dark-card-bg dark:shadow-dark-shadow">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 text-text-tertiary dark:text-dark-text-tertiary">
                        {message && (
                            <div className="text-danger dark:text-dark-danger mb-4">
                                {message}
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="labor_type" className="block mb-1">Labor Type:</label>
                            <select
                                id="labor_type"
                                name="labor_type"
                                value={formData.labor_type}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            >
                                <option value="">Select a labor type</option>
                                {laborTypes.map((laborType) => (
                                    <option key={laborType.id} value={laborType.id}>
                                        {laborType.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="needed_labor" className="block mb-1">Number Needed:</label>
                            <input
                                type="number"
                                id="needed_labor"
                                name="needed_labor"
                                value={formData.needed_labor}
                                onChange={handleInputChange}
                                required
                                min="1"
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
                                step="0.5"
                                min="0"
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={addLaborMutation.isPending}
                        className="mt-6 bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                    >
                        {addLaborMutation.isPending ? 'Adding...' : 'Add Labor'}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => navigate(`/dash/event/${slug}`)}
                        className="mt-4 ml-4 inline-block text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover"
                    >
                        Cancel
                    </button>
                </form>
                
                {!laborTypes.length && (
                    <p className="mt-4 text-text-secondary dark:text-dark-text-secondary">
                        No labor types defined yet. 
                        <a href="#" className="text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover">
                            Create one
                        </a>.
                    </p>
                )}
            </div>
        </div>
    )
}
