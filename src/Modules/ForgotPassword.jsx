import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../api'

export function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const { mutate, isPending, error } = useMutation({
        mutationFn: async () => {
            const response = await api.post('/forgot-password/', { email })
            return response.data
        },
        onSuccess: () => {
            setSubmitted(true)
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        mutate()
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-card-bg rounded-lg shadow-md dark:bg-dark-card-bg dark:shadow-dark-shadow">
            <h1 className="text-2xl font-bold mb-4 text-text-heading dark:text-dark-text-primary">Forgot Password</h1>

            {submitted ? (
                <div>
                    <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
                        If an account with that email exists, a password reset link has been sent. Please check your inbox.
                    </p>
                    <Link to="/login" className="text-primary dark:text-dark-text-blue hover:underline">
                        Back to Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <input
                        type="email"
                        placeholder="Email address"
                        required
                        className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {error && (
                        <p className="text-danger dark:text-dark-text-red text-sm">
                            Something went wrong. Please try again.
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                    >
                        {isPending ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    <Link to="/login" className="text-primary dark:text-dark-text-blue hover:underline text-sm text-center">
                        Back to Login
                    </Link>
                </form>
            )}
        </div>
    )
}
