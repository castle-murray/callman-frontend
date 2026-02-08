import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../api'

export function ResetPassword() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [validationError, setValidationError] = useState('')
    const [success, setSuccess] = useState(false)

    const { mutate, isPending, error } = useMutation({
        mutationFn: async () => {
            const response = await api.post(`/api/reset-password/${token}/`, {
                new_password: newPassword,
                confirm_password: confirmPassword
            })
            return response.data
        },
        onSuccess: () => {
            setSuccess(true)
            setTimeout(() => navigate('/login'), 3000)
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        setValidationError('')

        if (newPassword.length < 8) {
            setValidationError('Password must be at least 8 characters.')
            return
        }
        if (newPassword !== confirmPassword) {
            setValidationError('Passwords do not match.')
            return
        }
        mutate()
    }

    const serverError = error?.response?.data?.message || (error ? 'Something went wrong. Please try again.' : '')

    return (
        <div className="max-w-md mx-auto p-6 bg-card-bg rounded-lg shadow-md dark:bg-dark-card-bg dark:shadow-dark-shadow">
            <h1 className="text-2xl font-bold mb-4 text-text-heading dark:text-dark-text-primary">Reset Password</h1>

            {success ? (
                <div>
                    <p className="text-success dark:text-dark-text-green mb-4">
                        Your password has been reset successfully. Redirecting to login...
                    </p>
                    <Link to="/login" className="text-primary dark:text-dark-text-blue hover:underline">
                        Go to Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="password"
                        placeholder="New password"
                        required
                        className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        required
                        className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {(validationError || serverError) && (
                        <p className="text-danger dark:text-dark-text-red text-sm">
                            {validationError || serverError}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50"
                    >
                        {isPending ? 'Resetting...' : 'Reset Password'}
                    </button>
                    <Link to="/forgot-password" className="text-primary dark:text-dark-text-blue hover:underline text-sm text-center">
                        Request a new reset link
                    </Link>
                </form>
            )}
        </div>
    )
}
