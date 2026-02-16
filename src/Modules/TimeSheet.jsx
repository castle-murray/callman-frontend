import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useMessages } from '../contexts/MessageContext'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export function TimeSheet() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const { addMessage } = useMessages()
    const queryClient = useQueryClient()
    const [laborTypeFilter, setLaborTypeFilter] = useState('All')
    const [editingStartTime, setEditingStartTime] = useState(null)
    const [editingEndTime, setEditingEndTime] = useState(null)
    const [startTimeValue, setStartTimeValue] = useState('')
    const [endTimeValue, setEndTimeValue] = useState('')
    const [showingMealMenu, setShowingMealMenu] = useState(null)
    const [editingMealBreak, setEditingMealBreak] = useState(null)
    const [mealBreakValue, setMealBreakValue] = useState('')
    const [selected, setSelected] = useState([])
    const [lastSelectedId, setLastSelectedId] = useState(null)
    const [massAction, setMassAction] = useState('')
    const [massClockIn, setMassClockIn] = useState(new Date().toISOString().slice(0, 16))
    const [massClockOut, setMassClockOut] = useState(new Date().toISOString().slice(0, 16))
    const [massBreakTime, setMassBreakTime] = useState(new Date().toISOString().slice(0, 16))
    const [massBreakDuration, setMassBreakDuration] = useState('30')

    const { data, error, isLoading } = useQuery({
        queryKey: ['timeSheet', slug],
        queryFn: async () => {
            const response = await api.get(`/call-times/${slug}/tracking/`)
            return response.data
        }
    })

    const actionMutation = useMutation({
        mutationFn: async ({ requestId, action, data = {} }) => {
            const response = await api.post(`/call-times/${slug}/tracking/`, { request_id: requestId, action, ...data })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['timeSheet', slug])
            addMessage('Action completed successfully', 'success')
        },
        onError: (error) => {
            addMessage('Error performing action: ' + error.message, 'error')
        }
    })

    const handleAction = (requestId, action, data = {}) => {
        actionMutation.mutate({ requestId, action, data })
    }

    const toggleSelected = (id, event, requests) => {
        const currentIndex = requests.findIndex(r => r.id === id)
        const toggle = () => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
        if (event.shiftKey && lastSelectedId !== null) {
            const lastIndex = requests.findIndex(r => r.id === lastSelectedId)
            if (lastIndex !== -1) {
                const start = Math.min(lastIndex, currentIndex)
                const end = Math.max(lastIndex, currentIndex)
                const rangeIds = requests.slice(start, end + 1).map(r => r.id)
                setSelected(rangeIds)
            } else {
                toggle()
            }
        } else {
            toggle()
            setLastSelectedId(id)
        }
    }

    const applyMassAction = () => {
        selected.forEach(id => {
            if (massAction === 'clock_in') {
                handleAction(id, 'update_start_time', { new_time: massClockIn })
            } else if (massAction === 'clock_out') {
                handleAction(id, 'update_end_time', { new_time: massClockOut })
            } else if (massAction === 'add_meal_break') {
                handleAction(id, 'add_meal_break', { break_time: massBreakTime, type: massBreakDuration })
            }
        })
        setMassAction('')
        setMassClockIn(new Date().toISOString().slice(0, 16))
        setMassClockOut(new Date().toISOString().slice(0, 16))
        setMassBreakTime(new Date().toISOString().slice(0, 16))
        setMassBreakDuration('30')
    }

    const formatTime = (isoString) => {
        if (!isoString) return 'N/A'
        const date = new Date(isoString)
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const period = hours >= 12 ? 'PM' : 'AM'
        const hour12 = hours % 12 || 12
        if (minutes === 0) {
            return `${hour12} ${period}`
        } else {
            return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
        }
    }

    const formatTimeSimple = (timeStr) => {
        if (!timeStr) return 'N/A'
        const [hours, minutes] = timeStr.split(':').map(Number)
        const period = hours >= 12 ? 'PM' : 'AM'
        const hour12 = hours % 12 || 12
        if (minutes === 0) {
            return `${hour12} ${period}`
        } else {
            return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const [year, month, day] = dateStr.split('-')
        return `${month}/${day}/${year.slice(-2)}`
    }

    const generatePDF = () => {
        const doc = new jsPDF();
        const headerText = `${call_time.event_name || ''} - ${call_time.name} - ${formatDate(call_time.date)} - ${call_time.time ? formatTimeSimple(call_time.time) : ''}`.trim();
        // Header
        doc.setFontSize(14);
        doc.text(company_name || 'Company Name', 20, 20);
        doc.text(headerText, 120, 20);
        // Table
        const tableData = [];
        labor_requests.filter(request => request.time_entry).forEach(request => {
                const breaks = (request.time_entry.meal_breaks || []).slice().sort((a, b) => new Date(a.break_time) - new Date(b.break_time));
                const row = [
                    request.worker?.name || 'N/A',
                    request.labor_requirement?.labor_type?.name || 'N/A',
                    request.time_entry.start_time ? formatTime(request.time_entry.start_time) : 'N/A',
                    breaks.map(mb => formatTime(mb.break_time) + (mb.duration === 60 ? "(1hr)" : "(" + mb.duration + "m)")).join(', '),
                    request.time_entry.end_time ? formatTime(request.time_entry.end_time) : 'N/A',
                    `${request.time_entry.normal_hours ? request.time_entry.normal_hours.toFixed(2).replace(/\.?0+$/, '') : '0'} | ${request.time_entry.meal_penalty_hours ? request.time_entry.meal_penalty_hours.toFixed(2).replace(/\.?0+$/, '') : '0'} | ${request.time_entry.total_hours_worked ? request.time_entry.total_hours_worked.toFixed(2).replace(/\.?0+$/, '') : '0'}`
                ];
                tableData.push(row);
        });
        autoTable(doc, {
            head: [['Name', 'Role', 'Clock In', 'Breaks', 'Clock Out', 'Reg|MP|Total']],
            body: tableData,
            startY: 30,
            margin: { top: 30 },
            didDrawPage: (data) => {
                doc.setFontSize(14);
                doc.text(company_name || 'Company Name', 20, 20);
                doc.text(headerText, 120, 20);
            },
        });
        doc.save(`${call_time.event_name}-${call_time.name}.pdf`);
    };

    if (error) {
        addMessage('Error loading time sheet: ' + error.message, 'error')
        return <div>Failed to load.</div>
    }

    if (isLoading) return <div>Loading...</div>

    if (!data) return <div>No data</div>

    const { call_time, labor_requests, labor_types, meal_penalty_trigger_time, meal_penalty_diff, company_name } = data

    const confirmedRequests = labor_requests.filter(request => !request.ncns)
    const ncnsRequests = labor_requests.filter(request => request.ncns)

    const filteredConfirmedRequests = laborTypeFilter === 'All' ? confirmedRequests : confirmedRequests.filter(request => request.labor_requirement.labor_type.id === parseInt(laborTypeFilter))
    const filteredNcnsRequests = laborTypeFilter === 'All' ? ncnsRequests : ncnsRequests.filter(request => request.labor_requirement.labor_type.id === parseInt(laborTypeFilter))

    const renderTable = (requests, title, isNcns = false) => (
        <div className="mb-8">
            {requests.length > 0 ? (
                <>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-dark-border">
                                <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium no-print">
                                    <input
                                        type="checkbox"
                                        checked={requests.length > 0 && requests.every(r => selected.includes(r.id))}
                                        onChange={() => {
                                            const allSelected = requests.every(r => selected.includes(r.id))
                                            if (allSelected) {
                                                setSelected(prev => prev.filter(id => !requests.some(r => r.id === id)))
                                            } else {
                                                setSelected(prev => [...new Set([...prev, ...requests.map(r => r.id)])])
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    Select All
                                </th>
                                <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Worker</th>
                                <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Role</th>
                                <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Clock In</th>
                                <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Breaks</th>
                                <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Clock Out</th>
                                <th className="text-left p-3 text-text-secondary dark:text-dark-text-secondary font-medium">Reg|MP|Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((request, index) => (
                                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                                    <td className="p-3"><input type="checkbox" checked={selected.includes(request.id)} onChange={(e) => toggleSelected(request.id, e, requests)} className="rounded" /></td>
                                    <td className="p-3 font-medium text-text-primary dark:text-dark-text-primary">{request.worker.name}</td>
                                    <td className="p-3 text-text-secondary dark:text-dark-text-secondary">{request.labor_requirement.labor_type.name}</td>
                                    <td className="p-3">
                                        {editingStartTime === request.id ? (
                                            <div className="flex space-x-2">
                                                <input
                                                    type="datetime-local"
                                                    value={startTimeValue}
                                                    onChange={(e) => setStartTimeValue(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { handleAction(request.id, 'update_start_time', { new_time: startTimeValue }); setEditingStartTime(null); } }}
                                                    className="p-1 border rounded text-sm"
                                                />
                                                <button
                                                    onClick={() => {
                                                        handleAction(request.id, 'update_start_time', { new_time: startTimeValue })
                                                        setEditingStartTime(null)
                                                    }}
                                                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                                                    disabled={actionMutation.isLoading}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingStartTime(null)}
                                                    className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : request.time_entry ? (
                                            <span
                                                className="cursor-pointer hover:underline"
                                                onClick={() => {
                                                    setEditingStartTime(request.id)
                                                    setStartTimeValue(request.time_entry.start_time.slice(0, 16)) // to YYYY-MM-DDTHH:MM
                                                }}
                                            >
                                                {formatTime(request.time_entry.start_time)}
                                            </span>
                                        ) : isNcns ? (
                                            <button
                                                onClick={() => handleAction(request.id, 'showed_up')}
                                                className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                                                disabled={actionMutation.isLoading}
                                            >
                                                Showed Up
                                            </button>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleAction(request.id, 'sign_in')}
                                                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                                                    disabled={actionMutation.isLoading}
                                                >
                                                    Sign In
                                                </button>
                                                <button
                                                    onClick={() => handleAction(request.id, 'ncns')}
                                                    className="bg-purple-500 text-white px-2 py-1 rounded text-sm"
                                                    disabled={actionMutation.isLoading}
                                                >
                                                    NCNS
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                {request.time_entry?.meal_breaks?.length > 0 ? (
                                                    request.time_entry.meal_breaks.map((mb, index) => {
                                                        const endTime = new Date(new Date(mb.break_time).getTime() + mb.duration * 60000).toISOString()
                                                        return (
                                                            <div key={`${request.id}-mb-${index}`} className="mb-1">
                                                                {editingMealBreak?.mealBreakId === mb.id ? (
                                                                    <div className="flex space-x-2">
                                                                        <input
                                                                            type="datetime-local"
                                                                            value={mealBreakValue.split('|')[0]}
                                                                            onChange={(e) => setMealBreakValue(`${e.target.value}|${mealBreakValue.split('|')[1]}`)}
                                                                            onKeyUp={(e) => { if (e.key === 'Enter') { const [breakTime, duration] = mealBreakValue.split('|'); handleAction(request.id, 'update_meal_break', { meal_break_id: mb.id, break_time: breakTime, duration: parseInt(duration) }); setEditingMealBreak(null); } }}
                                                                            className="p-1 border rounded text-sm"
                                                                        />
                                                                        <select
                                                                            value={mealBreakValue.split('|')[1]}
                                                                            onChange={(e) => setMealBreakValue(`${mealBreakValue.split('|')[0]}|${e.target.value}`)}
                                                                            onKeyUp={(e) => { if (e.key === 'Enter') { const [breakTime, duration] = mealBreakValue.split('|'); handleAction(request.id, 'update_meal_break', { meal_break_id: mb.id, break_time: breakTime, duration: parseInt(duration) }); setEditingMealBreak(null); } }}
                                                                            className="p-1 border rounded text-sm"
                                                                        >
                                                                            <option value="30">30m</option>
                                                                            <option value="60">1hr</option>
                                                                        </select>
                                                                        <button
                                                                            onClick={() => {
                                                                                const [breakTime, duration] = mealBreakValue.split('|')
                                                                                handleAction(request.id, 'update_meal_break', { meal_break_id: mb.id, break_time: breakTime, duration: parseInt(duration) })
                                                                                setEditingMealBreak(null)
                                                                            }}
                                                                            className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                                                                            disabled={actionMutation.isLoading}
                                                                        >
                                                                            Save
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                handleAction(request.id, 'delete_meal_break', { meal_break_id: mb.id })
                                                                                setEditingMealBreak(null)
                                                                            }}
                                                                            className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEditingMealBreak(null)}
                                                                            className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span
                                                                        className="cursor-pointer hover:underline"
                                                                        onClick={() => {
                                                                            setEditingMealBreak({ requestId: request.id, mealBreakId: mb.id })
                                                                            setMealBreakValue(`${mb.break_time.slice(0, 16)}|${mb.duration}`)
                                                                        }}
                                                                    >
                                                                        {formatTime(mb.break_time)} - {formatTime(endTime)} ({mb.break_type})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                    })
                                                ) : 'None'}
                                            </div>
                                            <div>
                                                {showingMealMenu === request.id ? (
                                                    <div className="flex flex-col space-y-1">
                                                        <button
                                                            onClick={() => {
                                                                handleAction(request.id, 'add_meal_break', { type: '30' })
                                                                setShowingMealMenu(null)
                                                            }}
                                                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                                                            disabled={actionMutation.isLoading}
                                                        >
                                                            30 min
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                handleAction(request.id, 'add_meal_break', { type: '60' })
                                                                setShowingMealMenu(null)
                                                            }}
                                                            className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                                                            disabled={actionMutation.isLoading}
                                                        >
                                                            1hr Walk Away
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowingMealMenu(request.id)}
                                                        className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                                                        disabled={actionMutation.isLoading}
                                                    >
                                                        Meal
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        {editingEndTime === request.id ? (
                                            <div className="flex space-x-2">
                                                <input
                                                    type="datetime-local"
                                                    value={endTimeValue}
                                                    onChange={(e) => setEndTimeValue(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { handleAction(request.id, 'update_end_time', { new_time: endTimeValue }); setEditingEndTime(null); } }}
                                                    className="p-1 border rounded text-sm"
                                                />
                                                <button
                                                    onClick={() => {
                                                        handleAction(request.id, 'update_end_time', { new_time: endTimeValue })
                                                        setEditingEndTime(null)
                                                    }}
                                                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                                                    disabled={actionMutation.isLoading}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingEndTime(null)}
                                                    className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : request.time_entry && !request.time_entry.end_time ? (
                                            <button
                                                onClick={() => handleAction(request.id, 'sign_out')}
                                                className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                                                disabled={actionMutation.isLoading}
                                            >
                                                Sign Out
                                            </button>
                                        ) : (
                                            request.time_entry ? (
                                                <span
                                                    className="cursor-pointer hover:underline"
                                                    onClick={() => {
                                                        setEditingEndTime(request.id)
                                                        setEndTimeValue(request.time_entry.end_time.slice(0, 16))
                                                    }}
                                                >
                                                    {formatTime(request.time_entry.end_time)}
                                                </span>
                                            ) : 'N/A'
                                        )}
                                    </td>
                                    <td className="p-3 text-sm font-medium text-text-primary dark:text-dark-text-primary">
                                        {request.time_entry ? `${request.time_entry.normal_hours?.toFixed(2).replace(/\.?0+$/, '') || '0'} | ${request.time_entry.meal_penalty_hours?.toFixed(2).replace(/\.?0+$/, '') || '0'} | ${request.time_entry.total_hours_worked?.toFixed(2).replace(/\.?0+$/, '') || '0'}` : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <p>No {title.toLowerCase()}.</p>
            )}
        </div>
    )

    return (
        <>
            <style>
                {`
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: table-cell !important; }
                    .hidden { display: none !important; }
                    body { font-size: 12px; }
                    table, th, td { border: 1px solid black; border-collapse: collapse; }
                    table { font-size: 10px; width: 100%; }
                    th, td { padding: 4px; }
                    .max-w-6xl { max-width: none; }
                    .p-6 { padding: 0; }
                    .mb-6 { margin-bottom: 1rem; }
                    .flex { display: block; }
                }
                `}
            </style>
            <div className="print-header hidden">
                <div className="flex justify-between mb-4">
                    <div className="font-bold text-lg">{company_name}</div>
                    <div className="font-bold text-lg">{call_time.name} at {formatTimeSimple(call_time.time)} on {new Date(call_time.date).toLocaleDateString()}</div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between mb-6 no-print">
                <h1 className="text-2xl font-bold">Time Sheet - {call_time.name} at {formatTimeSimple(call_time.time)} on {new Date(call_time.date).toLocaleDateString()}</h1>
                <a href="#" onClick={() => navigate(`/dash/event/${call_time.event_slug}`)} className="text-primary hover:underline">Back to Event</a>
            </div>
            <div className="mb-6 flex justify-between items-center no-print">
                <div>
                    <label className="mr-2">Filter by Labor Type:</label>
                <select
                    value={laborTypeFilter}
                    onChange={(e) => setLaborTypeFilter(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="All">All</option>
                    {labor_types.map(lt => (
                        <option key={lt.id} value={lt.id}>{lt.name}</option>
                    ))}
                </select>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 items-end no-print sticky top-0 bg-white dark:bg-dark-card-bg z-10 py-2 border-b border-gray-200 dark:border-dark-border">
                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Action</label>
                    <select value={massAction} onChange={(e) => setMassAction(e.target.value)} className="p-2 border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-card-bg text-text-primary dark:text-dark-text-primary">
                        <option value="">Select Action</option>
                        <option value="clock_in">Set Clock In Time</option>
                        <option value="clock_out">Set Clock Out Time</option>
                        <option value="add_meal_break">Add Meal Break</option>
                    </select>
                </div>
                {massAction === 'clock_in' && (
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Clock In Time</label>
                        <input type="datetime-local" value={massClockIn} onChange={(e) => setMassClockIn(e.target.value)} className="p-2 border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-card-bg text-text-primary dark:text-dark-text-primary" />
                    </div>
                )}
                {massAction === 'clock_out' && (
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Clock Out Time</label>
                        <input type="datetime-local" value={massClockOut} onChange={(e) => setMassClockOut(e.target.value)} className="p-2 border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-card-bg text-text-primary dark:text-dark-text-primary" />
                    </div>
                )}
                {massAction === 'add_meal_break' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Break Time</label>
                            <input type="datetime-local" value={massBreakTime} onChange={(e) => setMassBreakTime(e.target.value)} className="p-2 border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-card-bg text-text-primary dark:text-dark-text-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Duration</label>
                            <select value={massBreakDuration} onChange={(e) => setMassBreakDuration(e.target.value)} className="p-2 border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-card-bg text-text-primary dark:text-dark-text-primary">
                                <option value="30">30 min</option>
                                <option value="60">1 hour</option>
                            </select>
                        </div>
                    </>
                )}
                <button onClick={applyMassAction} disabled={selected.length === 0 || !massAction} className="bg-primary text-dark-text-primary px-4 py-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50 disabled:cursor-not-allowed">
                    Apply to Selected ({selected.length})
                </button>
                <div className="ml-auto">
                    <button onClick={() => generatePDF()} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Print PDF
                    </button>
                </div>
            </div>
            {renderTable(filteredConfirmedRequests, 'Confirmed Workers')}
            {renderTable(filteredNcnsRequests, 'No Call No Show', true)}
        </div>
        </>
    )
}
