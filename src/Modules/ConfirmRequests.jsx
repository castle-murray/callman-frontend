import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api'
import Header from '../components/Header'

export function ConfirmRequests() {
    const navigate = useNavigate()
    const { slug, event_token } = useParams()
    const queryClient = useQueryClient()
    const [message, setMessage] = useState('')

    const { data, error, isLoading } = useQuery({
        queryKey: ['confirmRequests', slug, event_token],
        queryFn: async () => {
            const response = await api.get(`/event/${slug}/confirm/${event_token}/`)
            return response.data
        }
    })

    const confirmMutation = useMutation({
        mutationFn: async ({ requestId, response }) => {
            const responseData = await api.post(`/event/${slug}/confirm/${event_token}/`, {
                [`response_${requestId}`]: response
            })
            return responseData.data
        },
        onSuccess: () => {
            setMessage('Response submitted successfully')
            queryClient.invalidateQueries(['confirmRequests', slug, event_token])
        },
        onError: (error) => {
            setMessage('Error submitting response: ' + error.message)
        }
    })

    const cancelMutation = useMutation({
        mutationFn: async (tokenShort) => {
            const response = await api.post(`/user/request/${tokenShort}/action/`, {
                action: 'cancel'
            })
            return response.data
        },
        onSuccess: () => {
            setMessage('Request canceled')
            queryClient.invalidateQueries(['confirmRequests', slug, event_token])
        },
        onError: (error) => {
            setMessage('Error canceling request: ' + error.message)
        }
    })

    const handleResponse = (requestId, response) => {
        confirmMutation.mutate({ requestId, response })
    }

    const handleRegister = async (phone) => {
        try {
            const response = await api.post('/user/register/', { phone })
            if (response.data.message === 'User created successfully') {
                navigate('/login')
            } else {
                setMessage(response.data.message)
            }
        } catch (error) {
            setMessage('Registration failed: ' + (error.response?.data?.message || error.message))
        }
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    const { event, worker, confirmed_call_times, pending_call_times, available_call_times, qr_code_data, registration_link, registration_token } = data

    const isAuthenticated = !!localStorage.getItem('authToken')

    const content = (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">
                Confirm Requests for {event.event_name}
            </h1>

            {confirmed_call_times.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Confirmed Call Times</h2>
                    {confirmed_call_times.map(req => (
                        <div key={req.id} className="bg-card-bg dark:bg-dark-card-bg p-4 rounded mb-2 flex justify-between items-center">
                            <p>{req.labor_requirement.call_time.name} - {req.labor_requirement.labor_type.name}</p>
                            <button
                                onClick={() => { if (confirm('Are you sure you want to cancel this confirmed request?')) cancelMutation.mutate(req.token_short) }}
                                disabled={cancelMutation.isPending}
                                className="bg-danger text-white px-3 py-1 rounded hover:bg-danger-hover dark:bg-dark-danger dark:hover:bg-dark-danger-hover disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    ))}
                    {qr_code_data && (
                        <div className="mt-4 text-center">
                            <h3 className="text-lg font-semibold mb-2">Clock In QR Code</h3>
                            <p className="mb-2">Scan this QR code with your phone's camera to clock in for your confirmed shifts.</p>
                            <img src={`data:image/png;base64,${qr_code_data}`} alt="QR Code" className="max-w-xs mx-auto" />
                        </div>
                    )}
                </div>
            )}

            {available_call_times.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Available Call Times</h2>
                    {available_call_times.map(req => (
                        <div key={req.id} className="bg-card-bg dark:bg-dark-card-bg p-4 rounded mb-2">
                            {req.labor_requirement.call_time.name} - {req.labor_requirement.labor_type.name}
                        </div>
                    ))}
                </div>
            )}

            {pending_call_times.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Pending Call Times</h2>
                    {pending_call_times.map(req => (
                        <div key={req.id} className="bg-card-bg dark:bg-dark-card-bg p-4 rounded mb-2 flex justify-between items-center">
                            <p>{req.labor_requirement.call_time.name} - {req.labor_requirement.labor_type.name}</p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => handleResponse(req.id, 'yes')}
                                    disabled={confirmMutation.isPending}
                                    className="bg-success text-dark-text-primary p-2 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover disabled:opacity-50"
                                >
                                    Available
                                </button>
                                <button
                                    onClick={() => handleResponse(req.id, 'no')}
                                    disabled={confirmMutation.isPending}
                                    className="bg-danger text-white p-2 rounded hover:bg-danger-hover dark:bg-dark-danger dark:hover:bg-dark-danger-hover disabled:opacity-50"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {registration_link && (
                <div className="mt-6 p-4 bg-primary text-dark-text-primary rounded dark:bg-dark-primary dark:text-dark-text-primary text-center">
                    <button
                        onClick={() => {
                            localStorage.setItem('registerPhone', worker.phone_number)
                            localStorage.setItem('registerToken', registration_token)
                            navigate('/user/register/')
                        }}
                        className="underline hover:no-underline bg-transparent border-none text-inherit cursor-pointer"
                    >
                        Register to manage your profile and availability
                    </button>
                </div>
            )}

            {message && (
                <div className="mt-4 p-4 bg-info-bg text-info-text rounded dark:bg-info-bg dark:text-info-text">
                    {message}
                </div>
            )}
        </div>
    )

    return isAuthenticated ? (
        <div className="min-h-screen flex flex-col bg-body-bg text-text-success dark:bg-dark-body-bg dark:text-dark-text-tertiary">
            <Header />
            <main className="lg:container lg:mx-auto py-6 ml-2 lg:px-6 lg:flex-grow z-10">
                {content}
            </main>
        </div>
    ) : (
        <div className="min-h-screen bg-body-bg dark:bg-dark-body-bg text-text-primary dark:text-dark-text-primary">
            {content}
        </div>
    )
}
