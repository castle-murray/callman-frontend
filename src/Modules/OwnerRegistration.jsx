import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '../api'

export function OwnerRegistration() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        company_name: '',
        company_short_name: '',
    })
    const [error, setError] = useState('')

    const { data: inviteData, isLoading, isError } = useQuery({
        queryKey: ['ownerInvitation', token],
        queryFn: async () => {
            const response = await api.get(`/api/owner/register/${token}/`)
            return response.data
        },
        retry: false,
    })

    const registerMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post(`/api/owner/register/${token}/`, data)
            return response.data
        },
        onSuccess: (data) => {
            localStorage.setItem('authToken', data.token)
            navigate('/dash')
        },
        onError: (err) => {
            setError(err.response?.data?.message || 'Registration failed. Please try again.')
        },
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match.')
            return
        }
        registerMutation.mutate(formData)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-body-bg dark:bg-dark-body-bg flex items-center justify-center">
                <p className="text-text-primary dark:text-dark-text-primary">Validating invitation...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-body-bg dark:bg-dark-body-bg flex items-center justify-center">
                <div className="max-w-md mx-auto bg-card-bg dark:bg-dark-card-bg p-6 rounded-lg shadow-md text-center">
                    <h1 className="text-2xl font-bold mb-4 text-text-primary dark:text-dark-text-primary">Invalid Invitation</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">This invitation link is invalid or has already been used.</p>
                </div>
            </div>
        )
    }

    const inputClass = "w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
    const labelClass = "block mb-1 text-text-primary dark:text-dark-text-primary"

    return (
        <div className="min-h-screen bg-body-bg dark:bg-dark-body-bg text-text-primary dark:text-dark-text-primary p-6">
            <div className="max-w-md mx-auto bg-card-bg dark:bg-dark-card-bg p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-2 text-center">Register as Owner</h1>
                <p className="text-text-secondary dark:text-dark-text-secondary text-center mb-6">Create an account to manage your company.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-danger dark:text-dark-danger text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="username" className={labelClass}>Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="first_name" className={labelClass}>First Name</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="last_name" className={labelClass}>Last Name</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className={labelClass}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className={labelClass}>Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm_password" className={labelClass}>Confirm Password</label>
                        <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>

                    <hr className="border-border dark:border-dark-border" />

                    <div>
                        <label htmlFor="company_name" className={labelClass}>Company Name</label>
                        <input
                            type="text"
                            id="company_name"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="company_short_name" className={labelClass}>Company Abbreviation</label>
                        <input
                            type="text"
                            id="company_short_name"
                            name="company_short_name"
                            value={formData.company_short_name}
                            onChange={handleChange}
                            required
                            maxLength={10}
                            className={inputClass}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="w-full bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                    >
                        {registerMutation.isPending ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    )
}
