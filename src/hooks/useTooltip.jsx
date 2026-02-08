import { useState, useEffect, useRef } from 'react'

export function useTooltip() {
    const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 })
    const tooltipRef = useRef(null)

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (tooltip.show) {
                setTooltip(prev => ({
                    ...prev,
                    x: e.clientX,
                    y: e.clientY
                }))
            }
        }

        document.addEventListener('mousemove', handleMouseMove)
        return () => document.removeEventListener('mousemove', handleMouseMove)
    }, [tooltip.show])

    const showTooltip = (content, event) => {
        setTooltip({
            show: true,
            content,
            x: event.clientX,
            y: event.clientY
        })
    }

    const hideTooltip = () => {
        setTooltip(prev => ({ ...prev, show: false }))
    }

    const TooltipComponent = () => {
        if (!tooltip.show) return null

        const tooltipStyle = {
            position: 'fixed',
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - (tooltipRef.current?.offsetHeight || 0) - 10}px`,
            zIndex: 50,
            pointerEvents: 'none'
        }

        // Prevent tooltip from going off-screen
        if (tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect()
            if (rect.right > window.innerWidth) {
                tooltipStyle.left = `${tooltip.x - tooltipRef.current.offsetWidth - 10}px`
            }
            if (rect.top < 0) {
                tooltipStyle.top = `${tooltip.y + 10}px`
            }
        }

        return (
            <div
                ref={tooltipRef}
                style={tooltipStyle}
                className="bg-gray-800 text-white text-sm p-2 rounded shadow-md"
            >
                {tooltip.content}
            </div>
        )
    }

    return { showTooltip, hideTooltip, TooltipComponent }
}

