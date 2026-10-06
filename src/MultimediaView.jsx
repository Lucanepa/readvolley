import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { accordionMotion } from './styles/motion'
import { api } from './services/api'
import {
    Plus, ExternalLink, Pencil, Trash2, SlidersHorizontal, Play, FileText, Image as ImageIcon, PlaySquare,
} from 'lucide-react'
import AddExtraView from './AddExtraView'
import {
    Banner, Button, Card, CountBadge, EmptyState, Field, Notice, Row, RowList, RowTool, SegmentedControl,
    Select, SkeletonRows, BUTTON_SIZES, BUTTON_VARIANTS, FOCUS_RING, confirmDialog, dayLabel, toast, cn,
} from './ui/volleyui'

const ALL = 'All'
const TYPE_LABEL = { video: 'Video', image: 'Image', pdf: 'PDF' }
const TYPE_OPTIONS = [
    { value: ALL, label: 'All' },
    { value: 'video', label: 'Video' },
    { value: 'image', label: 'Image' },
    { value: 'pdf', label: 'PDF' },
]

export function MultimediaView({ user }) {
    const [mediaItems, setMediaItems] = useState([])
    const [filteredItems, setFilteredItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [actionError, setActionError] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    // Filter State
    const [selectedSeason, setSelectedSeason] = useState(ALL)
    const [selectedType, setSelectedType] = useState(ALL)
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        loadMedia()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [mediaItems, selectedSeason, selectedType])

    const loadMedia = async () => {
        setLoadError(false)
        try {
            setIsLoading(true)
            const data = await api.getExtras('multimedia')
            setMediaItems(data || [])
        } catch (error) {
            console.error('Error loading multimedia:', error)
            setLoadError(true)
        } finally {
            setIsLoading(false)
        }
    }

    const applyFilters = () => {
        let result = mediaItems

        if (selectedSeason !== ALL) {
            result = result.filter(item => item.season === selectedSeason)
        }

        if (selectedType !== ALL) {
            result = result.filter(item => item.type === selectedType)
        }

        setFilteredItems(result)
    }

    const handleDelete = async (item) => {
        const ok = await confirmDialog({
            title: 'Delete this item?',
            message: `“${item.title}” is removed for everyone. This cannot be undone.`,
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel',
            tone: 'danger',
            lang: 'EN',
        })
        if (!ok) return
        setActionError('')
        try {
            await api.deleteExtra(item.id)
            toast.success('Item deleted.')
            loadMedia()
        } catch (error) {
            console.error('Error deleting:', error)
            setActionError('Could not delete the item. Please try again.')
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case 'video': return PlaySquare
            case 'image': return ImageIcon
            default: return FileText
        }
    }

    const distinctSeasons = [ALL, ...new Set(mediaItems.map(n => n.season).filter(Boolean))].sort().reverse()
    const activeFilterCount = (selectedSeason !== ALL ? 1 : 0) + (selectedType !== ALL ? 1 : 0)
    const clearFilters = () => { setSelectedSeason(ALL); setSelectedType(ALL) }

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    icon={SlidersHorizontal}
                    aria-expanded={showFilters}
                    aria-controls="multimedia-filters"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(showFilters && 'bg-stone-100')}
                >
                    Filters
                    {activeFilterCount > 0 && <CountBadge tone="stone" className="px-1.5 py-0 text-[11px]">{activeFilterCount}</CountBadge>}
                </Button>
                {user && (
                    <Button icon={Plus} className="ml-auto" onClick={() => { setEditingItem(null); setShowAddModal(true) }}>
                        Add media
                    </Button>
                )}
            </div>

            <AnimatePresence initial={false}>
                {showFilters && (
                    <motion.div id="multimedia-filters" {...accordionMotion} className="overflow-hidden">
                        <Card className="grid gap-3 sm:grid-cols-2">
                            <Field label="Season" tone="eyebrow">
                                <Select block value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
                                    {distinctSeasons.map(s => (
                                        <option key={s} value={s}>{s === ALL ? 'All seasons' : s}</option>
                                    ))}
                                </Select>
                            </Field>
                            <div>
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Type</p>
                                <SegmentedControl ariaLabel="Type" options={TYPE_OPTIONS} value={selectedType} onChange={setSelectedType} />
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {loadError && (
                <Banner tone="danger" className="mb-4" action={{ label: 'Retry', onClick: loadMedia }}>
                    Could not load the media. Check your connection and try again.
                </Banner>
            )}
            <Notice className="mb-4">{actionError}</Notice>

            {isLoading && mediaItems.length === 0 ? (
                <Card pad="list">
                    <span className="sr-only">Loading media…</span>
                    <SkeletonRows rows={4} pill={false} />
                </Card>
            ) : loadError && mediaItems.length === 0 ? null : filteredItems.length === 0 ? (
                <Card pad="list">
                    <EmptyState
                        icon={PlaySquare}
                        title={activeFilterCount > 0 ? 'No media matches your filters.' : 'No media yet.'}
                        action={activeFilterCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
                        )}
                    />
                </Card>
            ) : (
                <Card pad="list">
                    <RowList soft>
                        {filteredItems.map(item => {
                            const TypeIcon = getIcon(item.type)
                            const date = dayLabel(item.created_at, { year: true })
                            const href = item.link_url?.startsWith('http') ? item.link_url : `/multimedia/${item.link_url}`
                            const description = item.content?.replace(/<[^>]*>?/gm, ' ').trim()
                            // Beside the row for readers; for admins it leads the row's tool line instead,
                            // so the link and the edit tools never stack on separate lines.
                            const openLink = (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn('inline-flex items-center justify-center font-medium transition-colors', BUTTON_SIZES.sm, BUTTON_VARIANTS.ghost, FOCUS_RING)}
                                >
                                    {item.type === 'video' ? 'Watch' : item.type === 'pdf' ? 'Open PDF' : 'View'}
                                    <ExternalLink size={13} aria-hidden="true" />
                                </a>
                            )
                            return (
                                <Row
                                    key={item.id}
                                    stripe={false}
                                    leading={(
                                        // Thumbnail/Preview
                                        <div className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-stone-100 text-stone-400">
                                            {item.image_path ? (
                                                <img src={`/multimedia/${item.image_path}`} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <TypeIcon size={24} strokeWidth={1.75} aria-hidden="true" />
                                            )}
                                            {item.type === 'video' && item.image_path && (
                                                <span className="absolute inset-0 flex items-center justify-center bg-stone-900/20">
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-stone-900">
                                                        <Play size={13} fill="currentColor" aria-hidden="true" />
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    title={item.title}
                                    meta={(
                                        <>
                                            <span>{TYPE_LABEL[item.type] || item.type}</span>
                                            {item.season && <span className="tabular-nums">{item.season}</span>}
                                            {date && <span className="tabular-nums">{date}</span>}
                                        </>
                                    )}
                                    action={!user && openLink}
                                    actionIndent="pl-[6rem]"
                                    tools={user && (
                                        <>
                                            {openLink}
                                            <RowTool onClick={() => { setEditingItem(item); setShowAddModal(true) }}>
                                                <Pencil size={13} aria-hidden="true" /> Edit
                                            </RowTool>
                                            <RowTool onClick={() => handleDelete(item)} className="text-red-700 hover:bg-red-50">
                                                <Trash2 size={13} aria-hidden="true" /> Delete
                                            </RowTool>
                                        </>
                                    )}
                                    toolsIndent="sm:pl-[6.25rem]"
                                >
                                    <p className="mt-1 line-clamp-2 text-xs text-stone-600">
                                        {description || 'No description available.'}
                                    </p>
                                </Row>
                            )
                        })}
                    </RowList>
                </Card>
            )}

            <AnimatePresence>
                {showAddModal && (
                    <AddExtraView
                        initialData={editingItem ? { ...editingItem, rules_type: 'multimedia' } : { rules_type: 'multimedia', type: 'video' }}
                        onClose={() => {
                            setShowAddModal(false)
                            setEditingItem(null)
                            loadMedia()
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
