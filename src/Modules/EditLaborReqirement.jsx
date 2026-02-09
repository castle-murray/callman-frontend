import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import api from '../api'

export function EditLaborReqirement() {
    const location = useLocation()
    const navigate = useNavigate()
    const { slug, laborSlug } = useParams()
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        labor_type: '',
        needed_labor: '',
        minimum_hours: ''
    })
    const [message, setMessage] = useState('')

    const { data, error, isLoading } = useQuery({
        queryKey: ['editLaborReqirement', laborSlug],
        queryFn: async () => {
            const response = await api.get(`/labor/${laborSlug}/edit/`)
            return response.data
        }
    })
    const eventSlug = location.state?.eventSlug || data?.event_slug

    const { labor_requirement, labor_types } = data || {}

    useEffect(() => {
        if (labor_requirement && labor_types) {
            setFormData({
                labor_type: labor_requirement.labor_type,
                needed_labor: labor_requirement.needed_labor,
                minimum_hours: labor_requirement.minimum_hours || ''
            })
        }
    }, [labor_requirement, labor_types])


    const editLaborMutation = useMutation({
        mutationFn: async (laborData) => {
            const response = await api.post(`/labor/${laborSlug}/edit/`, laborData)
            return response.data
        },
        onSuccess: () => {
            if (eventSlug) {
                queryClient.invalidateQueries(['eventDetails', eventSlug])
                navigate(`/dash/event/${eventSlug}`)
            }
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
        editLaborMutation.mutate(formData)
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>
    if (!data) return <div>Loading form data...</div>

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">Edit Labor</h1>
            <div className="bg-card-bg p-6 rounded-lg shadow-md max-w-2xl mx-auto dark:bg-dark-card-bg dark:shadow-dark-shadow">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 text-text-tertiary dark:text-dark-text-tertiary"> 
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
                                {labor_types.map(laborType => (
                                    <option key={laborType.id} value={laborType.id}>
                                        {laborType.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="needed_labor" className="block mb-1">Needed:</label>
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
                        disabled={editLaborMutation.isPending}
                        className="mt-6 bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                    >
                        {editLaborMutation.isPending ? 'Editing...' : 'Save Changes'}
                    </button>       
                </form>
            </div>
        </div>
    )
}
