import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export function OwnerDashboard() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        name: '',
        name_short: '',
        email: '',
        phone_number: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        minimum_hours: '',
        meal_penalty_trigger_time: '',
        hour_round_up: ''
    })


    const { data, error, isLoading } = useQuery({
        queryKey: ['owner'],
        queryFn: async () => {
            const response = await api.get('/company/settings/')
            return response.data
        }
    })

    useEffect(() => {
        if (data) {
            setFormData({
                name: data.name || '',
                name_short: data.name_short || '',
                email: data.email || '',
                phone_number: data.phone_number || '',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                zip_code: data.zip_code || '',
                minimum_hours: data.minimum_hours?.toString() || '',
                meal_penalty_trigger_time: data.meal_penalty_trigger_time?.toString() || '',
                hour_round_up: data.hour_round_up?.toString() || ''
            })
        }
    }, [data])

    const ownerMutation = useMutation({
        mutationFn: async (ownerData) => {
            const response = await api.patch('/company/settings/', ownerData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['owner'])
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
        ownerMutation.mutate(formData)
    }
    const handleTimeDefaultsSubmit = (e) => {
        e.preventDefault()
        const timeData = {
            minimum_hours: formData.minimum_hours,
            meal_penalty_trigger_time: formData.meal_penalty_trigger_time,
            hour_round_up: formData.hour_round_up
        }
        ownerMutation.mutate(timeData)
    }


    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>
    return (
        <div className="max-w-4xl mx-auto p-6 bg-card-bg rounded-lg shadow-md dark:bg-dark-card-bg dark:shadow-dark-shadow">
            <h1 className="text-2xl font-bold mb-4 text-text-heading dark:text-dark-text-primary">Owner Dashboard</h1>
            
            <h2 className="text-xl font-semibold mb-2 text-text-heading dark:text-dark-text-primary">Edit Company Information</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
                <div className="grid grid--1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="company_name" className="text-text-tertiary dark:text-dark-text-tertiary">Company Name</label>
                        <input  
                            type="text" 
                            id="company_name" 
                            name="name" 
                            value={formData?.name || ''} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="company_short_name" className="text-text-tertiary dark:text-dark-text-tertiary">Company Short Name</label>
                        <input  
                            type="text" 
                            id="name_short" 
                            name="name_short" 
                            value={formData?.name_short || ''} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                        />
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-2 text-text-heading dark:text-dark-text-primary">
                Address
                </h2>
                <div className="flex flex-col">
                    <div className="flex flex-col">
                        <label htmlFor="email" className="text-text-tertiary dark:text-dark-text-tertiary">Address</label>
                        <input  
                            type="text" 
                            id="address" 
                            name="address" 
                            value={formData?.address || ''} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                        />
                    </div>
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-text-tertiary dark:text-dark-text-tertiary">City</label>
                            <input  
                                type="text" 
                                id="city" 
                                name="city" 
                                value={formData?.city || ''} 
                                onChange={handleInputChange} 
                                required 
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-text-tertiary dark:text-dark-text-tertiary">
                                State
                            </label>
                            <input  
                                type="text" 
                                id="state" 
                                name="state" 
                                value={formData?.state || ''} 
                                onChange={handleInputChange} 
                                required 
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-text-tertiary dark:text-dark-text-tertiary">
                                Zip Code
                            </label>
                            <input  
                                type="text" 
                                id="zip_code" 
                                name="zip_code" 
                                value={formData?.zip_code || ''} 
                                onChange={handleInputChange} 
                                required 
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                            />
                        </div>
                    </div>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-text-heading dark:text-dark-text-primary">
                Contact info
                </h2>
                <div className="flex flex-col md:flex-row justify-around">
                    <div className="flex flex-col">
                        <label htmlFor="email" className="text-text-tertiary dark:text-dark-text-tertiary">Email</label>
                        <input  
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData?.email || ''} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="email" className="text-text-tertiary dark:text-dark-text-tertiary">Phone Number</label>
                        <input  
                            type="tel" 
                            id="phone_number" 
                            name="phone_number" 
                            value={formData?.phone_number || ''} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                        />
                    </div>
                </div>

            <h2 className="text-xl font-semibold mb-2 text-text-heading dark:text-dark-text-primary">Company Time Defaults</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="minimum_hours" className="text-text-tertiary dark:text-dark-text-tertiary">Minimum Hours</label>
                        <input  
                            type="number" 
                            id="minimum_hours" 
                            name="minimum_hours" 
                            value={formData?.minimum_hours || ''} 
                            onChange={handleInputChange} 
                            step="0.5"
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="meal_penalty_trigger_time" className="text-text-tertiary dark:text-dark-text-tertiary">Meal Penalty Trigger Time (hours)</label>
                        <input  
                            type="number" 
                            id="meal_penalty_trigger_time" 
                            name="meal_penalty_trigger_time" 
                            value={formData?.meal_penalty_trigger_time || ''} 
                            onChange={handleInputChange} 
                            step="0.5"
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="hour_round_up" className="text-text-tertiary dark:text-dark-text-tertiary">Hour Round Up (minutes)</label>
                        <input  
                            type="number" 
                            id="hour_round_up" 
                            name="hour_round_up" 
                            value={formData?.hour_round_up || ''} 
                            onChange={handleInputChange} 
                            min="0"
                            max="30"
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                        />
                    </div>
                </div>
                <button 
                    type="submit" 
                    className="bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                >
                    Update Settings
                </button>
            </form>

            <h2 className="text-xl font-semibold mb-2 text-text-heading dark:text-dark-text-primary">Invite New Manager</h2>
            <form className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="phone" className="text-text-tertiary dark:text-dark-text-tertiary">Phone Number:</label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        required
                        className="w-full max-w-md p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                >
                    Send Invitation
                </button>
            </form>
        </div>
    )
}
