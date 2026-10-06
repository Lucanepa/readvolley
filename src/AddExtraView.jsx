import React, { useState, useId } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { api } from './services/api'
import ErrorBoundary from './components/ErrorBoundary'
import { Save, Upload, X } from 'lucide-react'
import {
    Modal, Button, Field, Input, Select, SegmentedControl, FormError, toast, FOCUS_RING, cn,
} from './ui/volleyui'

const FORM_ID = 'add-extra-form'

// Labels for the stored values; the values themselves are what the API keeps.
const CATEGORIES = [
    { value: 'indoor', label: 'Indoor' },
    { value: 'beach', label: 'Beach' },
    { value: 'ssk', label: 'SSK' },
    { value: 'multimedia', label: 'Multimedia' },
]
const CONTENT_TYPES = [
    { value: 'post', label: 'Post' },
    { value: 'link', label: 'Link' },
    { value: 'pdf', label: 'PDF' },
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
]

// Same tone as Field's "form" label, for controls that are not a single input.
const GROUP_LABEL = 'mb-1.5 block text-sm font-medium text-stone-700'

// quill.snow.css is unlayered, so it beats Tailwind's utilities layer; the
// overrides below are marked important (`!`) to win. They put the editor on
// white with stone hairlines and turn Quill's blue hover/active ink to slate.
const QUILL_SKIN = [
    'rounded-lg focus-within:ring-2 focus-within:ring-red-500',
    '[&_.ql-toolbar]:rounded-t-lg! [&_.ql-toolbar]:border-stone-300! [&_.ql-toolbar]:bg-stone-50! [&_.ql-toolbar]:[font-family:inherit]!',
    '[&_.ql-container]:rounded-b-lg! [&_.ql-container]:border-stone-300! [&_.ql-container]:bg-white! [&_.ql-container]:[font-family:inherit]! [&_.ql-container]:text-sm!',
    '[&_.ql-editor]:min-h-[200px] [&_.ql-editor]:max-h-[400px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:text-stone-800',
    '[&_.ql-stroke]:stroke-stone-600! [&_.ql-fill]:fill-stone-600! [&_.ql-picker]:text-stone-600!',
    '[&_button:hover_.ql-stroke]:stroke-slate-900! [&_button.ql-active_.ql-stroke]:stroke-slate-900!',
    '[&_button:hover_.ql-fill]:fill-slate-900! [&_button.ql-active_.ql-fill]:fill-slate-900!',
    '[&_.ql-picker-label:hover]:text-slate-900! [&_.ql-picker-label.ql-active]:text-slate-900! [&_.ql-picker-label:hover_.ql-stroke]:stroke-slate-900! [&_.ql-picker-label.ql-active_.ql-stroke]:stroke-slate-900!',
    '[&_.ql-picker-item:hover]:text-slate-900! [&_.ql-picker-item.ql-selected]:text-slate-900! [&_.ql-picker-options]:rounded-lg! [&_.ql-picker-options]:border-stone-300!',
].join(' ')

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
        season: initialData?.season || '2025/2026',
        tags: Array.isArray(initialData?.tags) ? initialData.tags : [], // Strictly ensure array
        ssk_name: initialData?.ssk_name || '',
    })
    const [tagInput, setTagInput] = useState('')
    const [status, setStatus] = useState('idle') // idle, submitting, error
    const [saveError, setSaveError] = useState('')
    const tagInputId = useId()
    const contentLabelId = useId()
    const isEdit = Boolean(initialData?.id)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('submitting')
        setSaveError('')

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
            // Toast only once the write resolved; closing refreshes the list behind.
            toast.success(isEdit ? 'Changes saved.' : 'Resource added.', { lang: 'EN' })
            onClose()
        } catch (error) {
            console.error('Error saving extra:', error)
            setSaveError(error?.message || '')
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
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link'],
            ['clean']
        ],
    }

    const seasons = ['2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030', '2030/2031']
    const urlRequired = formData.type === 'link' || formData.type === 'pdf'

    return (
        <Modal
            open
            onClose={onClose}
            title={isEdit ? 'Edit resource' : 'Add resource'}
            layout="sections"
            size="xl"
            decision
            dismissible={false} // the form holds unsaved input; Escape and × still close
            closeLabel="Close"
            footer={(
                <>
                    <Button variant="secondary" size="lg" onClick={onClose}>Cancel</Button>
                    <Button
                        type="submit"
                        form={FORM_ID}
                        size="lg"
                        icon={Save}
                        loading={status === 'submitting'}
                    >
                        {isEdit ? 'Save changes' : 'Add resource'}
                    </Button>
                </>
            )}
        >
            <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
                {/* Environment Selector */}
                <div>
                    <span className={GROUP_LABEL}>Category</span>
                    <SegmentedControl
                        ariaLabel="Category"
                        options={CATEGORIES}
                        value={formData.rules_type}
                        onChange={(type) => setFormData(prev => ({ ...prev, rules_type: type }))}
                    />
                </div>

                {/* Metadata Row: Season & Type */}
                <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
                    <Field label="Season">
                        <Select name="season" value={formData.season} onChange={handleChange} block>
                            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </Field>

                    <div className="min-w-0">
                        <span className={GROUP_LABEL}>Content type</span>
                        <SegmentedControl
                            ariaLabel="Content type"
                            options={CONTENT_TYPES}
                            value={formData.type}
                            onChange={(t) => setFormData(prev => ({ ...prev, type: t }))}
                        />
                    </div>
                </div>

                <Field label="Title">
                    <Input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </Field>

                {/* SSK Name - Only relevant if environment is ssk, but safe to show/store generally */}
                <Field label="SSK name" hint="Optional – a name or author.">
                    <Input type="text" name="ssk_name" value={formData.ssk_name} onChange={handleChange} />
                </Field>

                {/* Tags Input */}
                <div>
                    <label htmlFor={tagInputId} className={GROUP_LABEL}>Tags</label>
                    <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2 py-1 focus-within:ring-2 focus-within:ring-red-500">
                        {formData.tags?.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-0.5 rounded border border-stone-200 bg-stone-50 py-0.5 pl-1.5 pr-0.5 text-xs font-medium text-stone-700">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    aria-label={`Remove tag ${tag}`}
                                    title={`Remove tag ${tag}`}
                                    className={cn('inline-flex h-5 w-5 items-center justify-center rounded text-stone-400 hover:bg-stone-200 hover:text-stone-700', FOCUS_RING)}
                                >
                                    <X size={12} aria-hidden="true" />
                                </button>
                            </span>
                        ))}
                        <input
                            id={tagInputId}
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder="Add a tag"
                            aria-describedby={`${tagInputId}-hint`}
                            className="h-7 min-w-[9rem] flex-1 bg-transparent px-1 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none"
                        />
                    </div>
                    <span id={`${tagInputId}-hint`} className="mt-1.5 block text-xs text-stone-500">Press Enter or comma to add a tag.</span>
                </div>

                {formData.type === 'post' && (
                    <div>
                        <span id={contentLabelId} className={GROUP_LABEL}>Content</span>
                        <div className={QUILL_SKIN} role="group" aria-labelledby={contentLabelId}>
                            <ErrorBoundary fallback={
                                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                                    The text editor failed to load. Please refresh the page.
                                </p>
                            }>
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={handleContentChange}
                                    modules={modules}
                                />
                            </ErrorBoundary>
                        </div>
                    </div>
                )}

                <Field label="Image filename" hint="Place the file in public/extra_images/.">
                    <Input
                        type="text"
                        name="image_path"
                        icon={Upload}
                        value={formData.image_path}
                        onChange={handleChange}
                        placeholder="e.g. tournament-2025.jpg"
                    />
                </Field>

                {(urlRequired || formData.link_url) && (
                    <Field label="URL">
                        <Input
                            type="url"
                            name="link_url"
                            value={formData.link_url}
                            onChange={handleChange}
                            placeholder="https://…"
                            required={urlRequired}
                        />
                    </Field>
                )}

                {status === 'error' && (
                    <FormError>
                        {saveError ? `Could not save the resource – ${saveError}` : 'Could not save the resource. Please try again.'}
                    </FormError>
                )}
            </form>
        </Modal>
    )
}

export default AddExtraView
