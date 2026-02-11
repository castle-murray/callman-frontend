import { useState, useEffect } from 'react'

const CookieConsent = () => {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShowModal(false)
  }

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setShowModal(false)
  }

  if (!showModal) return null

  return (
      <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6 animate-fadeIn">
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
          This website uses cookies to enhance your experience. By continuing to use this site, you agree to our use of cookies.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={acceptCookies}
            className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={declineCookies}
            className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
