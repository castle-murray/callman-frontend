import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../api'
import { PublicHeader } from '../components/PublicHeader'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/contact/', data)
      return response.data
    },
    onSuccess: () => {
      setSubmitted(true)
    },
  })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    mutate(formData)
  }

  const inputClass = "w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"

  return (
    <div className="min-h-screen bg-body-bg dark:bg-dark-body-bg">
      <title>Contact CallManager — Get in Touch With Our Sales Team</title>
      <meta name="description" content="Contact CallManager's sales team. Schedule a demo, ask questions, or learn how CallManager can streamline your event staffing operations." />
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary to-indigo dark:from-dark-primary dark:to-dark-indigo py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-blue-100 dark:text-blue-200 max-w-2xl mx-auto">
              Have questions about CallManager? Want to schedule a demo? We'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="py-20 px-6">
          <div className="max-w-lg mx-auto">
            <div className="bg-card-bg dark:bg-dark-card-bg rounded-xl shadow-md p-8">
              {submitted ? (
                <div className="text-center">
                  <svg className="w-16 h-16 text-success dark:text-dark-text-green mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-text-heading dark:text-dark-text-primary mb-2">
                    Message Sent
                  </h2>
                  <p className="text-text-secondary dark:text-dark-text-secondary mb-6">
                    Thank you for reaching out. Our sales team will get back to you shortly.
                  </p>
                  <Link
                    to="/"
                    className="text-primary dark:text-dark-text-blue hover:underline font-medium"
                  >
                    Back to Home
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-text-heading dark:text-dark-text-primary mb-6">
                    Send Us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className={inputClass}
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className={inputClass}
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
                        Phone <span className="text-text-tertiary dark:text-dark-text-tertiary font-normal">(optional)</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className={inputClass}
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
                        Company
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        required
                        className={inputClass}
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        className={inputClass + " resize-vertical"}
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>
                    {error && (
                      <p className="text-danger dark:text-dark-text-red text-sm">
                        {error.response?.data?.message || 'Something went wrong. Please try again.'}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50 font-medium"
                    >
                      {isPending ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border-light dark:border-dark-border">
        <p className="text-center text-text-secondary dark:text-dark-text-secondary text-sm">
          &copy; {new Date().getFullYear()} Callman. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
