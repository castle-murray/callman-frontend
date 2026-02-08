import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../api'

export function VerifyRegistration() {
    const navigate = useNavigate()
    const [verificationCode, setVerificationCode] = useState('')
    const [message, setMessage] = useState('')
    const [token, setToken] = useState('')

    useEffect(() => {
        const storedToken = localStorage.getItem('registerToken')
        if (!storedToken) {
            navigate('/user/register/')
            return
        }
        setToken(storedToken)
    }, [navigate])

    const registerMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/api/user/register/', data)
            return response.data
        },
        onSuccess: () => {
            setMessage('Registration successful! You can now log in.')
            localStorage.removeItem('registerPhone')
            localStorage.removeItem('registerToken')
            localStorage.removeItem('registerUsername')
            localStorage.removeItem('registerEmail')
            localStorage.removeItem('registerPassword')
            localStorage.removeItem('registerFirstName')
            localStorage.removeItem('registerLastName')
            setTimeout(() => navigate('/login'), 2000)
        },
        onError: (error) => {
            setMessage('Registration failed: ' + (error.response?.data?.message || error.message))
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!token) {
            setMessage('No registration token found.')
            return
        }
        // Need to get the other data from localStorage or something
        const phone = localStorage.getItem('registerPhone')
        const username = localStorage.getItem('registerUsername')
        const email = localStorage.getItem('registerEmail')
        const password = localStorage.getItem('registerPassword')
        if (!phone || !username || !email || !password) {
            setMessage('Registration data not found. Please start over.')
            localStorage.removeItem('registerPhone')
            localStorage.removeItem('registerToken')
            navigate('/user/register/')
            return
        }
        const firstName = localStorage.getItem('registerFirstName') || ''
        const lastName = localStorage.getItem('registerLastName') || ''
        registerMutation.mutate({
            username,
            phone,
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            token,
            verification_code: verificationCode
        })
    }

    if (!token) return <div>Loading...</div>

    return (
        <div className="min-h-screen bg-body-bg dark:bg-dark-body-bg text-text-primary dark:text-dark-text-primary p-6">
            <div className="max-w-md mx-auto bg-card-bg dark:bg-dark-card-bg p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Verify Your Registration</h1>
                <p className="mb-4">Enter the verification code sent to your phone.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {message && (
                        <div className="text-danger dark:text-dark-danger mb-4">
                            {message}
                        </div>
                    )}
                    <div>
                        <label htmlFor="verificationCode" className="block mb-1">Verification Code:</label>
                        <input
                            type="text"
                            id="verificationCode"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="w-full bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                    >
                        Complete Registration
                    </button>
                </form>
            </div>
        </div>
    )
}