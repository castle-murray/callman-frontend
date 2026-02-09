import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../api'
import { PublicHeader } from '../components/PublicHeader'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const { mutate, error } = useMutation({
    mutationFn: async () => {
      const response = await api.post('/login/', { username, password })
      return response.data
    },
    onSuccess: async (data) => {
      localStorage.setItem('authToken', data.token)
      try {
        const userResponse = await api.get('/user/info/')
        const userData = userResponse.data.user
        if (userData.isManager || userData.isAdministrator || userData.isOwner || userData.isSteward) {
          navigate('/dash')
        } else {
          navigate('/dash/profile')
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        navigate('/dash') // fallback
      }
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutate()
  }

  return (
    <div className="min-h-screen flex flex-col bg-body-bg dark:bg-dark-body-bg">
      <title>Login — CallManager</title>
      <meta name="description" content="Sign in to your CallManager account to manage events, staffing, and time tracking." />
      <PublicHeader />

      {/* Split layout */}
      <div className="flex-grow flex">
        {/* Left side — branding panel */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-indigo dark:from-dark-primary dark:to-dark-indigo flex-col justify-center items-center px-12">
          <h2 className="text-5xl font-extrabold text-white mb-4">CallManager</h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 text-center max-w-sm">
            Staff smarter. Automate requests, schedule labor, and track time — all in one place.
          </p>
        </div>

        {/* Right side — login form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6">

        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-2 text-text-heading dark:text-dark-text-primary">Welcome back</h1>
          <p className="text-text-secondary dark:text-dark-text-secondary mb-8">Sign in to your account</p>

          {error && (
            <div className="bg-danger/10 dark:bg-dark-danger/20 border border-danger dark:border-dark-danger rounded-lg p-3 mb-4">
              <p className="text-danger dark:text-dark-text-red text-sm">
                {error.response?.data?.message || 'Invalid credentials. Please try again.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                required
                autoFocus
                className="w-full p-3 border border-border-light dark:border-dark-border rounded-lg bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                className="w-full p-3 border border-border-light dark:border-dark-border rounded-lg bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover text-white font-bold py-3 rounded-lg transition-colors shadow-md mt-2"
            >
              Sign In
            </button>
            <Link to="/forgot-password" className="text-xs text-primary dark:text-dark-text-blue hover:underline text-center" tabIndex={-1}>
              Forgot password?
            </Link>
          </form>
        </div>
        </div>
      </div>
    </div>
  )
}
