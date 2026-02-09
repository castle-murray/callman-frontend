import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Loader } from '@googlemaps/js-api-loader'
import api from '../api'

export function Locations() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const addressInputRef = useRef(null)
    const editAddressInputRef = useRef(null)
    const autocompleteRef = useRef(null)
    const editAutocompleteRef = useRef(null)
    const nameInputRef = useRef(null)
    const editNameInputRef = useRef(null)
    const nameAutocompleteRef = useRef(null)
    const editNameAutocompleteRef = useRef(null)
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        minimum_hours: '',
        meal_penalty_trigger_time: '',
        hour_round_up: '',
        action: 'add'
    })
    const [editingLocation, setEditingLocation] = useState(null)
    const [editFormData, setEditFormData] = useState({
        name: '',
        address: '',
        minimum_hours: '',
        meal_penalty_trigger_time: '',
        hour_round_up: ''
    })

    const { data, error, isLoading } = useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const response = await api.get('/location-profiles/')
            return response.data
        }
    })

    const company_info = data?.company
    const locations = data?.location_profiles

useEffect(() => {
    const initAutocomplete = async () => {
        try {
            // Check if script already exists to avoid duplicate loading
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
            
            // Load Google Maps API only if not already loaded
            if (!window.google || !window.google.maps || !window.google.maps.places) {
                if (!existingScript) {
                    const script = document.createElement('script')
                    script.src = `https://maps.googleapis.com/maps/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
                    script.async = true
                    script.defer = true
                    
                    await new Promise((resolve, reject) => {
                        script.onload = () => {
                            setTimeout(resolve, 100)
                        }
                        script.onerror = reject
                        document.head.appendChild(script)
                    })
                } else {
                    // Script exists, wait for it to load
                    await new Promise((resolve) => {
                        const checkGoogle = () => {
                            if (window.google?.maps?.places?.Autocomplete) {
                                resolve()
                            } else {
                                setTimeout(checkGoogle, 100)
                            }
                        }
                        checkGoogle()
                    })
                }
            }
            
            // Initialize autocomplete for add form name field
            if (nameInputRef.current) {
                nameAutocompleteRef.current = new window.google.maps.places.Autocomplete(
                    nameInputRef.current,
                    { types: ['establishment'] }
                )
                
                nameAutocompleteRef.current.addListener('place_changed', () => {
                    const place = nameAutocompleteRef.current.getPlace()
                    if (place.name && place.formatted_address) {
                        setFormData(prev => ({
                            ...prev,
                            name: place.name,
                            address: place.formatted_address
                        }))
                    }
                })
            }

            // Initialize autocomplete for edit form name field
            if (editNameInputRef.current) {
                editNameAutocompleteRef.current = new window.google.maps.places.Autocomplete(
                    editNameInputRef.current,
                    { types: ['establishment'] }
                )
                
                editNameAutocompleteRef.current.addListener('place_changed', () => {
                    const place = editNameAutocompleteRef.current.getPlace()
                    if (place.name && place.formatted_address) {
                        setEditFormData(prev => ({
                            ...prev,
                            name: place.name,
                            address: place.formatted_address
                        }))
                    }
                })
            }
        } catch (error) {
            console.error('Error loading Google Maps:', error)
        }
    }

    initAutocomplete()
}, [editingLocation])

    const locationMutation = useMutation({
        mutationFn: async (locationData) => {
            if (locationData.method === 'DELETE') {
                const response = await api.delete(`/location-profiles/`, { data: { location_id: locationData.location_id } })
                return response.data
            } else if (locationData.method === 'PATCH') {
                const response = await api.patch(`/location-profiles/`, { 
                    location_id: locationData.location_id,
                    name: locationData.name,
                    address: locationData.address,
                    minimum_hours: locationData.minimum_hours,
                    meal_penalty_trigger_time: locationData.meal_penalty_trigger_time,
                    hour_round_up: locationData.hour_round_up
                })
                return response.data
            } else {
                // POST for adding new locations
                const response = await api.post('/location-profiles/', {
                    name: locationData.name,
                    address: locationData.address,
                    minimum_hours: locationData.minimum_hours,
                    meal_penalty_trigger_time: locationData.meal_penalty_trigger_time,
                    hour_round_up: locationData.hour_round_up
                })
                return response.data
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['locations'])
            setFormData({
                name: '',
                address: '',
                minimum_hours: '',
                meal_penalty_trigger_time: '',
                hour_round_up: ''
            })
            setEditingLocation(null)
            setEditFormData({
                name: '',
                address: '',
                minimum_hours: '',
                meal_penalty_trigger_time: '',
                hour_round_up: ''
            })
        }
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        const fieldName = name === 'locationName' ? 'name' : name
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }))
    }

    const handleEditInputChange = (e) => {
        const { name, value } = e.target
        const fieldName = name === 'locationName' ? 'name' : name
        setEditFormData(prev => ({
            ...prev,
            [fieldName]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        locationMutation.mutate({
            name: formData.name,
            address: formData.address,
            minimum_hours: formData.minimum_hours,
            meal_penalty_trigger_time: formData.meal_penalty_trigger_time,
            hour_round_up: formData.hour_round_up
        })
    }

    const handleEditSubmit = (e, locationId) => {
        e.preventDefault()
        locationMutation.mutate({
            method: 'PATCH',
            location_id: locationId,
            name: editFormData.name,
            address: editFormData.address,
            minimum_hours: editFormData.minimum_hours,
            meal_penalty_trigger_time: editFormData.meal_penalty_trigger_time,
            hour_round_up: editFormData.hour_round_up
        })
    }

    const handleDelete = (locationId) => {
        if (confirm('Are you sure you want to delete this location?')) {
            locationMutation.mutate({
                method: 'DELETE',
                location_id: locationId
            })
        }
    }

    const startEdit = (location) => {
        setEditingLocation(location.id)
        setEditFormData({
            name: location.name,
            address: location.address,
            minimum_hours: location.minimum_hours,
            meal_penalty_trigger_time: location.meal_penalty_trigger_time,
            hour_round_up: location.hour_round_up
        })
    }
    const cancelEdit = () => {
        setEditingLocation(null)
        setEditFormData({
            name: '',
            address: '',
            minimum_hours: '',
            meal_penalty_trigger_time: '',
            hour_round_up: ''
        })
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error loading locations</div>

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">Location Profiles</h1>
            <div className="bg-card-bg p-6 rounded-lg shadow-md max-w-4xl mx-auto dark:bg-dark-card-bg dark:shadow-dark-shadow">
                
                {/* Add New Location Form */}
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-card-bg dark:bg-dark-card-bg border border-border-light dark:border-dark-border rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-text-heading dark:text-dark-text-primary">New Location</h3>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label htmlFor="locationName" className="block text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                Location Name
                            </label>
                                <input  
                                    ref={nameInputRef}
                                    type="text" 
                                    id="locationName" 
                                    name="locationName" 
                                    value={formData.name} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                                />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="address" className="block text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                Address
                            </label>
                            <input  
                                ref={addressInputRef}
                                type="text" 
                                id="address" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleInputChange} 
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 items-end mt-4">
                        <div className="flex-1">
                            <label htmlFor="minimum_hours" className="block text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                Minimum Hours
                            </label>
                            <input  
                                type="number" 
                                id="minimum_hours" 
                                name="minimum_hours" 
                                value={formData.minimum_hours} 
                                onChange={handleInputChange} 
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="meal_penalty_trigger_time" className="block text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                Meal Penalty Trigger Time (Hours)
                            </label>
                            <input  
                                type="number" 
                                id="meal_penalty_trigger_time" 
                                name="meal_penalty_trigger_time" 
                                value={formData.meal_penalty_trigger_time} 
                                onChange={handleInputChange} 
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="hour_round_up" className="block text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                Minutes to round to next half hour
                            </label>
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
                        disabled={locationMutation.isPending}
                        className="mt-6 bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                    >
                        {locationMutation.isPending ? 'Adding...' : 'Add Location'}
                    </button>
                </form>

                {/* Location List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-heading dark:text-dark-text-primary">Existing Locations</h3>
                    {locations && locations.length > 0 ? (
                        <div className="space-y-2">
                            {locations.map((location) => (
                                <div key={location.id} className="flex items-center justify-between p-3 bg-card-bg dark:bg-dark-card-bg border border-border-light dark:border-dark-border rounded-lg">
                                    {editingLocation === location.id ? (
                                        <form onSubmit={(e) => handleEditSubmit(e, location.id)} className="flex flex-col gap-4 flex-1">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label htmlFor="edit-locationName" className="block text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                                        Location Name
                                                    </label>
                                                    <input  
                                                        ref={editNameInputRef}
                                                        type="text" 
                                                        id="edit-locationName" 
                                                        name="locationName" 
                                                        value={editFormData.name} 
                                                        onChange={handleEditInputChange} 
                                                        required 
                                                        className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label htmlFor="edit-address" className="block text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                                        Address
                                                    </label>
                                                    <input  
                                                        ref={editAddressInputRef}
                                                        type="text" 
                                                        id="edit-address" 
                                                        name="address" 
                                                        value={editFormData.address} 
                                                        onChange={handleEditInputChange} 
                                                        className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label htmlFor="edit-minimum-hours" className="block text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                                        Minimum Hours
                                                    </label>
                                                    <input  
                                                        type="number" 
                                                        id="edit-minimum-hours" 
                                                        name="minimum_hours" 
                                                        value={editFormData.minimum_hours} 
                                                        onChange={handleEditInputChange} 
                                                        className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label htmlFor="edit-meal-penalty" className="block text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                                        Meal Penalty Trigger Time (Hours)
                                                    </label>
                                                    <input  
                                                        type="number" 
                                                        id="edit-meal-penalty" 
                                                        name="meal_penalty_trigger_time" 
                                                        value={editFormData.meal_penalty_trigger_time} 
                                                        onChange={handleEditInputChange} 
                                                        className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label htmlFor="edit-hour-round" className="block text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                                        Minutes to round to next half hour
                                                    </label>
                                                    <input  
                                                        type="number" 
                                                        id="edit-hour-round" 
                                                        name="hour_round_up" 
                                                        value={editFormData.hour_round_up} 
                                                        onChange={handleEditInputChange} 
                                                        className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="submit"
                                                    disabled={locationMutation.isPending}
                                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEdit}
                                                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="flex-1">
                                                <span className="text-text-tertiary dark:text-dark-text-tertiary font-medium block">
                                                    {location.name} - {location.address}
                                                </span>
                                                <span className="text-text-secondary dark:text-dark-text-secondary text-sm">
                                                    Min Hours: {location.minimum_hours} | Meal Penalty: {location.meal_penalty_trigger_time}h | Round Up: {location.hour_round_up}min
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEdit(location)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(location.id)}
                                                    disabled={locationMutation.isPending}
                                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-secondary dark:text-dark-text-secondary">No locations found.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
