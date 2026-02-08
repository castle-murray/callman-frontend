import { useTooltip } from '../hooks/useTooltip'

export function TooltipSpan({ children, tooltip, className = '' }) {
    const { showTooltip, hideTooltip, TooltipComponent } = useTooltip()

    return (
        <>
            <span
                className={`cursor-help ${className}`}
                onMouseEnter={(e) => showTooltip(tooltip, e)}
                onMouseLeave={hideTooltip}
                onClick={(e) => {
                    e.preventDefault()
                    showTooltip(tooltip, e)
                }}
            >
                {children}
            </span>
            <TooltipComponent />
        </>
    )
}

