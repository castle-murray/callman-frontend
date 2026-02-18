import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from '../contexts/UserContext'
import { useMessages } from '../contexts/MessageContext'
import { OwnerDashboard } from './OwnerDashboard'
import api from '../api'

function InviteOwnerSection() {
    const { addMessage } = useMessages()
    const [phone, setPhone] = useState('')

    const inviteMutation = useMutation({
        mutationFn: async (phone) => {
            const response = await api.post('/admin/invite-owner/', { phone })
            return response.data
        },
        onSuccess: (data) => {
            addMessage(data.message || 'Invitation sent.', 'success')
            setPhone('')
        },
        onError: (error) => {
            addMessage(error.response?.data?.message || 'Failed to send invitation.', 'error')
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        inviteMutation.mutate(phone)
    }

    return (
        <div className="bg-card-bg rounded-lg shadow-md dark:bg-dark-card-bg dark:shadow-dark-shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-1 text-text-heading dark:text-dark-text-primary">Invite Owner</h2>
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm mb-4">
                Send an SMS invitation with a registration link to a new company owner.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    required
                    className="flex-1 p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                />
                <button
                    type="submit"
                    disabled={inviteMutation.isPending}
                    className="bg-primary text-dark-text-primary px-4 py-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                </button>
            </form>
        </div>
    )
}

export function Settings() {
    const { user, isLoading } = useUser()
    const { addMessage } = useMessages()
    const queryClient = useQueryClient()
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: ''
    })

    // Fetch user profile data
    const { data: userSettings } = useQuery({
        queryKey: ['userSettings'],
        queryFn: async () => {
            const response = await api.get('/user/settings/')
            return response.data
        }
    })

    useEffect(() => {
        if (userSettings) {
            setProfileData({
                first_name: userSettings.first_name || '',
                last_name: userSettings.last_name || '',
                email: userSettings.email || '',
                phone_number: userSettings.phone_number || ''
            })
        }
    }, [userSettings])

    const changePasswordMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/user/change-password/', data)
            return response.data
        },
        onSuccess: (data) => {
            addMessage(data.message || 'Password changed successfully', 'success')
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            })
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to change password'
            addMessage(message, 'error')
        }
    })

    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.patch('/user/settings/', data)
            return response.data
        },
        onSuccess: (data) => {
            addMessage(data.message || 'Profile updated successfully', 'success')
            queryClient.invalidateQueries(['userSettings'])
            queryClient.invalidateQueries(['user'])
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to update profile'
            addMessage(message, 'error')
        }
    })

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handlePasswordSubmit = (e) => {
        e.preventDefault()
        changePasswordMutation.mutate(passwordData)
    }

    const handleProfileChange = (e) => {
        const { name, value } = e.target
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleProfileSubmit = (e) => {
        e.preventDefault()
        updateProfileMutation.mutate(profileData)
    }

    if (isLoading) {
        return <div className="max-w-4xl mx-auto p-6">Loading...</div>
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">Settings</h1>

            {/* Profile Information Section */}
            <div className="bg-card-bg rounded-lg shadow-md dark:bg-dark-card-bg dark:shadow-dark-shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-text-heading dark:text-dark-text-primary">Profile Information</h2>
                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="username" className="text-text-tertiary dark:text-dark-text-tertiary mb-1">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={userSettings?.username || ''}
                            disabled
                            className="w-full p-2 border rounded bg-gray-100 text-text-tertiary dark:bg-gray-700 dark:text-dark-text-tertiary dark:border-dark-border opacity-60 cursor-not-allowed"
                        />
                        <span className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-1">Username cannot be changed</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="first_name" className="text-text-tertiary dark:text-dark-text-tertiary mb-1">First Name</label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={profileData.first_name}
                                onChange={handleProfileChange}
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="last_name" className="text-text-tertiary dark:text-dark-text-tertiary mb-1">Last Name</label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={profileData.last_name}
                                onChange={handleProfileChange}
                                className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="email" className="text-text-tertiary dark:text-dark-text-tertiary mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            required
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="phone_number" className="text-text-tertiary dark:text-dark-text-tertiary mb-1">Phone Number</label>
                        <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            value={profileData.phone_number}
                            onChange={handleProfileChange}
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>

            {/* Change Password Section */}
            <div className="bg-card-bg rounded-lg shadow-md dark:bg-dark-card-bg dark:shadow-dark-shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-text-heading dark:text-dark-text-primary">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="current_password" className="text-text-tertiary dark:text-dark-text-tertiary mb-1">Current Password</label>
                        <input
                            type="password"
                            id="current_password"
                            name="current_password"
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
                            required
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="new_password" className="text-text-tertiary dark:text-dark-text-tertiary mb-1">New Password</label>
                        <input
                            type="password"
                            id="new_password"
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            required
                            minLength={8}
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                        <span className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-1">Minimum 8 characters</span>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="confirm_password" className="text-text-tertiary dark:text-dark-text-tertiary mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChange}
                            required
                            minLength={8}
                            className="w-full p-2 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="bg-primary text-dark-text-primary p-2 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {changePasswordMutation.isPending ? 'Changing Password...' : 'Change Password'}
                    </button>
                </form>
            </div>

            {/* Invite Owner - only show if user is administrator */}
            {user?.user?.isAdministrator && (
                <InviteOwnerSection />
            )}

            {/* Owner Dashboard Section - only show if user is owner */}
            {user?.user?.isOwner && (
                <div>
                    <OwnerDashboard />
                </div>
            )}
        </div>
    )
}
