import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

export function Event() {
    const navigate = useNavigate()
    const { slug } = useParams()
    const [currentDropdown, setCurrentDropdown] = useState(null)

    const { data, error, isLoading } = useQuery({
        queryKey: ['event', slug],
        queryFn: async () => {
            const response = await api.get(`/event/${slug}/`)

            return response.data
            
        }
    })

    const toggleDropdown = (callTimeSlug) => {
        setCurrentDropdown(currentDropdown === callTimeSlug ? null : callTimeSlug)
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div>
            <h1 className="text-3xl ml-5 font-bold mb-6 text-text-heading dark:text-dark-text-primary">
                {data.event_name}
            </h1>
            
            <div className="mb-6 ml-5 flex space-x-4">
                <button className="shadow-sm shadow-secondary dark:shadow-dark-secondary bg-success text-dark-text-primary p-4 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover">
                    Send Messages
                </button>
                {data.company?.time_tracking && (
                    <>
                        <button className="shadow-sm shadow-secondary dark:shadow-dark-secondary bg-success text-dark-text-primary p-4 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover">
                            Send QR to all
                        </button>
                        <button className="shadow-sm shadow-secondary dark:shadow-dark-secondary bg-success text-dark-text-primary p-4 rounded hover:bg-success-hover dark:bg-dark-success dark:hover:bg-dark-success-hover">
                            Scan QR Code
                        </button>
                    </>
                )}
            </div>

            <div className="bg-card-bg p-6 rounded-lg shadow mb-6 dark:bg-dark-card-bg dark:shadow-dark-shadow">
                <p className="text-text-tertiary dark:text-dark-text-tertiary">
                    <strong>Date:</strong> {data.is_single_day ? data.start_date : `${data.start_date} - ${data.end_date}`}
                </p>
                <p className="text-text-tertiary dark:text-dark-text-tertiary">
                    <strong>Location:</strong> {data.location_profile?.name || "Not specified"}
                </p>
                <p className="text-text-tertiary dark:text-dark-text-tertiary">
                    {data.event_description || "No description provided"}
                </p>
            </div>

            <div className="divide-y divide-primary dark:divide-dark-primary bg-card-bg p-2 w-full rounded-lg shadow mb-6 dark:bg-dark-card-bg dark:shadow-dark-shadow">
                <h2 className="text-xl font-semibold mb-4 text-text-heading dark:text-dark-text-primary">Call Times</h2>
                
                {data.call_times?.length > 0 ? (
                    data.call_times.map((callTime) => (
                        <div key={callTime.slug} className="mb-4">
                            <h3 className="text-lg font-semibold text-text-heading dark:text-dark-text-primary">
                                {callTime.name} - {callTime.time} {!data.is_single_day && callTime.date}
                            </h3>
                        </div>
                    ))
                ) : (
                    <p className="text-text-secondary dark:text-dark-text-secondary">No call times defined yet.</p>
                )}
                
                <button 
                    onClick={() => navigate(`/events/${slug}/add-call-time`)}
                    className="mt-4 inline-block bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                >
                    Add Call Time
                </button>
            </div>
        </div>
    )
}
