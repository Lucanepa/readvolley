import React, { useState, useEffect, useId } from 'react'
import { Save } from 'lucide-react'
import { api } from '../services/api'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Button, Field, FormError, Input, Modal, Select, modalCancelClass, toast } from '../ui/volleyui'

const TOPICS = ['General', 'Referees', 'Rules', 'Events', 'Guidelines', 'Technique', 'Other']
const SEASONS = ['2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030', '2030/2031']

// Quill ships its own unlayered CSS, which beats Tailwind's layered utilities
// whatever the specificity, so the overrides that collide carry `!`.
const QUILL_FRAME = [
    'overflow-hidden rounded-lg border border-stone-300 bg-white text-stone-800',
    'focus-within:ring-2 focus-within:ring-red-500',
    '[&_.ql-toolbar]:border-x-0! [&_.ql-toolbar]:border-t-0! [&_.ql-toolbar]:border-stone-200! [&_.ql-toolbar]:bg-stone-50',
    '[&_.ql-container]:border-0! [&_.ql-container]:font-[inherit]! [&_.ql-container]:text-sm!',
    '[&_.ql-editor]:min-h-[150px] [&_.ql-editor]:max-h-[300px]',
    '[&_.ql-editor.ql-blank::before]:not-italic! [&_.ql-editor.ql-blank::before]:text-stone-400!',
].join(' ')

function AddSSKNewsModal({ onClose, initialData = null }) {
    const formId = useId()
    const contentLabelId = useId()
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
            toast.success(initialData?.id ? 'News updated.' : 'News saved.')
            onClose()
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

    const submitting = status === 'submitting'

    return (
        <Modal
            open
            onClose={onClose}
            title={initialData ? 'Edit SSK news' : 'Add SSK news'}
            layout="sections"
            size="xl"
            decision
            dismissible={false}
            closeLabel="Close"
            footer={(
                <>
                    <button type="button" onClick={onClose} className={modalCancelClass}>
                        Cancel
                    </button>
                    <Button type="submit" form={formId} variant="positive" size="lg" icon={Save} loading={submitting}>
                        {initialData ? 'Update news' : 'Save news'}
                    </Button>
                </>
            )}
        >
            <form id={formId} onSubmit={handleSubmit} className="space-y-4">
                <Field label="Title">
                    <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="News headline"
                        data-autofocus
                    />
                </Field>

                <Field label="SSK name">
                    <Input
                        type="text"
                        name="ssk_name"
                        value={formData.ssk_name}
                        onChange={handleChange}
                        placeholder="Enter name"
                    />
                </Field>

                {/* Meta Row */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Topic">
                        <Select block name="topic" value={formData.topic} onChange={handleChange}>
                            {TOPICS.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                        </Select>
                    </Field>
                    <Field label="Season">
                        <Select block name="season" value={formData.season} onChange={handleChange} className="tabular-nums">
                            {SEASONS.map(season => <option key={season} value={season}>{season}</option>)}
                        </Select>
                    </Field>
                </div>

                {/* Text Content */}
                <div role="group" aria-labelledby={contentLabelId}>
                    <p id={contentLabelId} className="mb-1.5 text-sm font-medium text-stone-700">Content</p>
                    <div className={QUILL_FRAME}>
                        <ReactQuill
                            theme="snow"
                            value={formData.text}
                            onChange={handleContentChange}
                            modules={modules}
                        />
                    </div>
                </div>

                {status === 'error' && (
                    <FormError>Could not save the news. Please try again.</FormError>
                )}
            </form>
        </Modal>
    )
}

export default AddSSKNewsModal
