import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TooltipSpan } from '../components/TooltipSpan'
import { ConfirmDialog } from '../components/ConfirmDialog'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export function LaborRequirementStatus({
    laborSlug,
    eventSlug
    }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await api.delete(`/labor/${laborSlug}/delete/`)
            return response.data
        },
        onSuccess: () => {
            setDeleteDialogOpen(false)
            queryClient.invalidateQueries(['eventDetails', eventSlug])
            navigate(`/dash/event/${eventSlug}`)
        }
    })

    const { data: labor, isLoading, error } = useQuery({
        queryKey: ['laborRequirement', laborSlug],
        queryFn: async () => {
            const response = await api.get(`/labor/${laborSlug}/status/`)
            return response.data
        }
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error loading labor requirement</div>

    return (
        <>
            <div className="flex items-center">
                <span className="ml-2">
                    <a href={`/dash/request/${laborSlug}/fill-list`} className="text-text-primary hover:underline dark:text-dark-text-primary dark:hover:text-dark-primary-hover">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                            <div className="mr-2">
                                {labor.job} - {labor.labor_requirement.needed_labor}
                            </div>
                    <div className="flex items-center space-x-1">
                        <div className="flex items-center space-x-1">
                                <TooltipSpan
                                    tooltip={`Confirmed: ${labor.confirmed}`}
                                    className="w-6 h-6 bg-success dark:bg-dark-success rounded-full flex items-center justify-center text-xs text-white font-bold">
                                        {labor.confirmed}
                                </TooltipSpan>
                                <TooltipSpan
                                    tooltip={`Available: ${labor.available}`}
                                     className="w-6 h-6 bg-bg-available dark:bg-dark-bg-available rounded-full flex items-center justify-center text-xs text-white font-bold">
                                        {labor.available}
                                </TooltipSpan>
                                <TooltipSpan
                                    tooltip={`Pending: ${labor.pending}`}
                                    className="w-6 h-6 bg-yellow dark:bg-dark-yellow rounded-full flex items-center justify-center text-xs text-white font-bold">
                                        {labor.pending}
                                </TooltipSpan>
                                <TooltipSpan
                                    tooltip={`Declined: ${labor.declined}`}
                                    className="w-6 h-6 bg-danger dark:bg-dark-danger rounded-full flex items-center justify-center text-xs text-white font-bold">
                                        {labor.declined}
                                </TooltipSpan>
                        </div>
                        {labor.confirmed === labor.labor_requirement.needed_labor && (
                            <div className="text-success dark:text-dark-success ml-2">Filled</div>
                        )}
                        {labor.confirmed > labor.labor_requirement.needed_labor && (
                            <div className="text-danger ml-2">Overbooked by {labor.confirmed - labor.labor_requirement.needed_labor}</div>
                        )}
                    </div>
                        </div>
                    </a>
                </span>
            </div>
            
            <div className="space-x-2">
                <button 
                    onClick={() => navigate(`/dash/labor/${laborSlug}/edit`, { 
                        state: { eventSlug: eventSlug } 
                    })}
                    className="inline-block bg-primary text-dark-text-primary px-2 shadow-sm shadow-secondary rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                >
                    Edit
                </button>
                <button
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={deleteMutation.isPending}
                    className="bg-danger text-dark-text-primary px-2 shadow-sm shadow-secondary rounded hover:bg-danger-hover dark:bg-dark-danger dark:hover:bg-dark-danger-hover">
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
            </div>
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={() => deleteMutation.mutate()}
                title="Delete Labor Requirement"
                message="Are you sure you want to delete this labor requirement?"
                isPending={deleteMutation.isPending}
            />
        </>
    )
}
