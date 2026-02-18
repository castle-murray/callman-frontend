
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dropdown } from '../components/Dropdown'

export function MainMenu() {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const items = [
        { text: 'New Event', onClick: () => navigate('/dash/create-event') },
        { text: 'Contacts', onClick: () => navigate('/dash/contacts') },
        { text: 'Skills', onClick: () => navigate('/dash/skills') },
        { text: 'Locations', onClick: () => navigate('/dash/locations') },
    ]

    const btnClass = "bg-primary text-dark-text-primary px-4 py-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"

    return (
        <div className="mb-6">
            {/* Desktop: individual buttons */}
            <div className="hidden md:flex items-center gap-4">
                {items.map(item => (
                    <button key={item.text} onClick={item.onClick} className={btnClass}>
                        {item.text}
                    </button>
                ))}
            </div>

            {/* Mobile: dropdown */}
            <div className="md:hidden relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`${btnClass} flex items-center`}
                >
                    Menu
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <Dropdown
                    items={items}
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    selectedIndex={selectedIndex}
                    onSelect={setSelectedIndex}
                    position="left-0"
                    size="w-48"
                />
            </div>
        </div>
    )
}
