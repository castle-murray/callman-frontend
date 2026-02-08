import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../api'

export function UserRegistration() {
    const navigate = useNavigate()
    const location = useLocation()
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        password: '',
        confirm_password: '',
        registrationToken: '',
        token: ''
    })
    const [message, setMessage] = useState('')

    useEffect(() => {
        const phone = localStorage.getItem('registerPhone')
        if (phone) {
            setFormData(prev => ({ ...prev, phone }))
        }
        const token = localStorage.getItem('registerToken')
        if (token) {
            setFormData(prev => ({ ...prev, token }))
        }
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const startMutation = useMutation({
        mutationFn: async (phone) => {
            const response = await api.post('/api/user/register/start/', { phone, token: formData.token })
            return response.data
        },
        onSuccess: (data) => {
            localStorage.setItem('registerUsername', formData.username)
            localStorage.setItem('registerFirstName', formData.first_name)
            localStorage.setItem('registerLastName', formData.last_name)
            localStorage.setItem('registerEmail', formData.email)
            localStorage.setItem('registerPassword', formData.password)
            localStorage.setItem('registerToken', data.token)
            navigate('/verify-registration/')
        },
        onError: (error) => {
            setMessage('Failed to start registration: ' + (error.response?.data?.message || error.message))
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (formData.password !== formData.confirm_password) {
            setMessage('Passwords do not match')
            return
        }
        startMutation.mutate(formData.phone)
    }

    return (
        <div className="min-h-screen bg-body-bg dark:bg-dark-body-bg text-text-primary dark:text-dark-text-primary p-6">
            <div className="max-w-md mx-auto bg-card-bg dark:bg-dark-card-bg p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {message && (
                        <div className="text-danger dark:text-dark-danger mb-4">
                            {message}
                        </div>
                    )}
                    <div>
                        <label htmlFor="username" className="block mb-1">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                    </div>
                    <div>
                        <label htmlFor="first_name" className="block mb-1">First Name:</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                    </div>
                    <div>
                        <label htmlFor="last_name" className="block mb-1">Last Name:</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block mb-1">Phone:</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        readOnly
                    />
                    </div>
                    <div>
                        <label htmlFor="token" className="block mb-1">Token:</label>
                    <input
                        type="text"
                        name="token"
                        value={formData.token}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        readOnly
                    />
                    </div>
                    <div>
                        <label htmlFor="email" className="block mb-1">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-1">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm_password" className="block mb-1">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={startMutation.isPending}
                        className="w-full bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                    >
                        {startMutation.isPending ? 'Sending Code...' : 'Send Verification Code'}
                    </button>
                </form>
            </div>
        </div>
    )
}
