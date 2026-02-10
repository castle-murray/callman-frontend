import { useState } from 'react'
import { Link } from 'react-router-dom'

export function PublicHeader({ className = '' }) {
  const isAuthenticated = !!localStorage.getItem('authToken')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    return savedTheme === 'dark'
  })

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
    document.documentElement.classList.add('theme-transitioning')
    document.documentElement.classList.toggle('dark', newMode)
    document.documentElement.classList.toggle('light', !newMode)
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 350)
  }

  const linkClass = "text-primary dark:text-dark-text-blue font-medium hover:underline"

  return (
    <nav className={className || 'sticky top-0 z-10 bg-card-bg dark:bg-dark-card-bg shadow-md'}>
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-3">
        <Link to="/" className="text-xl font-bold text-text-heading dark:text-dark-text-primary">CallManager</Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg hover:bg-body-bg dark:hover:bg-dark-body-bg text-text-secondary dark:text-dark-text-secondary"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className={linkClass}>Home</Link>
            <Link to="/about" className={linkClass}>About</Link>
            <Link to="/demo" className={linkClass}>Demo</Link>
            {isAuthenticated ? (
              <Link to="/dash" className={linkClass}>Dashboard</Link>
            ) : (
              <Link to="/login" className={linkClass}>Login</Link>
            )}
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle navigation menu" className="md:hidden p-2 rounded-lg hover:bg-body-bg dark:hover:bg-dark-body-bg text-text-secondary dark:text-dark-text-secondary">
            <span className="block w-5 h-0.5 bg-current mb-1"></span>
            <span className="block w-5 h-0.5 bg-current mb-1"></span>
            <span className="block w-5 h-0.5 bg-current"></span>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden absolute top-full right-0 bg-card-bg dark:bg-dark-card-bg shadow-md rounded-b-md p-4 flex flex-col space-y-2 w-48">
          <Link to="/" className={linkClass} onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/about" className={linkClass} onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link to="/demo" className={linkClass} onClick={() => setIsMenuOpen(false)}>Demo</Link>
          {isAuthenticated ? (
            <Link to="/dash" className={linkClass} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
          ) : (
            <Link to="/login" className={linkClass} onClick={() => setIsMenuOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  )
}
