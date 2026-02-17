import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import api from '../api'

function useChartColors() {
    const isDark = document.documentElement.classList.contains('dark')
    return {
        primary: isDark ? '#60a5fa' : '#3b82f6',
        text: isDark ? '#e5e7eb' : '#111827',
        grid: isDark ? '#374151' : '#d1d5db',
        cardBg: isDark ? '#1f2937' : '#ffffff',
        border: isDark ? '#4b5563' : '#e5e7eb',
    }
}

// Generate a consistent color from a string using a simple hash
function stringToColor(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Generate HSL color with good saturation and lightness for visibility
    const hue = Math.abs(hash % 360)
    const saturation = 65 + (Math.abs(hash) % 20) // 65-85%
    const lightness = 50 + (Math.abs(hash >> 8) % 15) // 50-65%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// Generate colors for all companies
function getCompanyColors(companyNames) {
    const colorMap = {}
    companyNames.forEach(name => {
        colorMap[name] = stringToColor(name)
    })
    return colorMap
}

function formatMonth(monthStr) {
    const [year, month] = monthStr.split('-')
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatDay(dateStr) {
    const [, , day] = dateStr.split('-')
    return parseInt(day, 10)
}

export function SmsUsageReport() {
    const navigate = useNavigate()
    const { user } = useUser()
    const [selectedMonth, setSelectedMonth] = useState(null)
    const [selectedCompanies, setSelectedCompanies] = useState(new Set())
    const colors = useChartColors()
    const isAdministrator = user?.user?.isAdministrator

    const { data, isLoading, error } = useQuery({
        queryKey: ['smsUsage'],
        queryFn: async () => {
            const res = await api.get('/sms-usage/')
            return res.data
        }
    })

    const { currentMonth, previousMonth } = useMemo(() => {
        if (!data?.monthly?.length) return { currentMonth: 0, previousMonth: 0 }
        const len = data.monthly.length
        return {
            currentMonth: data.monthly[len - 1]?.count || 0,
            previousMonth: len >= 2 ? data.monthly[len - 2]?.count || 0 : 0,
        }
    }, [data])

    const dailyData = useMemo(() => {
        if (!selectedMonth) return []
        if (isAdministrator && data?.daily_by_company?.[selectedMonth]) {
            return data.daily_by_company[selectedMonth]
        }
        if (data?.daily?.[selectedMonth]) {
            return data.daily[selectedMonth]
        }
        return []
    }, [data, selectedMonth, isAdministrator])

    const companyNames = useMemo(() => {
        if (!isAdministrator || !data?.monthly_by_company?.length) return []
        const names = new Set()
        data.monthly_by_company.forEach(entry => {
            Object.keys(entry).forEach(key => {
                if (key !== 'month') names.add(key)
            })
        })
        return Array.from(names)
    }, [data, isAdministrator])

    const companyColors = useMemo(() => {
        return getCompanyColors(companyNames)
    }, [companyNames])

    // Initialize selected companies when company names change
    useMemo(() => {
        if (companyNames.length > 0 && selectedCompanies.size === 0) {
            setSelectedCompanies(new Set(companyNames))
        }
    }, [companyNames])

    const toggleCompany = (companyName) => {
        setSelectedCompanies(prev => {
            const newSet = new Set(prev)
            if (newSet.has(companyName)) {
                newSet.delete(companyName)
            } else {
                newSet.add(companyName)
            }
            return newSet
        })
    }

    const toggleAllCompanies = () => {
        if (selectedCompanies.size === companyNames.length) {
            setSelectedCompanies(new Set())
        } else {
            setSelectedCompanies(new Set(companyNames))
        }
    }

    if (isLoading) return <div className="p-6 text-text-body dark:text-dark-text-body">Loading...</div>
    if (error) return <div className="p-6 text-red-500 dark:text-red-400">Error: {error.message}</div>

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-primary">
                    SMS Usage Report
                </h1>
                {isAdministrator && (
                    <p className="text-sm text-text-body dark:text-dark-text-body mt-2">
                        Viewing system-wide SMS usage across all companies
                    </p>
                )}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow dark:shadow-dark-shadow">
                    <p className="text-sm text-text-body dark:text-dark-text-tertiary">This Month</p>
                    <p className="text-3xl font-bold text-text-heading dark:text-dark-text-primary">
                        {currentMonth}
                    </p>
                </div>
                <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow dark:shadow-dark-shadow">
                    <p className="text-sm text-text-body dark:text-dark-text-tertiary">Last Month</p>
                    <p className="text-3xl font-bold text-text-heading dark:text-dark-text-primary">
                        {previousMonth}
                    </p>
                </div>
                <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow dark:shadow-dark-shadow">
                    <p className="text-sm text-text-body dark:text-dark-text-tertiary">All Time</p>
                    <p className="text-3xl font-bold text-text-heading dark:text-dark-text-primary">
                        {data.total}
                    </p>
                </div>
            </div>

            {/* Monthly trend chart */}
            <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow dark:shadow-dark-shadow mb-8">
                <h2 className="text-lg font-semibold text-text-heading dark:text-dark-text-primary mb-4">
                    Monthly SMS Volume {isAdministrator && '(By Company)'}
                </h2>
                {data.monthly.length === 0 ? (
                    <p className="text-text-body dark:text-dark-text-body text-sm">No data available.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={isAdministrator && data.monthly_by_company?.length ? data.monthly_by_company : data.monthly}>
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                            <XAxis
                                dataKey="month"
                                tickFormatter={formatMonth}
                                tick={{ fill: colors.text, fontSize: 12 }}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fill: colors.text, fontSize: 12 }}
                            />
                            <Tooltip
                                labelFormatter={formatMonth}
                                contentStyle={{
                                    backgroundColor: colors.cardBg,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '0.5rem',
                                    color: colors.text,
                                }}
                            />
                            {isAdministrator && companyNames.length > 0 ? (
                                <>
                                    {companyNames.filter(name => selectedCompanies.has(name)).map((companyName) => (
                                        <Line
                                            key={companyName}
                                            type="monotone"
                                            dataKey={companyName}
                                            name={companyName}
                                            stroke={companyColors[companyName]}
                                            strokeWidth={2}
                                            dot={{ fill: companyColors[companyName], r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    ))}
                                </>
                            ) : (
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke={colors.primary}
                                    strokeWidth={3}
                                    dot={{ fill: colors.primary, r: 4, cursor: 'pointer' }}
                                    activeDot={{ r: 6, onClick: (e, payload) => setSelectedMonth(payload.payload.month) }}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                )}
                {!isAdministrator && (
                    <p className="text-xs text-text-body dark:text-dark-text-tertiary mt-2">
                        Click a point to see daily breakdown
                    </p>
                )}
            </div>

            {/* Company selector for administrators */}
            {isAdministrator && companyNames.length > 0 && (
                <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow dark:shadow-dark-shadow mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-text-heading dark:text-dark-text-primary">
                            Select Companies to Display
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedCompanies(new Set(companyNames))}
                                className="text-sm text-primary hover:text-primary-hover dark:text-dark-text-blue dark:hover:text-dark-primary-hover"
                            >
                                Select All
                            </button>
                            <span className="text-text-body dark:text-dark-text-tertiary">|</span>
                            <button
                                onClick={() => setSelectedCompanies(new Set())}
                                className="text-sm text-primary hover:text-primary-hover dark:text-dark-text-blue dark:hover:text-dark-primary-hover"
                            >
                                Deselect All
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {companyNames.map((companyName) => (
                            <button
                                key={companyName}
                                onClick={() => toggleCompany(companyName)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                                    selectedCompanies.has(companyName)
                                        ? 'bg-primary/10 border-primary dark:bg-dark-primary/10 dark:border-dark-primary'
                                        : 'bg-card-bg border-border-light dark:bg-dark-card-bg dark:border-dark-border opacity-50'
                                }`}
                            >
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: companyColors[companyName] }}
                                />
                                <span className="text-sm text-text-heading dark:text-dark-text-primary">
                                    {companyName}
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-text-body dark:text-dark-text-tertiary mt-3">
                        {selectedCompanies.size} of {companyNames.length} companies selected
                    </p>
                </div>
            )}

            {/* Company breakdown for administrators */}
            {isAdministrator && data?.companies?.length > 0 && (
                <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow dark:shadow-dark-shadow mb-8">
                    <h2 className="text-lg font-semibold text-text-heading dark:text-dark-text-primary mb-4">
                        Company Breakdown (Last 12 Months)
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-light dark:border-dark-border">
                                    <th className="text-left py-2 px-3 text-text-heading dark:text-dark-text-primary">Company</th>
                                    <th className="text-right py-2 px-3 text-text-heading dark:text-dark-text-primary">SMS Sent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.companies.map((company, idx) => (
                                    <tr key={idx} className="border-b border-border-light/50 dark:border-dark-border/50">
                                        <td className="py-2 px-3 text-text-body dark:text-dark-text-tertiary">{company.name}</td>
                                        <td className="py-2 px-3 text-right text-text-heading dark:text-dark-text-primary font-medium">{company.count.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Month selector dropdown */}
            <div className="mb-4">
                <label className="text-sm text-text-body dark:text-dark-text-tertiary mr-2">
                    Select month:
                </label>
                <select
                    value={selectedMonth || ''}
                    onChange={(e) => setSelectedMonth(e.target.value || null)}
                    className="rounded border border-border-light dark:border-dark-border bg-card-bg dark:bg-dark-card-bg text-text-heading dark:text-dark-text-primary px-3 py-1.5 text-sm"
                >
                    <option value="">Choose a month...</option>
                    {[...data.monthly].reverse().map(m => (
                        <option key={m.month} value={m.month}>
                            {formatMonth(m.month)} ({m.count})
                        </option>
                    ))}
                </select>
            </div>

            {/* Daily detail section */}
            {selectedMonth && (
                <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow dark:shadow-dark-shadow">
                    <h2 className="text-lg font-semibold text-text-heading dark:text-dark-text-primary mb-4">
                        Daily Breakdown — {formatMonth(selectedMonth)}
                    </h2>

                    {dailyData.length === 0 ? (
                        <p className="text-text-body dark:text-dark-text-body text-sm">No data for this month.</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDay}
                                        tick={{ fill: colors.text, fontSize: 12 }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fill: colors.text, fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: colors.cardBg,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '0.5rem',
                                            color: colors.text,
                                        }}
                                    />
                                    {isAdministrator && companyNames.length > 0 ? (
                                        <>
                                            {companyNames.filter(name => selectedCompanies.has(name)).map((companyName) => (
                                                <Line
                                                    key={companyName}
                                                    type="monotone"
                                                    dataKey={companyName}
                                                    name={companyName}
                                                    stroke={companyColors[companyName]}
                                                    strokeWidth={2}
                                                    dot={{ fill: companyColors[companyName], r: 3 }}
                                                    activeDot={{ r: 5 }}
                                                />
                                            ))}
                                        </>
                                    ) : (
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke={colors.primary}
                                            strokeWidth={2}
                                            dot={{ fill: colors.primary, r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>

                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border-light dark:border-dark-border">
                                            <th className="text-left py-2 px-3 text-text-heading dark:text-dark-text-primary">Date</th>
                                            <th className="text-right py-2 px-3 text-text-heading dark:text-dark-text-primary">Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyData.map(d => (
                                            <tr key={d.date} className="border-b border-border-light/50 dark:border-dark-border/50">
                                                <td className="py-2 px-3 text-text-body dark:text-dark-text-tertiary">{d.date}</td>
                                                <td className="py-2 px-3 text-right text-text-heading dark:text-dark-text-primary font-medium">{d.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
