import { useState, useCallback } from 'react'

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmWord, isPending = false }) {
    const [inputValue, setInputValue] = useState('')

    const inputCallbackRef = useCallback((node) => {
        if (node) {
            setTimeout(() => node.focus(), 100)
        }
    }, [])

    const handleClose = useCallback(() => {
        setInputValue('')
        onClose()
    }, [onClose])

    if (!isOpen) return null

    const requiresTyping = !!confirmWord
    const isMatch = requiresTyping ? inputValue === confirmWord : true

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
            <div
                className="bg-card-bg dark:bg-dark-card-bg rounded-lg shadow-lg p-6 w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-heading dark:text-dark-text-primary">
                        {title}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <p className="text-text-tertiary dark:text-dark-text-tertiary mb-4">
                    {message}
                </p>

                {requiresTyping && (
                    <>
                        <p className="text-text-tertiary dark:text-dark-text-tertiary font-semibold mb-4">
                            This cannot be undone.
                        </p>
                        <label className="block text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                            Type <span className="font-mono font-bold">{confirmWord}</span> to confirm
                        </label>
                        <input
                            ref={inputCallbackRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && isMatch && !isPending) onConfirm() }}
                            className="w-full p-2 border rounded mb-4 bg-card-bg text-text-tertiary focus:outline-none focus:ring-2 focus:ring-danger dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border dark:focus:ring-dark-danger"
                            placeholder={confirmWord}
                        />
                    </>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 rounded border border-gray-300 dark:border-dark-border text-text-tertiary dark:text-dark-text-tertiary hover:bg-body-bg dark:hover:bg-dark-body-bg"
                    >
                        {requiresTyping ? 'Go Back' : 'No'}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!isMatch || isPending}
                        className="bg-danger text-dark-text-primary px-4 py-2 rounded hover:bg-danger-hover dark:bg-dark-danger dark:hover:bg-dark-danger-hover disabled:opacity-50"
                    >
                        {isPending ? 'Processing...' : requiresTyping ? 'Confirm' : 'Yes'}
                    </button>
                </div>
            </div>
        </div>
    )
}
