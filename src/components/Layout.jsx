import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import Header from './Header'
import { PublicHeader } from './PublicHeader'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      navigate('/login')
    }
  }, [navigate])

  if (import.meta.env.VITE_MAINTENANCE_MODE === 'true') {
    return (
      <div className="min-h-screen flex flex-col bg-body-bg dark:bg-dark-body-bg">
        <PublicHeader />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="bg-card-bg dark:bg-dark-card-bg rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary dark:text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
            <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-primary mb-2">Under Maintenance</h1>
            <p className="text-text-secondary dark:text-dark-text-secondary">We're performing scheduled maintenance. Please check back shortly.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-body-bg text-text-success dark:bg-dark-body-bg dark:text-dark-text-tertiary">
      <Header />
      <main
        className="lg:container lg:mx-auto py-6 ml-2 lg:px-6 lg:flex-grow z-10"
      >
        <Outlet />
      </main>
    </div>
  )
}
