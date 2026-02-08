import React from 'react'

export function CollapsibleSection({ title, children, defaultOpen = true }) {
    return (
        <details open={defaultOpen} className="border border-gray-200 dark:border-dark-border rounded-lg p-4">
            <summary className="text-2xl font-semibold cursor-pointer">
                {title}
            </summary>
            <div className="mt-4 space-y-2">
                {children}
            </div>
        </details>
    )
}