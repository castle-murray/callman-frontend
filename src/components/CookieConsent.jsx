import { useState, useEffect } from 'react'
import './CookieConsent.css'

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
    <div className="cookie-modal-overlay">
      <div className="cookie-modal">
        <div className="cookie-modal-content">
          <p>
            This website uses cookies to enhance your experience. By continuing to use this site, you agree to our use of cookies.
          </p>
          <div className="cookie-modal-buttons">
            <button onClick={acceptCookies} className="accept-btn">
              Accept All
            </button>
            <button onClick={declineCookies} className="decline-btn">
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent