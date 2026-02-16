import { useState, useEffect, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'
import { useMessages } from '../contexts/MessageContext'
import { Dropdown } from '../components/Dropdown'
import { ConfirmDialog } from '../components/ConfirmDialog'

function filterContacts(contacts, searchQuery) {
    if (!searchQuery.trim()) return contacts
    
    const query = searchQuery.toLowerCase()
    return contacts.filter(contact => 
        contact.name.toLowerCase().includes(query) ||
        contact.phone_number.toLowerCase().includes(query)
    )
}

function sortContacts(contacts) {
    return contacts.sort((a, b) => a.name.localeCompare(b.name))
}

function formatPhone(phone) {
    if (!phone) return '';
    let num = phone.replace(/^\+1/, '');
    if (num.length === 10) {
        return `(${num.slice(0,3)})${num.slice(3,6)}-${num.slice(6)}`;
    }
    return phone;
}

export function Contacts() {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [contactsPerPage, setContactsPerPage] = useState(10)
    const navigate = useNavigate()

    const queryClient = useQueryClient()
    const [formState, setFormState] = useState('hidden') // 'hidden', 'entering', 'shown', 'exiting'
    const [newWorker, setNewWorker] = useState({name: '', phone_number: ''})
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({name: '', phone_number: ''})
    const [addingAlt, setAddingAlt] = useState(null)
    const [editingAlt, setEditingAlt] = useState(null)
    const [altForm, setAltForm] = useState({label: '', phone_number: ''})
    const [editingLaborTypes, setEditingLaborTypes] = useState(null)
    const [laborForm, setLaborForm] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const [tooltip, setTooltip] = useState({show: false, x: 0, y: 0, text: ''})
    const [altMenu, setAltMenu] = useState(null) // id of alt phone with menu open
    const [selectedAltIndex, setSelectedAltIndex] = useState(0)
    const [laborMenu, setLaborMenu] = useState(null) // id of worker with menu open
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [showImportModal, setShowImportModal] = useState(false)
    const [importFile, setImportFile] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null) // { type: 'worker'|'alt'|'primary', ...params }
    const { addMessage } = useMessages()

    useEffect(() => {
        if (formState === 'exiting') {
            const timer = setTimeout(() => setFormState('hidden'), 300)
            return () => clearTimeout(timer)
        }
    }, [formState])

    useLayoutEffect(() => {
        if (formState === 'entering') {
            setFormState('shown')
        }
    }, [formState])

    // Debounce search with 300ms delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            setCurrentPage(1) // Reset to first page when search changes
        }, 150)
        
        return () => clearTimeout(timer)
    }, [searchQuery])

    const { data, error, isLoading } = useQuery({
        queryKey: ['contacts'],
        queryFn: async () => {
            const response = await api.get('/workers/')
            return response.data
        }
    })

    const contacts = data?.workers || []
    const laborTypesData = data?.labor_types || []

    const addMutation = useMutation({
        mutationFn: (worker) => api.post('/workers/', worker),
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts'])
            setShowAddForm(false)
            setNewWorker({name: '', phone_number: ''})
        }
    })

    const editMutation = useMutation({
        mutationFn: ({id, worker}) => api.patch('/workers/', { ...worker, id }),
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts'])
            setEditingId(null)
            setEditForm({name: '', phone_number: ''})
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete('/workers/', { data: { id } }),
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts'])
        },
        onError: (error) => {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message)
                setTimeout(() => setErrorMessage(''), 3000)
            }
        }
    })

    const putMutation = useMutation({
        mutationFn: (data) => api.put('/workers/', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts'])
            setAddingAlt(null)
            setAltForm({label: '', phone_number: ''})
        }
    })

    const editAltMutation = useMutation({
        mutationFn: (data) => api.patch('/workers/', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts'])
            setEditingAlt(null)
            setAddingAlt(null)
            setAltForm({label: '', phone_number: ''})
        }
    })

    const deleteAltMutation = useMutation({
        mutationFn: (data) => api.delete('/workers/', { data: data }),
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts'])
        },
        onError: (error) => {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message)
                setTimeout(() => setErrorMessage(''), 3000)
            }
        }
    })

    const updateLaborMutation = useMutation({
        mutationFn: (data) => api.patch('/workers/', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts'])
            setEditingLaborTypes(null)
            setLaborForm([])
            addMessage('Labor types updated successfully', 'success')
        },
        onError: (error) => {
            addMessage('Error updating labor types: ' + error.message, 'error')
        }
    })

    const makePrimaryMutation = useMutation({
        mutationFn: (data) => api.put('/workers/', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts'])
        }
    })

    const importMutation = useMutation({
        mutationFn: (file) => {
            const formData = new FormData()
            formData.append('file', file)
            return api.post('/workers/import/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        },
        onSuccess: (response) => {
            const { imported, skipped, errors } = response.data
            addMessage(`Imported ${imported} contact${imported !== 1 ? 's' : ''}${skipped ? `, ${skipped} already existed` : ''}`, 'success')
            if (errors?.length) {
                addMessage(`${errors.length} error${errors.length !== 1 ? 's' : ''}: ${errors.join(', ')}`, 'warning')
            }
            queryClient.invalidateQueries(['contacts'])
            setShowImportModal(false)
            setImportFile(null)
        },
        onError: (error) => {
            addMessage(error.response?.data?.message || 'Failed to import contacts', 'error')
        }
    })

    const pickerMutation = useMutation({
        mutationFn: (contacts) => api.post('/workers/import-contacts/', { contacts }),
        onSuccess: (response) => {
            const { imported, skipped, errors } = response.data
            addMessage(`Imported ${imported} contact${imported !== 1 ? 's' : ''}${skipped ? `, ${skipped} already existed` : ''}`, 'success')
            if (errors?.length) {
                addMessage(`${errors.length} error${errors.length !== 1 ? 's' : ''}: ${errors.join(', ')}`, 'warning')
            }
            queryClient.invalidateQueries(['contacts'])
        },
        onError: (error) => {
            addMessage(error.response?.data?.message || 'Failed to import contacts', 'error')
        }
    })

    const handlePickContacts = async () => {
        try {
            const selected = await navigator.contacts.select(['name', 'tel'], { multiple: true })
            const mapped = selected
                .filter(c => c.tel?.length)
                .map(c => ({
                    name: c.name?.[0] || 'Unnamed',
                    phone_numbers: c.tel.map(t => ({ phone_number: t }))
                }))
            if (mapped.length) {
                pickerMutation.mutate(mapped)
            }
        } catch (err) {
            if (err.name !== 'TypeError') {
                addMessage('Contact selection cancelled', 'info')
            }
        }
    }

    const handleAddSubmit = (e) => {
        e.preventDefault()
        addMutation.mutate(newWorker)
    }

    const handleEditSubmit = (e) => {
        e.preventDefault()
        editMutation.mutate({id: editingId, worker: editForm})
    }

    const handleAltSubmit = (e, workerId) => {
        e.preventDefault()
        if (editingAlt) {
            editAltMutation.mutate({id: workerId, alt_id: editingAlt, phone_number: altForm.phone_number, label: altForm.label})
        } else {
            putMutation.mutate({id: workerId, phone_number: altForm.phone_number, label: altForm.label})
        }
    }

    const handleLaborSubmit = (e, contactId) => {
        e.preventDefault()
        updateLaborMutation.mutate({id: contactId, labor_types: laborForm})
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>
    if (!data) return <div>No contacts</div>
    
    const filteredContacts = filterContacts(contacts, debouncedSearch)
    const sortedContacts = sortContacts(filteredContacts)
    
    // Pagination logic
    const totalPages = Math.ceil(sortedContacts?.length / contactsPerPage)
    const startIndex = (currentPage - 1) * contactsPerPage
    const paginatedContacts = sortedContacts?.slice(startIndex, startIndex + contactsPerPage)

    return(
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text-heading dark:text-dark-text-primary">Contacts</h1>

            {errorMessage && (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
                    {errorMessage}
                </div>
            )}

            <div className="bg-card-bg dark:bg-dark-card-bg p-4 rounded-lg shadow-md">
                <div className="mb-4 flex items-center justify-between">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or phone..."
                            className="w-full max-w-md p-2 pr-8 border rounded bg-card-bg text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border dark:focus:ring-dark-primary"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="per_page" className="mr-4 text-text-tertiary dark:text-dark-text-tertiary">Items per page:</label>
                        <select 
                            id="per_page"
                            value={contactsPerPage}
                            onChange={(e) => {
                                setContactsPerPage(Number(e.target.value))
                                setCurrentPage(1)
                            }}
                            className="p-2 pr-8 border rounded bg-card-bg text-text-tertiary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                <div className="relative mb-4 overflow-hidden">
                    <div className="flex justify-end gap-2">
                        {'contacts' in navigator && (
                            <button
                                onClick={handlePickContacts}
                                disabled={pickerMutation.isPending}
                                className={`px-4 py-2 bg-secondary dark:bg-dark-secondary text-white rounded transition-opacity duration-300 ${formState !== 'hidden' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                {pickerMutation.isPending ? 'Importing...' : 'Select from Phone'}
                            </button>
                        )}
                        <button onClick={() => setShowImportModal(true)} className={`px-4 py-2 bg-secondary dark:bg-dark-secondary text-white rounded transition-opacity duration-300 ${formState !== 'hidden' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            Import Contacts
                        </button>
                        <button onClick={() => setFormState('entering')} className={`px-4 py-2 bg-primary text-white rounded transition-opacity duration-300 ${formState !== 'hidden' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            Add Worker
                        </button>
                    </div>
                    {formState !== 'hidden' && (
                        <form onSubmit={handleAddSubmit} className={`absolute top-0 right-0 flex space-x-4 transition-all duration-300 ${formState === 'shown' ? 'translate-x-0' : 'translate-x-full'} ${formState === 'exiting' ? 'opacity-0' : ''}`}>
                        <input
                            type="text"
                            placeholder="Name"
                            value={newWorker.name}
                            onChange={(e) => setNewWorker({...newWorker, name: e.target.value})}
                            className="p-2 border rounded bg-card-bg text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border dark:focus:ring-dark-primary"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Phone Number"
                            value={newWorker.phone_number}
                            onChange={(e) => setNewWorker({...newWorker, phone_number: e.target.value})}
                            className="p-2 border rounded bg-card-bg text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border dark:focus:ring-dark-primary"
                            required
                        />
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded" disabled={addMutation.isLoading}>
                            {addMutation.isLoading ? 'Adding...' : 'Add Worker'}
                        </button>
                        <button onClick={() => setFormState('exiting')} className="px-4 py-2 bg-red-500 text-white rounded">Cancel</button>
                        </form>
                    )}
                </div>

                <p className="mb-4 text-text-secondary dark:text-dark-text-secondary">
                    {sortedContacts.length} Contacts
                </p>
                
                <ul className="space-y-2">
                    {paginatedContacts.map(contact => (
                        <li key={contact.id} className="border-b p-2 dark:border-dark-border-dark">
                            <div className="flex justify-between items-center">
                            {editingId === contact.id ? (
                                <form onSubmit={handleEditSubmit} className="flex space-x-2 flex-1">
                                    <input
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="p-1 border rounded bg-card-bg text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border dark:focus:ring-dark-primary"
                                        required
                                    />
                                    <input
                                        value={editForm.phone_number}
                                        onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                                        className="p-1 border rounded bg-card-bg text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border dark:focus:ring-dark-primary"
                                        required
                                    />
                                    <button type="submit" className="px-2 py-1 bg-green-500 text-white rounded text-sm" disabled={editMutation.isLoading}>
                                        {editMutation.isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Cancel</button>
                                </form>
                            ) : (
                                <div className="flex-1">
                                    {contact.name} - {formatPhone(contact.phone_number)}
                                    <button
                                        onClick={() => setAddingAlt(addingAlt === contact.id ? null : contact.id)}
                                        onMouseEnter={() => setTooltip({show: true, text: 'add an alternate phone number'})}
                                        onMouseLeave={() => setTooltip({show: false})}
                                        onMouseMove={(e) => setTooltip(prev => ({...prev, x: e.clientX, y: e.clientY}))}
                                        className="ml-2 px-2 py-0 bg-gray-500 text-white rounded-full text-base"
                                    >+</button>
                                    {contact.alt_phones && contact.alt_phones.length > 0 && (
                                        <div className="ml-4 mt-1">
                                            {contact.alt_phones.map(alt => (
                                                <div key={alt.id} className="relative">
                                                    <div className="flex items-center text-sm text-text-secondary dark:text-dark-text-secondary">
                                                        <span>{alt.label}: {formatPhone(alt.phone_number)}</span>
                                                        <div className="relative inline-block ml-2">
                                                            <button
                                                                onClick={() => { setAltMenu(altMenu === alt.id ? null : alt.id); if (altMenu !== alt.id) setSelectedAltIndex(0); }}
                                                                className="px-1 py-0 bg-gray-500 text-white rounded text-xs"
                                                            >
                                                                ☰
                                                            </button>
                                                            <Dropdown
                                                                items={[
                                                                    { text: 'Edit', onClick: () => { setEditingAlt(alt.id); setAltForm({label: alt.label, phone_number: alt.phone_number}); setAddingAlt(contact.id); setAltMenu(null) } },
                                                                    { text: 'Delete', onClick: () => { setDeleteConfirm({ type: 'alt', id: contact.id, alt_id: alt.id }); setAltMenu(null) }, disabled: deleteAltMutation.isLoading },
                                                                    { text: 'Make Primary', onClick: () => { setDeleteConfirm({ type: 'primary', id: contact.id, alt_id: alt.id }); setAltMenu(null) }, disabled: makePrimaryMutation.isLoading }
                                                                ]}
                                                                isOpen={altMenu === alt.id}
                                                                onClose={() => setAltMenu(null)}
                                                                selectedIndex={selectedAltIndex}
                                                                onSelect={setSelectedAltIndex}
                                                                size="min-w-32"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {editingId !== contact.id && (
                                <div className="relative inline-block ml-4">
                                    <button
                                        onClick={() => { setLaborMenu(laborMenu === contact.id ? null : contact.id); setSelectedIndex(0) }}
                                        className="px-3 py-2 bg-gray-500 text-white rounded text-sm"
                                    >
                                        Options
                                    </button>
                                    <Dropdown
                                        items={[
                                            { text: 'Edit', onClick: () => { setEditingId(contact.id); setEditForm({name: contact.name, phone_number: contact.phone_number}); setLaborMenu(null) } },
                                            { text: 'Skills', onClick: () => { setEditingLaborTypes(contact.id); setLaborForm(contact.labor_types?.map(lt => lt.id) || []); setLaborMenu(null) } },
                                            { text: 'History', onClick: () => { navigate(`/dash/workers/${contact.slug}/history`); setLaborMenu(null) } },
                                            { text: 'Delete', onClick: () => { setDeleteConfirm({ type: 'worker', id: contact.id }); setLaborMenu(null) }, className: 'text-danger dark:text-dark-danger', disabled: deleteMutation.isLoading }
                                        ]}
                                        isOpen={laborMenu === contact.id}
                                        onClose={() => setLaborMenu(null)}
                                        selectedIndex={selectedIndex}
                                        onSelect={setSelectedIndex}
                                        size="min-w-36"
                                    />
                                </div>
                            )}
                            </div>
                            {addingAlt === contact.id && (
                                <form onSubmit={(e) => handleAltSubmit(e, contact.id)} className="mt-2 flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Label"
                                        value={altForm.label}
                                        onChange={(e) => setAltForm({...altForm, label: e.target.value})}
                                        className="p-1 border rounded bg-card-bg text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border dark:focus:ring-dark-primary"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Phone Number"
                                        value={altForm.phone_number}
                                        onChange={(e) => setAltForm({...altForm, phone_number: e.target.value})}
                                        className="p-1 border rounded bg-card-bg text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-card-bg dark:text-dark-text-tertiary dark:border-dark-border dark:focus:ring-dark-primary"
                                        required
                                    />
                                    <button type="submit" className="px-2 py-1 bg-green-500 text-white rounded text-sm" disabled={putMutation.isLoading || editAltMutation.isLoading}>
                                        {(putMutation.isLoading || editAltMutation.isLoading) ? 'Saving...' : (editingAlt ? 'Update' : 'Add')}
                                    </button>
                                    <button onClick={() => { setAddingAlt(null); setEditingAlt(null); setAltForm({label: '', phone_number: ''}) }} className="px-2 py-1 bg-gray-500 text-white rounded text-sm">Cancel</button>
                                </form>
                            )}
                            {editingLaborTypes === contact.id && (
                                <form onSubmit={(e) => handleLaborSubmit(e, contact.id)} className="mt-2 p-2 border rounded bg-card-bg dark:bg-dark-card-bg">
                                    <h4 className="text-sm font-bold mb-2">Edit Labor Types</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {laborTypesData?.map(laborType => (
                                            <label key={laborType.id} className="flex items-center text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={laborForm.includes(laborType.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setLaborForm(prev => [...prev, laborType.id])
                                                        } else {
                                                            setLaborForm(prev => prev.filter(id => id !== laborType.id))
                                                        }
                                                    }}
                                                    className="mr-1"
                                                />
                                                {laborType.name}
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex space-x-2">
                                        <button type="submit" className="px-2 py-1 bg-green-500 text-white rounded text-sm" disabled={updateLaborMutation.isLoading}>
                                            {updateLaborMutation.isLoading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button onClick={() => { setEditingLaborTypes(null); setLaborForm([]) }} className="px-2 py-1 bg-gray-500 text-white rounded text-sm">Cancel</button>
                                    </div>
                                </form>
                            )}
                        </li>
                    ))}
                </ul>
                
                <div className="mt-6 flex justify-center items-center space-x-4">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-text-primary dark:text-dark-text-primary">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowImportModal(false); setImportFile(null) }}>
                    <div className="bg-card-bg dark:bg-dark-card-bg rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4 text-text-heading dark:text-dark-text-primary">Import Contacts</h2>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">
                            Export contacts from your phone as a .vcf file, then upload it here to bulk-import workers.
                        </p>
                        <input
                            type="file"
                            accept=".vcf"
                            onChange={(e) => setImportFile(e.target.files[0] || null)}
                            className="block w-full text-sm text-text-tertiary dark:text-dark-text-tertiary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80 mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowImportModal(false); setImportFile(null) }}
                                className="px-4 py-2 bg-gray-500 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => importMutation.mutate(importFile)}
                                disabled={!importFile || importMutation.isPending}
                                className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
                            >
                                {importMutation.isPending ? 'Importing...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {tooltip.show && (
                <div
                    style={{
                        position: 'fixed',
                        left: tooltip.x + 10,
                        top: tooltip.y + 10,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                        zIndex: 1000,
                        fontSize: '12px'
                    }}
                >
                    {tooltip.text}
                </div>
            )}
        <ConfirmDialog
            isOpen={deleteConfirm?.type === 'worker'}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={() => { deleteMutation.mutate(deleteConfirm.id); setDeleteConfirm(null) }}
            title="Delete Worker"
            message="Are you sure you want to delete this worker?"
            isPending={deleteMutation.isPending}
        />
        <ConfirmDialog
            isOpen={deleteConfirm?.type === 'alt'}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={() => { deleteAltMutation.mutate({ id: deleteConfirm.id, alt_id: deleteConfirm.alt_id }); setDeleteConfirm(null) }}
            title="Delete Alt Phone"
            message="Are you sure you want to delete this alternative phone number?"
            isPending={deleteAltMutation.isPending}
        />
        <ConfirmDialog
            isOpen={deleteConfirm?.type === 'primary'}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={() => { makePrimaryMutation.mutate({ id: deleteConfirm.id, alt_id: deleteConfirm.alt_id, make_primary: true }); setDeleteConfirm(null) }}
            title="Make Primary Phone"
            message="Make this the primary phone number? The current primary will become an alt."
            isPending={makePrimaryMutation.isPending}
        />
        </div>
    )
}
