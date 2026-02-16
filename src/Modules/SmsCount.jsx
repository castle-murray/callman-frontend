import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export function SMSCount() {
    const navigate = useNavigate()
    const { data, error, isLoading } = useQuery({
        queryKey: ['smsCount'],
        queryFn: async () => {
            const response = await api.get('/sms-count/')
            return response.data
        }
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div
            onClick={() => navigate('/dash/sms-usage')}
            className="bg-card-bg p-4 rounded-lg shadow dark:bg-dark-card-bg dark:shadow-dark-shadow cursor-pointer hover:shadow-md transition-shadow"
        >
            <h1>SMS Sent</h1>
            <p>{data.count}</p>
        </div>
    )
}
