import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import api from '../api'
import useWebSocketNotifications from '../hooks/useWebSocketNotifications'
import NotificationsModal from './NotificationsModal'

function logout() {
  localStorage.removeItem('authToken')
    localStorage.removeItem('user')

  window.location.href = '/login'
}


export default function Header({ children, title = "CallManager" }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    const isDark = savedTheme === 'dark'
    // Apply theme immediately
    document.documentElement.classList.toggle('dark', isDark)
    return isDark
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const navigate = useNavigate()

  const { data: user, error: userError, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.get('/user/info/')
      return response.data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  const { notifications, unreadCount, markAsRead, deleteNotification, clearAllNotifications, clearReadNotifications } = useWebSocketNotifications()



  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('authToken')
    setIsAuthenticated(!!token)
    setIsLoading(false)

    // Redirect to login if not authenticated and not already on login page
    if (!token && window.location.pathname !== '/login' && !window.location.pathname.includes('/confirm/')) {
      navigate('/login')
    }
  }, [])
  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    const theme = newMode ? 'dark' : 'light'
    localStorage.setItem('theme', theme)
    if (newMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      document.getElementById('sun-icon').classList.add('hidden')
      document.getElementById('moon-icon').classList.remove('hidden')
    } else {
      document.getElementById('sun-icon').classList.remove('hidden')
      document.getElementById('moon-icon').classList.add('hidden')
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
    document.documentElement.classList.toggle('dark', newMode)
  }


  return (
    <>
      <header className="bg-card-bg shadow dark:bg-dark-header-bg dark:shadow-dark-shadow">
        <nav className="container mx-auto p-4">
          <div className="flex justify-between items-center">
            <a href={user?.user?.isSteward && !user?.user?.isManager ? '/dash/steward' : '/dash'} className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
              CallManager
            </a>
            
            <div className="flex items-center space-x-4">
              {!isAuthenticated && (
                <a href="/login" className="text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover">
                  Login
                </a>
              )}
              {isAuthenticated && user?.user?.isManager && (
                <a href="/dash" className="text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover">
                  Dashboard
                </a>
              )}
              {isAuthenticated && user?.user?.has_userprofile && (
                <a href="/dash/profile" className="text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover">
                  Profile
                </a>
              )}
              {isAuthenticated && user?.user?.isSteward && (
                <a href="/dash/steward" className="text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover">
                  Steward
                </a>
              )}
              {isAuthenticated && (
                <>
                  <button onClick={logout} className="text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover">
                    Logout
                  </button>
                  <button
                    onClick={() => setIsNotificationsOpen(true)}
                    className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="w-6 h-6 text-text-tertiary dark:text-dark-text-tertiary hover:text-primary dark:hover:text-dark-text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </>
              )}
              {isAuthenticated && user?.user?.isOwner && (
                <a href="/dash/company/settings" className="text-primary hover:underline dark:text-dark-text-blue dark:hover:text-dark-primary-hover">
                    <svg className="w-6 h-6 text-text-tertiary dark:text-dark-text-tertiary hover:text-primary dark:hover:text-dark-text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                </a>
              )}
            
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
    
                  <svg id="sun-icon" className="w-6 h-6 block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <svg id="moon-icon" className="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {isNotificationsOpen && (
        <NotificationsModal
          notifications={notifications}
          unreadCount={unreadCount}
          onClose={() => setIsNotificationsOpen(false)}
          markAsRead={markAsRead}
          deleteNotification={deleteNotification}
          clearAllNotifications={clearAllNotifications}
          clearReadNotifications={clearReadNotifications}
        />
      )}
    </>
  )
}
