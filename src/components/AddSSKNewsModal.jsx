
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, X, Tag, Calendar } from 'lucide-react'
import { theme } from '../styles/theme'
import { api } from '../services/api'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

function AddSSKNewsModal({ onClose, initialData = null }) {
    const [formData, setFormData] = useState({
        title: '',
        text: '',
        topic: 'General',
        season: '2025/2026',
        ssk_name: ''
    })
    const [status, setStatus] = useState('idle')

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                text: initialData.content || '', // extras table uses 'content'
                topic: (initialData.tags && initialData.tags[0]) || 'General', // extras table uses 'tags'
                season: initialData.season || '2025/2026',
                ssk_name: initialData.ssk_name || ''
            })
        }
    }, [initialData])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, text: content }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('submitting')
        try {
            const extraData = {
                title: formData.title,
                content: formData.text,
                season: formData.season,
                tags: [formData.topic],
                rules_type: 'ssk',
                type: 'post',
                ssk_name: formData.ssk_name
            }

            if (initialData?.id) {
                await api.updateExtra(initialData.id, extraData)
            } else {
                await api.addExtra(extraData)
            }
            setStatus('success')
            setTimeout(onClose, 1000)
        } catch (error) {
            console.error('Error saving news:', error)
            setStatus('error')
        }
    }

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link'],
            ['clean']
        ],
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2000,
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '1.5rem',
                    border: `1px solid ${theme.colors.border.subtle}`,
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        {initialData ? 'Edit SSK News' : 'Add SSK News'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.colors.text.secondary, cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Title */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.text.secondary }}>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="News Headline"
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

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.text.secondary }}>SSK Name</label>
                        <input
                            type="text"
                            name="ssk_name"
                            value={formData.ssk_name}
                            onChange={handleChange}
                            placeholder="Enter name"
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

                    {/* Meta Row */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.text.secondary }}>Topic</label>
                            <div style={{ position: 'relative' }}>
                                <Tag size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                                <select
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        appearance: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="General">General</option>
                                    <option value="Referees">Referees</option>
                                    <option value="Rules">Rules</option>
                                    <option value="Events">Events</option>
                                    <option value="Guidelines">Guidelines</option>
                                    <option value="Technique">Technique</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.text.secondary }}>Season</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
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
                                        appearance: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="2025/2026">2025/2026</option>
                                    <option value="2026/2027">2026/2027</option>
                                    <option value="2027/2028">2027/2028</option>
                                    <option value="2028/2029">2028/2029</option>
                                    <option value="2029/2030">2029/2030</option>
                                    <option value="2030/2031">2030/2031</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.text.secondary }}>Content</label>
                        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', color: 'black' }}>
                            <style>
                                {`
                                    .ql-toolbar { border: none !important; border-bottom: 1px solid #ddd !important; background: #f8f9fa; }
                                    .ql-container { border: none !important; font-size: 1rem; }
                                    .ql-editor { min-height: 150px; max-height: 300px; }
                                `}
                            </style>
                            <ReactQuill
                                theme="snow"
                                value={formData.text}
                                onChange={handleContentChange}
                                modules={modules}
                            />
                        </div>
                    </div>

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
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            style={{
                                flex: 2,
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                opacity: status === 'submitting' ? 0.7 : 1
                            }}
                        >
                            {status === 'submitting' ? 'Saving...' : <><Save size={20} /> {initialData ? 'Update News' : 'Save News'}</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}

export default AddSSKNewsModal
