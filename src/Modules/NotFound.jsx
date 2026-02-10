import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/PublicHeader'

export function NotFound() {
  const isAuthenticated = !!localStorage.getItem('authToken')
  const homeLink = isAuthenticated ? '/dash' : '/'

  return (
    <div className="min-h-screen bg-gradient-to-br from-body-bg via-body-bg to-primary/5 dark:from-dark-body-bg dark:via-dark-body-bg dark:to-dark-primary/10 flex flex-col">
      <PublicHeader className="sticky top-0 z-10 bg-card-bg/80 dark:bg-dark-card-bg/80 backdrop-blur-sm shadow-md" />

      <main className="flex-grow flex items-center justify-center px-6">
        <div className="text-center">
          {/* Decorative background circles */}
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-8 bg-primary/5 dark:bg-dark-primary/10 rounded-full blur-2xl" />
            <div className="absolute -inset-4 bg-indigo/5 dark:bg-dark-indigo/10 rounded-full blur-xl" />
            <h1 className="relative text-[10rem] md:text-[12rem] font-black leading-none bg-gradient-to-br from-primary to-indigo dark:from-dark-primary dark:to-dark-indigo bg-clip-text text-transparent select-none">
              404
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary mb-3">
            Lost in the schedule
          </h2>
          <p className="text-lg text-text-secondary dark:text-dark-text-secondary mb-10 max-w-md mx-auto">
            This page doesn't exist — but your next event is waiting.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              to={homeLink}
              className="bg-gradient-to-r from-primary to-indigo dark:from-dark-primary dark:to-dark-indigo hover:shadow-lg hover:shadow-primary/25 dark:hover:shadow-dark-primary/25 text-white font-bold py-3 px-10 rounded-lg transition-all duration-200 shadow-md"
            >
              Take me home
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="border border-border-light dark:border-dark-border text-text-heading dark:text-dark-text-primary font-bold py-3 px-10 rounded-lg hover:border-primary dark:hover:border-dark-primary hover:text-primary dark:hover:text-dark-text-blue transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
