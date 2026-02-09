import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export function Skills() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        name: '',
        action: 'add'
    })
    const [editingSkill, setEditingSkill] = useState(null)
    const [editFormData, setEditFormData] = useState({ name: '' })

    const { data: skills, error, isLoading } = useQuery({
        queryKey: ['skills'],
        queryFn: async () => {
            const response = await api.get('/skills/')
            return response.data
        }
    })

    const skillMutation = useMutation({
        mutationFn: async (skillData) => {
            const response = await api.post('/skills/', skillData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['skills'])
            setFormData({ name: '', action: 'add' })
            setEditingSkill(null)
            setEditFormData({ name: '' })
        }
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleEditInputChange = (e) => {
        const { name, value } = e.target
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        skillMutation.mutate(formData)
    }

    const handleEditSubmit = (e, skillId) => {
        e.preventDefault()
        skillMutation.mutate({
            ...editFormData,
            action: 'edit',
            skill_id: skillId
        })
    }

    const handleDelete = (skillId) => {
        if (confirm('Are you sure you want to delete this skill?')) {
            skillMutation.mutate({
                action: 'delete',
                skill_id: skillId
            })
        }
    }

    const startEdit = (skill) => {
        setEditingSkill(skill.id)
        setEditFormData({ name: skill.name })
    }

    const cancelEdit = () => {
        setEditingSkill(null)
        setEditFormData({ name: '' })
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error loading skills</div>

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">Skill List</h1>
            <div className="bg-card-bg p-6 rounded-lg shadow-md max-w-4xl mx-auto dark:bg-dark-card-bg dark:shadow-dark-shadow">
                
                {/* Add New Skill Form */}
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-card-bg dark:bg-dark-card-bg border border-border-light dark:border-dark-border rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-text-heading dark:text-dark-text-primary">Add New Skill</h3>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label htmlFor="name" className="block text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary mb-1">
                                Skill Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border dark:focus:ring-dark-primary"
                                placeholder="Enter skill name"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={skillMutation.isPending}
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover disabled:opacity-50 dark:bg-dark-primary dark:hover:bg-dark-primary-hover"
                        >
                            {skillMutation.isPending ? 'Adding...' : 'Add Skill'}
                        </button>
                    </div>
                </form>

                {/* Skills List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-heading dark:text-dark-text-primary">Existing Skills</h3>
                    {skills && skills.length > 0 ? (
                        <div className="space-y-2">
                            {skills.map((skill) => (
                                <div key={skill.id} className="flex items-center justify-between p-3 bg-card-bg dark:bg-dark-card-bg border border-border-light dark:border-dark-border rounded-lg">
                                    {editingSkill === skill.id ? (
                                        <form onSubmit={(e) => handleEditSubmit(e, skill.id)} className="flex items-center gap-2 flex-1">
                                            <input
                                                type="text"
                                                name="name"
                                                value={editFormData.name}
                                                onChange={handleEditInputChange}
                                                required
                                                className="flex-1 p-2 border rounded bg-card-bg text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border dark:focus:ring-dark-primary"
                                            />
                                            <button
                                                type="submit"
                                                disabled={skillMutation.isPending}
                                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </form>
                                    ) : (
                                        <>
                                            <span className="text-text-tertiary dark:text-dark-text-tertiary font-medium">
                                                {skill.name}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEdit(skill)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(skill.id)}
                                                    disabled={skillMutation.isPending}
                                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-tertiary dark:text-dark-text-tertiary">No skills found. Add your first skill above.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
