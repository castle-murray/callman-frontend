import { useEffect, useRef } from 'react'

export function Dropdown({ items, isOpen, onClose, selectedIndex, onSelect, position = 'right-0', size = 'w-48' }) {
    const dropdownRef = useRef()

    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            dropdownRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            ref={dropdownRef}
            className={`absolute ${position} mt-2 ${size} bg-card-bg dark:bg-dark-card-bg rounded-lg shadow-sm border border-gray-200 dark:border-dark-border z-10`}
            onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    onSelect((selectedIndex + 1) % items.length)
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    onSelect((selectedIndex - 1 + items.length) % items.length)
                } else if (e.key === 'Enter') {
                    e.preventDefault()
                    items[selectedIndex]?.onClick()
                    onClose()
                } else if (e.key === 'Escape') {
                    onClose()
                }
            }}
            tabIndex={-1}
        >
            {items.map((item, index) => (
                <button
                    key={index}
                    onClick={() => { item.onClick(); onClose() }}
                    className={`block w-full text-left px-4 py-2 text-text-tertiary dark:text-dark-text-tertiary hover:bg-gray-100 dark:hover:bg-dark-border-dark ${selectedIndex === index ? 'bg-blue-100 dark:bg-blue-900' : ''} ${item.className || ''}`}
                    disabled={item.disabled}
                >
                    {item.text}
                </button>
            ))}
        </div>
    )
}