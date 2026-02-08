import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMessages } from '../contexts/MessageContext'
import api from '../api'

export function ClockInOut() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { addMessage } = useMessages()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/clock-in/${token}/`)
        setData(response.data)
      } catch (error) {
        console.error('Fetch error:', error)
        addMessage('Failed to load clock-in data: ' + (error.response?.data?.message || error.message), 'error')
        navigate('/dash')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token, addMessage, navigate])

  const handleSubmit = async (callTimeId, action) => {
    try {
      const response = await api.post(`/api/clock-in/${token}/`, {
        call_time_id: callTimeId,
        action: action
      })
      addMessage(response.data.message || 'Action completed successfully', 'success')
      // Refresh the data to update statuses
      const fetchResponse = await api.get(`/api/clock-in/${token}/`)
      setData(fetchResponse.data)
    } catch (error) {
      console.error('Submit error:', error)
      const message = error.response?.data?.message || 'Failed to perform action'
      addMessage(message, 'error')
      if (message.includes('steward')) {
        setTimeout(() => navigate(`/event/${data.event.slug}/scan-qr`), 3000)
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-card-bg dark:bg-dark-card-bg rounded-lg shadow-md">
        <p>Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-card-bg dark:bg-dark-card-bg rounded-lg shadow-md">
        <p>Error loading data.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card-bg dark:bg-dark-card-bg rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">
        Clock In/Out for {data.event.name}
      </h1>
      <p className="mb-4 text-text-primary dark:text-dark-text-primary">
        Welcome, {data.worker.name}
      </p>
      <div className="space-y-4">
        {data.call_times.map(ct => (
          <div key={ct.id} className="flex justify-between items-center p-4 border rounded bg-card-bg dark:bg-dark-card-bg dark:border-dark-border">
            <div>
              <p className="font-semibold">{ct.title}</p>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                {ct.date} at {ct.time}
              </p>
            </div>
            <button
              onClick={() => handleSubmit(ct.id, ct.is_signed_in ? 'clock_out' : 'clock_in')}
              className={`px-4 py-2 rounded ${
                ct.is_signed_in
                  ? 'bg-secondary text-dark-text-primary hover:bg-secondary-hover dark:bg-dark-secondary dark:hover:bg-dark-secondary-hover'
                  : 'bg-primary text-white hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover'
              }`}
            >
              {ct.is_signed_in ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}