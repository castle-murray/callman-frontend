import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export function StewardRegisterRedirect() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [error, setError] = useState('')

    useEffect(() => {
        api.get(`/api/steward/register/${token}/`)
            .then(({ data }) => {
                localStorage.setItem('registerPhone', data.phone)
                localStorage.setItem('registerToken', data.token)
                navigate('/user/register/')
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Invalid or expired registration link.')
            })
    }, [token, navigate])

    if (error) {
        return (
            <div className="min-h-screen bg-body-bg dark:bg-dark-body-bg text-text-primary dark:text-dark-text-primary p-6">
                <div className="max-w-md mx-auto bg-card-bg dark:bg-dark-card-bg p-6 rounded-lg shadow-md text-center">
                    <h1 className="text-2xl font-bold mb-4">Registration Error</h1>
                    <p className="text-danger dark:text-dark-danger">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-body-bg dark:bg-dark-body-bg text-text-primary dark:text-dark-text-primary p-6">
            <div className="max-w-md mx-auto bg-card-bg dark:bg-dark-card-bg p-6 rounded-lg shadow-md text-center">
                <p>Loading registration...</p>
            </div>
        </div>
    )
}
