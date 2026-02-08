import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import { useMessages } from '../contexts/MessageContext'

export function ConfirmTimeChange() {
    const { token } = useParams()
    const { addMessage } = useMessages()
    const [cantDoIt, setCantDoIt] = useState(false)
    const [message, setMessage] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const { data, error, isLoading } = useQuery({
        queryKey: ['confirmTimeChange', token],
        queryFn: async () => {
            const response = await api.get(`/api/call/confirm-time-change/${token}/`)
            return response.data
        }
    })

    const submitMutation = useMutation({
        mutationFn: async (formData) => {
            const response = await api.post(`/api/call/confirm-time-change/${token}/`, formData)
            return response.data
        },
        onSuccess: (data) => {
            setSubmitted(true)
        },
        onError: (error) => {
            addMessage('Error: ' + error.message, 'error')
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = {
            cant_do_it: cantDoIt.toString(),
            message: cantDoIt ? message : ''
        }
        submitMutation.mutate(formData)
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.response?.data?.message || error.message}</div>

    return (
        <div className="max-w-md mx-auto p-6 bg-card-bg rounded-lg shadow-md dark:bg-dark-card-bg dark:shadow-dark-shadow">
            <h1 className="text-2xl font-bold mb-4 text-text-heading dark:text-dark-text-primary">Confirm Time Change</h1>
            {submitted ? (
                <div>
                    <p className="text-text-primary mb-4 dark:text-dark-text-primary">Your confirmation has been processed.</p>
                    <Link to="/user-profile" className="inline-block text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover">Go to User Profile</Link>
                </div>
            ) : (
                <div>
                    <p className="text-text-primary mb-4 dark:text-dark-text-primary">Please confirm the time change for <b>{data.event_name} - {data.call_time_name}</b>.</p>
                    <p className="text-text-primary mb-4 dark:text-dark-text-primary">The time has changed from <b>{data.original_time} to {data.new_time}</b>.</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={cantDoIt} 
                                    onChange={(e) => setCantDoIt(e.target.checked)} 
                                    className="mr-2" 
                                />
                                <span className="text-text-primary dark:text-dark-text-primary">I can't work the new time</span>
                            </label>
                        </div>
                        
                        {cantDoIt && (
                            <div className="mb-4">
                                <textarea 
                                    value={message} 
                                    onChange={(e) => setMessage(e.target.value)} 
                                    className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border" 
                                    placeholder="Optional message"
                                />
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            disabled={submitMutation.isPending} 
                            className="bg-primary text-dark-text-primary px-4 py-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                        >
                            {submitMutation.isPending ? 'Processing...' : 'Confirm Time Change'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}