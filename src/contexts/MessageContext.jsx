import { createContext, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'


const MessageContext = createContext()

export function MessageProvider({ children }) {
    const [messages, setMessages] = useState([])

    const addMessage = (text, type = 'info') => {
        const id = Date.now() + Math.random()
        setMessages(prev => [...prev, {id, text, type}])
        setTimeout(() => {
            setMessages(prev => prev.filter(m => m.id !== id))
        }, 5000)
    }

    return (
        <MessageContext.Provider value={{ addMessage }}>
            {children}
            {messages.length > 0 && (
                <div className="fixed top-16 left-4 z-50 flex flex-col">
                    <AnimatePresence>
                        {messages.map(m => {
                            const borderClass = {
                                info: 'border-l-blue-500 dark:border-l-blue-400',
                                success: 'border-l-green-500 dark:border-l-green-400',
                                error: 'border-l-red-500 dark:border-l-red-400'
                            }[m.type] || 'border-l-blue-500 dark:border-l-blue-400'
                            return (
                                <motion.div
                                    key={m.id}
                                    initial={{ y: -100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -100, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className={`p-4 bg-white text-gray-800 rounded border-r border-t border-b border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-r-gray-600 dark:border-t-gray-600 dark:border-b-gray-600 mb-2 shadow-lg max-w-sm border-l-4 ${borderClass}`}
                                >
                                    {m.text}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}
        </MessageContext.Provider>
    )
}

export function useMessages() {
    return useContext(MessageContext)
}