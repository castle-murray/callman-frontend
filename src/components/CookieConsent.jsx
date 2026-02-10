import { useState } from 'react'
import './CookieConsent.css'

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(() => {
    const consent = localStorage.getItem('cookieConsent')
    return !consent
  })

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShowBanner(false)
  }

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-consent-content">
        <p>
          This website uses cookies to enhance your experience. By continuing to use this site, you agree to our use of cookies.
        </p>
        <div className="cookie-consent-buttons">
          <button onClick={acceptCookies} className="accept-btn">
            Accept All
          </button>
          <button onClick={declineCookies} className="decline-btn">
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent