import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { theme } from './styles/theme'
import { api } from './services/api'
import { ChevronLeft, Save, Upload, Link as LinkIcon, FileText, Tag, CalendarClock } from 'lucide-react'

function AddExtraView({ onClose, initialData = null }) {
    // Initialize with safe defaults.
    // We do NOT store 'id' in formData to avoid sending it inadvertently during Create/Update if not needed contextually,
    // though we use initialData.id for the update check.
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        content: initialData?.content || '',
        image_path: initialData?.image_path || '',
        link_url: initialData?.link_url || '',
        type: initialData?.type || 'post',
        rules_type: initialData?.rules_type || 'indoor',
        season: initialData?.season || '2024/2025',
        tags: Array.isArray(initialData?.tags) ? initialData.tags : [], // Strictly ensure array
    })
    const [tagInput, setTagInput] = useState('')
    const [status, setStatus] = useState('idle') // idle, submitting, success, error

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('submitting')

        try {
            // Create a payload copy to sanitize
            const payload = { ...formData }
            // Ensure tags is strictly an array (though state should handle it, redundancy is safe)
            if (!Array.isArray(payload.tags)) payload.tags = []

            if (initialData?.id) {
                // Update: ID is generic arg 1, payload is arg 2
                await api.updateExtra(initialData.id, payload)
            } else {
                // Create: ensure no 'id' field is present in payload
                delete payload.id
                await api.addExtra(payload)
            }
            setStatus('success')
            setTimeout(onClose, 1500)
        } catch (error) {
            console.error('Error saving extra:', error)
            setStatus('error')
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, content }))
    }

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const newTag = tagInput.trim()
            // Safe access to tags
            const currentTags = Array.isArray(formData.tags) ? formData.tags : []

            if (newTag && !currentTags.includes(newTag)) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...(Array.isArray(prev.tags) ? prev.tags : []), newTag].sort()
                }))
            }
            setTagInput('')
        }
    }

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: (Array.isArray(prev.tags) ? prev.tags : []).filter(tag => tag !== tagToRemove)
        }))
    }

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link'],
            ['clean']
        ],
    }

    const seasons = ['2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030', '2030/2031']

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2000,
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
        >
            <div style={{
                width: '100%',
                maxWidth: '800px',
                backgroundColor: '#1a1a1a',
                borderRadius: '1.5rem',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '2rem',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        {initialData ? 'Edit Resource' : 'Add New Resource'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {/* Environment Selector */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {['indoor', 'beach'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, rules_type: type }))}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid',
                                    borderColor: formData.rules_type === type ? theme.colors[type].primary : 'rgba(255,255,255,0.1)',
                                    backgroundColor: formData.rules_type === type ? `${theme.colors[type].primary}22` : 'transparent',
                                    color: formData.rules_type === type ? theme.colors[type].primary : theme.colors.text.secondary,
                                    textTransform: 'capitalize',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Metadata Row: Season & Type */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* Season Selector */}
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.text.secondary, fontSize: '0.9rem' }}>Season</label>
                            <div style={{ position: 'relative' }}>
                                <CalendarClock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                                <select
                                    name="season"
                                    value={formData.season}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        fontSize: '1rem',
                                        appearance: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Type Selector condensed */}
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.text.secondary, fontSize: '0.9rem' }}>Content Type</label>
                            <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', padding: '0.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'post' }))}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        borderRadius: '0.3rem',
                                        backgroundColor: formData.type === 'post' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: formData.type === 'post' ? 'white' : 'rgba(255,255,255,0.5)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Blog Post
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'link' }))}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        borderRadius: '0.3rem',
                                        backgroundColor: formData.type === 'link' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: formData.type === 'link' ? 'white' : 'rgba(255,255,255,0.5)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    External Link
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.text.secondary }}>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Tags Input */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.text.secondary }}>Tags</label>
                        <div style={{
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            alignItems: 'center'
                        }}>
                            <Tag size={16} color="rgba(255,255,255,0.5)" style={{ marginLeft: '0.5rem' }} />
                            {formData.tags?.map(tag => (
                                <span key={tag} style={{
                                    backgroundColor: theme.colors[formData.rules_type].primary,
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: 1 }}
                                    >×</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder="Add tag (Press Enter)..."
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    padding: '0.5rem',
                                    minWidth: '150px'
                                }}
                            />
                        </div>
                    </div>

                    {formData.type === 'post' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.text.secondary }}>Content</label>
                            <div className="quill-wrapper" style={{
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                borderRadius: '0.5rem',
                                color: 'black',
                                overflow: 'hidden' // Ensure rounded corners
                            }}>
                                <style>
                                    {`
                                        .ql-container {
                                            font-family: inherit;
                                            font-size: 1rem;
                                        }
                                        .ql-editor {
                                            min-height: 200px;
                                            max-height: 400px;
                                            overflow-y: auto;
                                        }
                                        .ql-toolbar {
                                            border-top: none !important;
                                            border-left: none !important;
                                            border-right: none !important;
                                            border-bottom: 1px solid #ddd !important;
                                            background-color: #f8f9fa;
                                        }
                                        .ql-container.ql-snow {
                                            border: none !important;
                                        }
                                    `}
                                </style>
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={handleContentChange}
                                    modules={modules}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.text.secondary }}>
                            Image Filename <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>(Place in public/extra_images/)</span>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Upload size={18} color={theme.colors.text.secondary} />
                            <input
                                type="text"
                                name="image_path"
                                value={formData.image_path}
                                onChange={handleChange}
                                placeholder="e.g. tournament-2025.jpg"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.5rem',
                                    color: 'white'
                                }}
                            />
                        </div>
                    </div>

                    {(formData.type === 'link' || formData.link_url) && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.text.secondary }}>URL</label>
                            <input
                                type="url"
                                name="link_url"
                                value={formData.link_url}
                                onChange={handleChange}
                                placeholder="https://..."
                                required={formData.type === 'link'}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.5rem',
                                    color: 'white'
                                }}
                            />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'transparent',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            Go Back
                        </button>
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            style={{
                                flex: 2,
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                backgroundColor: theme.colors[formData.rules_type].primary,
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                opacity: status === 'submitting' ? 0.7 : 1
                            }}
                        >
                            {status === 'submitting'
                                ? 'Saving...'
                                : <><Save size={20} /> {initialData ? 'Update Resource' : 'Save Resource'}</>
                            }
                        </button>
                    </div>

                    {status === 'success' && (
                        <p style={{ color: '#4ade80', textAlign: 'center', margin: 0 }}>Successfully saved!</p>
                    )}
                    {status === 'error' && (
                        <p style={{ color: '#ef4444', textAlign: 'center', margin: 0 }}>Error saving. Check console.</p>
                    )}
                </form>
            </div>
        </motion.div>
    )
}

export default AddExtraView
