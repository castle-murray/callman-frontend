import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import api from '../api'

function useChartColors() {
    const style = getComputedStyle(document.documentElement)
    return {
        primary: style.getPropertyValue('--color-primary').trim() || '#3b82f6',
        text: style.getPropertyValue('--color-text-heading').trim() || '#111827',
        grid: style.getPropertyValue('--color-border-light').trim() || '#d1d5db',
    }
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
    const [selectedMonth, setSelectedMonth] = useState(null)
    const colors = useChartColors()

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
        if (!selectedMonth || !data?.daily?.[selectedMonth]) return []
        return data.daily[selectedMonth]
    }, [data, selectedMonth])

    if (isLoading) return <div className="p-6">Loading...</div>
    if (error) return <div className="p-6 text-red-500">Error: {error.message}</div>

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/dash')}
                    className="text-primary hover:text-primary-hover text-sm"
                >
                    &larr; Dashboard
                </button>
                <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-heading">
                    SMS Usage Report
                </h1>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow dark:shadow-dark-shadow">
                    <p className="text-sm text-text-body dark:text-dark-text-body">This Month</p>
                    <p className="text-3xl font-bold text-text-heading dark:text-dark-text-heading">
                        {currentMonth}
                    </p>
                </div>
                <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow dark:shadow-dark-shadow">
                    <p className="text-sm text-text-body dark:text-dark-text-body">Last Month</p>
                    <p className="text-3xl font-bold text-text-heading dark:text-dark-text-heading">
                        {previousMonth}
                    </p>
                </div>
                <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow dark:shadow-dark-shadow">
                    <p className="text-sm text-text-body dark:text-dark-text-body">All Time</p>
                    <p className="text-3xl font-bold text-text-heading dark:text-dark-text-heading">
                        {data.total}
                    </p>
                </div>
            </div>

            {/* Monthly bar chart */}
            <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow dark:shadow-dark-shadow mb-8">
                <h2 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading mb-4">
                    Monthly SMS Volume
                </h2>
                {data.monthly.length === 0 ? (
                    <p className="text-text-body dark:text-dark-text-body text-sm">No data available.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.monthly}>
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
                                    backgroundColor: 'var(--color-card-bg)',
                                    border: '1px solid var(--color-border-light)',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill={colors.primary}
                                radius={[4, 4, 0, 0]}
                                cursor="pointer"
                                onClick={(entry) => setSelectedMonth(entry.month)}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
                <p className="text-xs text-text-body dark:text-dark-text-body mt-2">
                    Click a bar to see daily breakdown
                </p>
            </div>

            {/* Month selector dropdown */}
            <div className="mb-4">
                <label className="text-sm text-text-body dark:text-dark-text-body mr-2">
                    Select month:
                </label>
                <select
                    value={selectedMonth || ''}
                    onChange={(e) => setSelectedMonth(e.target.value || null)}
                    className="rounded border border-border-light dark:border-dark-border bg-card-bg dark:bg-dark-card-bg text-text-heading dark:text-dark-text-heading px-3 py-1.5 text-sm"
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
                    <h2 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading mb-4">
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
                                            backgroundColor: 'var(--color-card-bg)',
                                            border: '1px solid var(--color-border-light)',
                                            borderRadius: '0.5rem',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke={colors.primary}
                                        strokeWidth={2}
                                        dot={{ fill: colors.primary, r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>

                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border-light dark:border-dark-border">
                                            <th className="text-left py-2 px-3 text-text-heading dark:text-dark-text-heading">Date</th>
                                            <th className="text-right py-2 px-3 text-text-heading dark:text-dark-text-heading">Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyData.map(d => (
                                            <tr key={d.date} className="border-b border-border-light/50 dark:border-dark-border/50">
                                                <td className="py-2 px-3 text-text-body dark:text-dark-text-body">{d.date}</td>
                                                <td className="py-2 px-3 text-right text-text-heading dark:text-dark-text-heading font-medium">{d.count}</td>
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
