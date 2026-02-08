import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/PublicHeader'

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function addDays(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d
}

function buildMockEvents() {
  const defs = [
    // Past events (6)
    { name: 'Jazz in the Park', startOff: -45, endOff: null, location: 'Memorial Park Bandshell', status: 'filled', description: 'Outdoor jazz series — final show of season', unfilled: 0, steward: 'Sarah Martinez' },
    { name: 'Indie Film Premiere', startOff: -32, endOff: null, location: 'Regal Cinema Downtown', status: 'filled', description: 'Red carpet premiere with AV and lighting', unfilled: 0, steward: 'No Steward' },
    { name: 'County Fair Setup', startOff: -25, endOff: -23, location: 'Fairgrounds Pavilion', status: 'filled', description: 'Annual county fair stage and tent setup', unfilled: 0, steward: 'Mike Torres' },
    { name: 'Broadway Showcase', startOff: -18, endOff: null, location: 'City Theater', status: 'filled', description: 'Live Broadway performance with full stage crew', unfilled: 0, steward: 'Mike Torres' },
    { name: 'Charity Gala Dinner', startOff: -10, endOff: null, location: 'Lakeside Resort', status: 'filled', description: 'Fundraiser dinner with live entertainment', unfilled: 0, steward: 'Sarah Martinez' },
    { name: 'Tech Conference', startOff: -6, endOff: -4, location: 'Convention Center', status: 'canceled', description: 'Technology industry conference', unfilled: 0, steward: 'Sarah Martinez' },
    // Future events (6)
    { name: 'Corporate Gala', startOff: 5, endOff: null, location: 'Grand Ballroom', status: 'filled', description: 'Annual black-tie corporate event', unfilled: 0, steward: 'Mike Torres' },
    { name: 'Summer Music Festival', startOff: 14, endOff: 16, location: 'Riverside Amphitheater', status: 'unfilled', description: 'Three-day outdoor music event', unfilled: 5, steward: 'Sarah Martinez' },
    { name: 'Auto Show', startOff: 28, endOff: 30, location: 'Expo Hall B', status: 'canceled', description: 'National auto show with exhibit builds', unfilled: 0, steward: 'Mike Torres' },
    { name: 'Wedding Expo', startOff: 42, endOff: 43, location: 'Grand Ballroom', status: 'unfilled', description: 'Vendor booths, stage, and lighting for bridal expo', unfilled: 4, steward: 'No Steward' },
    { name: 'College Homecoming', startOff: 55, endOff: null, location: 'University Stadium', status: 'unfilled', description: 'Homecoming concert and halftime show setup', unfilled: 6, steward: 'Mike Torres' },
    { name: 'Halloween Haunted House', startOff: 70, endOff: 86, location: 'Old Mill Warehouse', status: 'unfilled', description: 'Multi-week haunted attraction build and run', unfilled: 12, steward: 'Sarah Martinez' },
  ]
  return defs.map(({ startOff, endOff, ...rest }) => {
    const start = addDays(startOff)
    const end = endOff != null ? addDays(endOff) : null
    const date = end ? `${formatDate(start)} - ${formatDate(end)}` : formatDate(start)
    const isPast = start < new Date(new Date().setHours(0, 0, 0, 0))
    return { ...rest, date, isPast, startDate: start }
  })
}

const mockEvents = buildMockEvents()

const mockCallTimes = [
  {
    name: 'Load In', time: '8:00 AM', date: 'Jun 14',
    labor: [
      { type: 'Stagehand', needed: 6, confirmed: 6, available: 0, pending: 0, declined: 0 },
      { type: 'Rigger', needed: 2, confirmed: 2, available: 1, pending: 0, declined: 0 },
    ]
  },
  {
    name: 'Show Call', time: '2:00 PM', date: 'Jun 14',
    labor: [
      { type: 'Audio Tech', needed: 3, confirmed: 2, available: 0, pending: 1, declined: 0 },
      { type: 'Lighting Tech', needed: 2, confirmed: 1, available: 0, pending: 0, declined: 1 },
      { type: 'Stagehand', needed: 4, confirmed: 4, available: 2, pending: 0, declined: 0 },
    ]
  },
  {
    name: 'Strike', time: '11:00 PM', date: 'Jun 16',
    labor: [
      { type: 'Stagehand', needed: 8, confirmed: 0, available: 0, pending: 3, declined: 2 },
      { type: 'Rigger', needed: 3, confirmed: 0, available: 0, pending: 1, declined: 0 },
    ]
  },
]

const mockWorkers = [
  { name: 'Maria Garcia', phone: '(555)123-4567', skills: ['Stagehand', 'Rigger'] },
  { name: 'James Wilson', phone: '(555)234-5678', skills: ['Audio Tech', 'Stagehand'] },
  { name: 'Aisha Johnson', phone: '(555)345-6789', skills: ['Lighting Tech'] },
  { name: 'Carlos Rodriguez', phone: '(555)456-7890', skills: ['Stagehand', 'Rigger', 'Audio Tech'] },
  { name: 'Emily Chen', phone: '(555)567-8901', skills: ['Stagehand'] },
]

const mockTimeEntries = [
  { name: 'Maria Garcia', role: 'Stagehand', clockIn: '8:00 AM', clockOut: '4:30 PM', breaks: '12:00 PM (30m)', hours: '8.5', mealPenalty: 0 },
  { name: 'James Wilson', role: 'Audio Tech', clockIn: '8:00 AM', clockOut: '4:30 PM', breaks: '12:30 PM (30m)', hours: '8.5', mealPenalty: 0 },
  { name: 'Aisha Johnson', role: 'Lighting Tech', clockIn: '8:00 AM', clockOut: null, breaks: '1:00 PM (1hr)', hours: '—', mealPenalty: 0 },
  { name: 'Carlos Rodriguez', role: 'Rigger', clockIn: '8:00 AM', clockOut: '4:00 PM', breaks: 'None', hours: '8', mealPenalty: 1 },
  { name: 'Emily Chen', role: 'Stagehand', clockIn: '9:00 AM', clockOut: '5:30 PM', breaks: '3:00 PM (1hr)', hours: '7.5', mealPenalty: 1 },
  { name: 'Joe Spikings', role: 'Stagehand', clockIn: '8:00 AM', clockOut: '5:30 PM', breaks: '3:00 PM (1hr)', hours: '8.5', mealPenalty: 2},
]

const mockConfirmations = [
  { name: 'Maria Garcia', role: 'Stagehand', callTime: 'Load In - 8:00 AM', status: 'confirmed' },
  { name: 'James Wilson', role: 'Audio Tech', callTime: 'Show Call - 2:00 PM', status: 'confirmed' },
  { name: 'Aisha Johnson', role: 'Lighting Tech', callTime: 'Show Call - 2:00 PM', status: 'pending' },
  { name: 'Carlos Rodriguez', role: 'Rigger', callTime: 'Load In - 8:00 AM', status: 'declined' },
]

function DemoTooltip({ tooltip, children }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  return (
    <span
      className="relative"
      onMouseEnter={(e) => { setPos({ x: e.clientX, y: e.clientY }); setShow(true) }}
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          style={{ position: 'fixed', left: pos.x + 10, top: pos.y + 10, zIndex: 1000 }}
          className="bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap"
        >
          {tooltip}
        </div>
      )}
    </span>
  )
}

function DemoDropdown({ label, items, buttonClass }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`${buttonClass} flex items-center cursor-pointer`}
      >
        {label}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={open ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-1 z-30 bg-card-bg dark:bg-dark-card-bg border border-border-light dark:border-dark-border rounded-md shadow-lg min-w-48">
            {items.map((item) => (
              <DemoTooltip key={item.label} tooltip={item.tooltip}>
                <div className="px-4 py-2 text-sm text-text-primary dark:text-dark-text-primary hover:bg-body-bg dark:hover:bg-dark-body-bg cursor-help whitespace-nowrap">
                  {item.label}
                </div>
              </DemoTooltip>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function StatusBubble({ count, tooltip, bgClass }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  return (
    <>
      <span
        className={`w-6 h-6 ${bgClass} rounded-full flex items-center justify-center text-xs text-white font-bold cursor-help`}
        onMouseEnter={(e) => { setPos({ x: e.clientX, y: e.clientY }); setShow(true) }}
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setShow(false)}
      >
        {count}
      </span>
      {show && (
        <div
          style={{ position: 'fixed', left: pos.x + 10, top: pos.y + 10, zIndex: 1000 }}
          className="bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none"
        >
          {tooltip}
        </div>
      )}
    </>
  )
}

function filterEvents(events, query) {
  if (!query.trim()) return events
  const terms = query.toLowerCase().split(' ').filter(t => t.trim())
  return events.filter(event =>
    terms.every(term =>
      event.name.toLowerCase().includes(term) ||
      event.location.toLowerCase().includes(term) ||
      event.description.toLowerCase().includes(term)
    )
  )
}

function EventCard({ event }) {
  return (
    <div
      className={`border-b p-2 rounded-md pb-4 dark:border-dark-border-dark ${
        event.status === 'canceled'
          ? 'bg-cancelled-event-gradient dark:bg-dark-cancelled-event-gradient'
          : event.status === 'filled'
          ? 'bg-filled-event-gradient dark:bg-dark-filled-event-gradient'
          : ''
      }`}
    >
      <div className="flex items-center space-x-2">
        <div className="block flex-grow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-primary dark:text-dark-text-primary text-shadow-light dark:text-shadow-dark">
              {event.name}
            </h3>
            <div className="flex flex-col items-end space-y-1">
              <div className="flex items-center space-x-2">
                <span className="bg-primary text-dark-text-primary px-3 py-1 rounded text-sm opacity-75">Edit</span>
                <span className="bg-danger text-dark-text-primary px-3 py-1 rounded text-sm opacity-75">Delete</span>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary">Steward:</label>
                <select disabled className="px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm dark:bg-dark-card-bg dark:border-dark-border dark:text-dark-text-primary w-40 opacity-75">
                  <option>{event.steward}</option>
                </select>
              </div>
            </div>
          </div>
          <p className="text-text-secondary dark:text-dark-text-secondary">
            {event.date} @ {event.location}
          </p>
          <p className="text-text-secondary dark:text-dark-text-secondary">
            {event.description}
          </p>
          {event.status === 'canceled' && (
            <span className="text-lg block font-medium text-danger dark:text-dark-danger">Canceled</span>
          )}
          {event.status === 'filled' && (
            <span className="text-lg block font-medium text-secondary dark:text-dark-text-secondary">Filled</span>
          )}
          {event.status === 'unfilled' && (
            <span className="text-lg block font-medium text-yellow dark:text-dark-yellow">
              {event.unfilled} Unfilled Positions.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function Demo() {
  const [liveDemo, setLiveDemo] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [includePast, setIncludePast] = useState(false)

  return (
    <div className="min-h-screen bg-body-bg dark:bg-dark-body-bg">
      <title>CallManager Demo — See Event Staffing Software in Action</title>
      <meta name="description" content="See CallManager in action. Explore the dashboard, event scheduling, SMS worker requests, time tracking, and workforce management — all with realistic mock data." />
      <meta property="og:title" content="CallManager Demo — Event Staffing Software" />
      <meta property="og:description" content="Interactive demo showcasing CallManager's event staffing features: scheduling, SMS requests, time tracking, and worker management." />
      <meta property="og:type" content="website" />

      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-indigo dark:from-dark-primary dark:to-dark-indigo py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            See CallManager in Action
          </h1>
          <p className="text-lg text-blue-100 dark:text-blue-200 max-w-2xl mx-auto">
            Explore the features that help staffing companies save hours every week.
            Everything below is a realistic preview — no login required.
          </p>
        </div>
      </section>

      {/* Section 1: Dashboard & Events */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary text-center mb-3">
            Dashboard & Events
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary text-center mb-10 max-w-2xl mx-auto">
            Get a bird's-eye view of your operation. See upcoming events, pending requests, and key metrics at a glance.
          </p>

          {/* Stat Cards */}
          <div className="flex flex-col lg:flex-row justify-between mb-6 gap-4">
            {[
              { label: 'Upcoming Events', value: '12', color: 'text-primary dark:text-dark-text-blue' },
              { label: 'Pending Requests', value: '8', color: 'text-yellow dark:text-dark-yellow' },
              { label: 'Declined', value: '2', color: 'text-danger dark:text-dark-danger' },
              { label: 'SMS Sent', value: '156', color: 'text-success dark:text-dark-text-green' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card-bg p-4 rounded-lg shadow dark:bg-dark-card-bg dark:shadow-dark-shadow flex-1">
                <h3 className="text-text-secondary dark:text-dark-text-secondary text-sm">{stat.label}</h3>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Event List */}
          <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow-md">
            {liveDemo ? (
              <>
                <div className="mb-4 flex items-center space-x-4">
                  <div className="relative w-full max-w-md">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, location, or description"
                      className="w-full p-2 pr-8 border rounded bg-card-bg text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border dark:focus:ring-dark-primary"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                  <label className="flex items-center text-text-primary dark:text-dark-text-primary whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={includePast}
                      onChange={(e) => setIncludePast(e.target.checked)}
                      className="h-4 w-4 text-text-blue dark:text-dark-text-blue mr-2"
                    />
                    Include Past Events
                  </label>
                </div>
                <div className="space-y-4 max-h-[420px] overflow-y-auto">
                  {(() => {
                    const visible = includePast ? mockEvents : mockEvents.filter(e => !e.isPast)
                    const filtered = filterEvents(visible, searchQuery).sort((a, b) => b.startDate - a.startDate)
                    if (filtered.length === 0) {
                      return <p className="text-text-secondary dark:text-dark-text-secondary py-4 text-center">No events match your search.</p>
                    }
                    return filtered.map((event) => (
                      <EventCard key={event.name} event={event} />
                    ))
                  })()}
                </div>
              </>
            ) : (
              <>
              <div className="mb-4 flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search by name, location, or description"
                  disabled
                  className="w-full max-w-md p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border cursor-not-allowed opacity-75"
                />
                <label className="flex items-center text-text-primary dark:text-dark-text-primary whitespace-nowrap">
                  <input type="checkbox" disabled className="h-4 w-4 mr-2" />
                  Include Past Events
                </label>
              </div>
              <div className="space-y-4">
                {(() => {
                  const future = mockEvents.filter(e => !e.isPast).sort((a, b) => a.startDate - b.startDate)
                  const preview = [
                    future.find(e => e.status === 'filled'),
                    future.find(e => e.status === 'unfilled'),
                    future.find(e => e.status === 'canceled'),
                  ].filter(Boolean)
                  return preview.map((event) => (
                    <EventCard key={event.name} event={event} />
                  ))
                })()}
              </div>
              </>
            )}
            <div className="mt-4 text-center">
              <button
                onClick={() => { setLiveDemo(!liveDemo); setSearchQuery(''); setIncludePast(false) }}
                className="bg-primary text-dark-text-primary px-4 py-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover transition-colors"
              >
                {liveDemo ? 'Back to Preview' : 'Try Live Demo'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Event Details & Scheduling */}
      <section className="py-16 px-6 bg-card-bg dark:bg-dark-card-bg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary text-center mb-3">
            Event Details & Scheduling
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary text-center mb-10 max-w-2xl mx-auto">
            Drill into any event to manage call times and labor requirements. See exactly who's confirmed, who's needed, and send requests with one click.
          </p>

          <div className="max-w-4xl mx-auto">
            {/* Event Header */}
            <h3 className="text-2xl font-bold mb-4 text-text-heading dark:text-dark-text-primary">
              Summer Music Festival
            </h3>
            <div className="flex gap-2 mb-6">
              <DemoDropdown
                label="Actions"
                buttonClass="shadow-sm shadow-secondary dark:shadow-dark-secondary bg-primary text-dark-text-primary px-3 py-2 rounded text-sm hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                items={[
                  { label: 'Edit Event', tooltip: 'Change event name, dates, location, or description' },
                  { label: 'Send Messages', tooltip: 'Send SMS requests for all call times at once' },
                  { label: 'Send QR to all', tooltip: 'Text a clock-in QR link to every confirmed worker' },
                  { label: 'Scan QR Code', tooltip: 'Open camera to scan worker QR codes for clock-in/out' },
                  { label: 'Sign In Station', tooltip: 'Launch a kiosk mode for on-site worker check-in' },
                ]}
              />
            </div>

            <div className="bg-body-bg dark:bg-dark-body-bg p-4 rounded-lg shadow mb-6">
              <p className="text-text-tertiary dark:text-dark-text-tertiary"><strong>Date:</strong> June 14 - June 16, 2026</p>
              <p className="text-text-tertiary dark:text-dark-text-tertiary"><strong>Location:</strong> Riverside Amphitheater</p>
              <p className="text-text-tertiary dark:text-dark-text-tertiary">Three-day outdoor music event with multiple stages</p>
            </div>

            {/* Call Times */}
            <div className="bg-body-bg dark:bg-dark-body-bg p-4 rounded-lg shadow">
              <h4 className="text-xl font-semibold mb-4 text-text-heading dark:text-dark-text-primary">Call Times</h4>
              <div className="divide-y divide-primary dark:divide-dark-primary">
                {mockCallTimes.map((ct) => (
                  <div key={ct.name} className="py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="text-lg font-semibold text-primary dark:text-dark-text-blue">
                        {ct.name} - {ct.time} <span className="text-sm text-text-secondary dark:text-dark-text-secondary font-normal">{ct.date}</span>
                      </h5>
                      <DemoDropdown
                        label="Actions"
                        buttonClass="shadow-sm shadow-secondary dark:shadow-dark-secondary bg-primary text-dark-text-primary px-2 py-1 rounded text-xs hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                        items={[
                          { label: 'Time Sheet', tooltip: 'View and manage clock-in/out times and meal breaks' },
                          { label: 'Edit Call Time', tooltip: 'Change the name, date, or time for this call' },
                          { label: 'Copy Call Time', tooltip: 'Duplicate this call time to quickly create a similar one' },
                          { label: 'Send Reminder', tooltip: 'Send a reminder text to workers just before a show.' },
                          { label: 'Delete', tooltip: 'Permanently remove this call time and its requests' },
                        ]}
                      />
                      <DemoTooltip tooltip="Send SMS requests to all workers for this call time">
                        <span className="bg-success text-dark-text-primary px-2 py-1 rounded text-xs opacity-75 cursor-help">Send Call Time</span>
                      </DemoTooltip>
                    </div>
                    <ul className="mt-2 divide-y divide-success dark:divide-dark-secondary mb-2">
                      {ct.labor.map((labor) => {
                        const isFilled = labor.confirmed >= labor.needed
                        const isOverbooked = labor.confirmed > labor.needed
                        return (
                          <li key={labor.type} className="p-1 flex rounded-md shadow-md shadow-neutral-400 inset-shadow-md dark:shadow-neutral-800 justify-between bg-body-bg dark:bg-dark-card-bg items-center">
                            <div className="flex items-center">
                              <span className="ml-2">
                                <div className="flex flex-col md:flex-row">
                                  <div className="mr-2 text-text-primary dark:text-dark-text-primary">
                                    {labor.type} - {labor.needed}
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {isFilled && !isOverbooked && (
                                      <div className="text-success dark:text-dark-success mr-1">Filled</div>
                                    )}
                                    {isOverbooked && (
                                      <div className="text-danger mr-1">Overbooked by {labor.confirmed - labor.needed}</div>
                                    )}
                                    <StatusBubble count={labor.confirmed} tooltip={`Confirmed: ${labor.confirmed}`} bgClass="bg-success dark:bg-dark-success" />
                                    <StatusBubble count={labor.available} tooltip={`Available: ${labor.available}`} bgClass="bg-bg-available dark:bg-dark-bg-available" />
                                    <StatusBubble count={labor.pending} tooltip={`Pending: ${labor.pending}`} bgClass="bg-yellow dark:bg-dark-yellow" />
                                    <StatusBubble count={labor.declined} tooltip={`Declined: ${labor.declined}`} bgClass="bg-danger dark:bg-dark-danger" />
                                  </div>
                                </div>
                              </span>
                            </div>
                            <div className="space-x-2">
                              <DemoTooltip tooltip="Edit labor type or number needed">
                                <span className="inline-block bg-primary text-dark-text-primary px-2 shadow-sm shadow-secondary rounded text-sm opacity-75 cursor-help">Edit</span>
                              </DemoTooltip>
                              <DemoTooltip tooltip="Remove this labor requirement">
                                <span className="inline-block bg-danger text-dark-text-primary px-2 shadow-sm shadow-secondary rounded text-sm opacity-75 cursor-help">Delete</span>
                              </DemoTooltip>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    <DemoTooltip tooltip="Add a new labor type to this call time">
                      <span className="inline-block mt-2 bg-primary text-dark-text-primary px-2 py-1 rounded text-xs opacity-75 cursor-help">Add Labor</span>
                    </DemoTooltip>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: SMS & Confirmation Flow */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary text-center mb-3">
            SMS Requests & Confirmations
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary text-center mb-10 max-w-2xl mx-auto">
            Workers receive a text message with a link to confirm or decline. No app download needed — it all works from their phone's browser.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* SMS Preview */}
            <div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-primary mb-4">What Workers See</h3>
              <div className="bg-card-bg dark:bg-dark-card-bg rounded-xl shadow-md p-6 max-w-sm mx-auto">
                <div className="bg-body-bg dark:bg-dark-body-bg rounded-lg p-4 mb-4">
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">SMS from CallManager</p>
                  <p className="text-text-primary dark:text-dark-text-primary text-sm">
                    Hi Maria! You've been requested for <strong>Summer Music Festival</strong> on Jun 14 as a Stagehand (Load In - 8:00 AM).
                    Tap here to confirm: <span className="text-primary dark:text-dark-text-blue underline">callman.work/confirm/abc123</span>
                  </p>
                </div>
                <div className="border-t border-border-light dark:border-dark-border pt-4">
                  <h4 className="font-semibold text-text-heading dark:text-dark-text-primary mb-3">Summer Music Festival</h4>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">Jun 14, 2026 — Riverside Amphitheater</p>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">Load In - 8:00 AM — Stagehand</p>
                  <div className="flex gap-3">
                    <span className="flex-1 text-center bg-success text-white font-bold py-2 rounded-lg text-sm">Yes, I'm in</span>
                    <span className="flex-1 text-center bg-danger text-white font-bold py-2 rounded-lg text-sm">Decline</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Tracker */}
            <div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-primary mb-4">What Managers See</h3>
              <div className="bg-card-bg dark:bg-dark-card-bg rounded-xl shadow-md p-6">
                <h4 className="font-semibold text-text-heading dark:text-dark-text-primary mb-3">Request Status — Load In 8:00 AM</h4>
                <div className="space-y-3">
                  {mockConfirmations.map((conf) => (
                    <div key={conf.name} className="flex justify-between items-center p-2 rounded bg-body-bg dark:bg-dark-body-bg">
                      <div>
                        <p className="font-medium text-text-primary dark:text-dark-text-primary">{conf.name}</p>
                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{conf.role} — {conf.callTime}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        conf.status === 'confirmed' ? 'bg-success/20 text-success dark:text-dark-text-green' :
                        conf.status === 'declined' ? 'bg-danger/20 text-danger dark:text-dark-danger' :
                        'bg-yellow/20 text-yellow dark:text-dark-yellow'
                      }`}>
                        {conf.status === 'confirmed' ? 'Confirmed' : conf.status === 'declined' ? 'Declined' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-text-secondary dark:text-dark-text-secondary">
                  2 confirmed, 1 pending, 1 declined — 1 position still needs to be filled.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Time Tracking */}
      <section className="py-16 px-6 bg-card-bg dark:bg-dark-card-bg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary text-center mb-3">
            Time Tracking
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary text-center mb-10 max-w-2xl mx-auto">
            Track clock-in/out, meal breaks, and hours worked in real time. Workers scan a QR code or use an SMS link — no paper timesheets needed.
          </p>

          <div className="bg-body-bg dark:bg-dark-body-bg rounded-lg shadow p-4 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-primary">
                Time Sheet — Load In at 8:00 AM on 6/14/26
              </h3>
              <span className="bg-primary text-dark-text-primary px-3 py-1 rounded text-sm opacity-75">Print PDF</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Worker</th>
                  <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Role</th>
                  <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Clock In</th>
                  <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Breaks</th>
                  <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Clock Out</th>
                  <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Hours</th>
                  <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Meal Penalty</th>
                </tr>
              </thead>
              <tbody>
                {mockTimeEntries.map((entry) => (
                  <tr key={entry.name} className="hover:bg-card-bg dark:hover:bg-dark-border transition-colors">
                    <td className="p-3 font-medium text-text-primary dark:text-dark-text-primary">{entry.name}</td>
                    <td className="p-3 text-text-secondary dark:text-dark-text-secondary">{entry.role}</td>
                    <td className="p-3 text-text-primary dark:text-dark-text-primary">
                      {entry.clockIn || <span className="text-text-secondary dark:text-dark-text-secondary italic">Not signed in</span>}
                    </td>
                    <td className="p-3 text-text-primary dark:text-dark-text-primary">
                      {entry.breaks || 'None'}
                    </td>
                    <td className="p-3 text-text-primary dark:text-dark-text-primary">
                      {entry.clockOut || (entry.clockIn ? <span className="text-yellow dark:text-dark-yellow italic">Working</span> : '—')}
                    </td>
                    <td className="p-3 font-medium text-text-primary dark:text-dark-text-primary">{entry.hours}</td>
                    <td className="p-3">
                      {entry.mealPenalty > 0 ? (
                        <span className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                          {entry.mealPenalty} hr
                        </span>
                      ) : (
                        <span className="text-text-secondary dark:text-dark-text-secondary text-sm">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 5: Worker Management */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary text-center mb-3">
            Worker Management
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary text-center mb-10 max-w-2xl mx-auto">
            Keep your entire roster in one place. Track skills, phone numbers, and work history for every worker — no per-employee fees.
          </p>

          <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow-md max-w-3xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <input
                type="text"
                placeholder="Search by name or phone..."
                disabled
                className="w-full max-w-md p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border cursor-not-allowed opacity-75"
              />
              <span className="bg-primary text-dark-text-primary px-3 py-2 rounded text-sm opacity-75 ml-4 whitespace-nowrap">Add Worker</span>
            </div>
            <p className="mb-4 text-text-secondary dark:text-dark-text-secondary">{mockWorkers.length} Contacts</p>
            <ul className="space-y-2">
              {mockWorkers.map((worker) => (
                <li key={worker.name} className="border-b p-3 dark:border-dark-border-dark flex justify-between items-center">
                  <div>
                    <span className="font-medium text-text-primary dark:text-dark-text-primary">{worker.name}</span>
                    <span className="text-text-secondary dark:text-dark-text-secondary ml-2">— {worker.phone}</span>
                    <div className="flex gap-1 mt-1">
                      {worker.skills.map((skill) => (
                        <span key={skill} className="bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-text-blue px-2 py-0.5 rounded text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="px-3 py-2 bg-gray-500 text-white rounded text-sm opacity-75">Options</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary to-indigo dark:from-dark-primary dark:to-dark-indigo">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Streamline Your Staffing?
          </h2>
          <p className="text-blue-100 dark:text-blue-200 mb-3">
            Contact our sales team to get started.
          </p>
          <p className="text-white font-medium mb-8">
            sales@callman.work
          </p>
          <Link
            to="/login"
            className="inline-block bg-white text-primary font-bold py-3 px-10 rounded-lg text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border-light dark:border-dark-border">
        <p className="text-center text-text-secondary dark:text-dark-text-secondary text-sm">
          &copy; {new Date().getFullYear()} Callman. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
