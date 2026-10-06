import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { accordionMotion } from './styles/motion'
import { api } from './services/api'
import { Plus, ExternalLink, Pencil, Trash2, ChevronDown, Filter, FileText, SearchX, CalendarClock } from 'lucide-react'
import {
    Button, IconButton, Card, Chip, EmptyState, FilterPill, SegmentedControl, Skeleton,
    confirmDialog, toast, dayLabel, FOCUS_RING, cn,
} from './ui/volleyui'
import AddExtraView from './AddExtraView'

// 11px micro label over a filter group; the uppercase comes from CSS only.
const FILTER_LABEL = 'mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-500'

function ExtraView({ environment, user, onLogin }) { // Props explicitly destructured
    const [extras, setExtras] = useState([])
    const [filteredExtras, setFilteredExtras] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingExtra, setEditingExtra] = useState(null) // State for the item being edited
    const [expandedItems, setExpandedItems] = useState({}) // State for read more toggles: { id: boolean }
    const [deleteError, setDeleteError] = useState(null) // { id, message } shown on the card it belongs to

    // Filter State
    const [selectedSeason, setSelectedSeason] = useState('All')
    const [selectedTags, setSelectedTags] = useState([])
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        loadExtras()
    }, [environment])

    useEffect(() => {
        applyFilters()
    }, [extras, selectedSeason, selectedTags])

    const loadExtras = async () => {
        try {
            setIsLoading(true)
            setLoadError(null)
            const data = await api.getExtras(environment)
            setExtras(data || [])
        } catch (error) {
            console.error('Error loading extras:', error)
            setLoadError(error)
        } finally {
            setIsLoading(false)
        }
    }

    const applyFilters = () => {
        let result = extras

        if (selectedSeason !== 'All') {
            result = result.filter(item => item.season === selectedSeason)
        }

        if (selectedTags.length > 0) {
            result = result.filter(item => {
                if (!item.tags || item.tags.length === 0) return false
                // Check if item has ALL selected tags (AND logic)
                // return selectedTags.every(tag => item.tags.includes(tag))

                // Check if item has ANY selected tags (OR logic) - usually better for discovery
                return selectedTags.some(tag => item.tags.includes(tag))
            })
        }

        setFilteredExtras(result)
    }

    const deleteExtra = async (item) => {
        const ok = await confirmDialog({
            title: 'Delete this resource?',
            message: `“${item.title}” will be removed for everyone. This cannot be undone.`,
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel',
            tone: 'danger',
            lang: 'EN',
        })
        if (!ok) return
        setDeleteError(null)
        try {
            await api.deleteExtra(item.id)
            setExtras(prev => prev.filter(entry => entry.id !== item.id))
            toast.success('Resource deleted.', { lang: 'EN' })
        } catch (error) {
            setDeleteError({ id: item.id, message: error.message })
        }
    }

    const toggleReadMore = (id) => {
        setExpandedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const clearFilters = () => { setSelectedSeason('All'); setSelectedTags([]) }

    // Derived Data for Filter Options
    const distinctSeasons = ['All', ...new Set(extras.map(e => e.season).filter(Boolean))].sort().reverse() // Newest first
    const distinctTags = [...new Set(extras.flatMap(e => e.tags || []))].sort()
    const activeFilterCount = selectedTags.length + (selectedSeason !== 'All' ? 1 : 0)

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    // A refresh (after the editor closes) keeps the list on screen; only a
    // first load with nothing to show yet gets the skeleton.
    const showSkeleton = isLoading && extras.length === 0

    return (
        <div>
            {/* Toolbar: filter toggle, and the admin's add button */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Button
                    variant="secondary"
                    icon={Filter}
                    aria-expanded={showFilters}
                    aria-controls="extra-filters"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(showFilters && 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800')}
                >
                    Filters
                    {activeFilterCount > 0 && (
                        <span
                            className={cn(
                                'ml-0.5 min-w-5 rounded-full px-1.5 text-[11px] font-semibold tabular-nums leading-5',
                                showFilters ? 'bg-white text-slate-900' : 'bg-slate-900 text-white',
                            )}
                        >
                            <span className="sr-only">active: </span>{activeFilterCount}
                        </span>
                    )}
                </Button>
                {user && (
                    <Button
                        icon={Plus}
                        className="ml-auto"
                        onClick={() => {
                            setEditingExtra(null) // Reset editing state for new item
                            setShowAddModal(true)
                        }}
                    >
                        Add resource
                    </Button>
                )}
            </div>

            {/* Filters Section */}
            <AnimatePresence initial={false}>
                {showFilters && (
                    <motion.div id="extra-filters" {...accordionMotion} className="overflow-hidden">
                        <Card className="space-y-4">
                            {/* Season Filter */}
                            <div>
                                <p className={FILTER_LABEL}><CalendarClock size={13} aria-hidden="true" /> Season</p>
                                <SegmentedControl
                                    variant="joined"
                                    ariaLabel="Season"
                                    value={selectedSeason}
                                    onChange={setSelectedSeason}
                                    options={distinctSeasons.map(season => ({ value: season, label: season }))}
                                />
                            </div>

                            {/* Tags Filter */}
                            {distinctTags.length > 0 && (
                                <div>
                                    <p className={FILTER_LABEL}>Tags</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {distinctTags.map(tag => (
                                            <FilterPill key={tag} active={selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>
                                                {tag}
                                            </FilterPill>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clear Filters */}
                            {activeFilterCount > 0 && (
                                <div className="flex justify-end">
                                    <Button variant="text" onClick={clearFilters}>Clear all filters</Button>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {loadError && (
                <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    <span>Could not load the resources{loadError.message ? ` – ${loadError.message}` : '.'}</span>
                    <Button variant="ghost" size="sm" className="border-red-200 bg-white text-red-700 hover:bg-red-50" onClick={loadExtras}>
                        Try again
                    </Button>
                </div>
            )}

            {showSkeleton ? (
                <div role="status" aria-busy="true" className="space-y-4">
                    <span className="sr-only">Loading resources…</span>
                    {[0, 1].map(i => (
                        <Card key={i} stack={false} className="space-y-3">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                        </Card>
                    ))}
                </div>
            ) : filteredExtras.length === 0 ? (
                !loadError && (
                    <Card>
                        <EmptyState
                            icon={extras.length === 0 ? FileText : SearchX}
                            title={extras.length === 0 ? 'No content yet' : 'No matches found'}
                            action={extras.length > 0 && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
                            )}
                        >
                            {extras.length > 0 ? 'No resource matches the selected season and tags.' : undefined}
                        </EmptyState>
                    </Card>
                )
            ) : (
                <div className="space-y-4">
                    {filteredExtras.map(item => {
                        const isExpanded = expandedItems[item.id]
                        // Simple heuristic: If content is long/HTML, we might want to collapse it initially
                        // For now, let's always collapsible if it's a post
                        const isCollapsible = item.type === 'post' && item.content && item.content.length > 300
                        const collapsed = isCollapsible && !isExpanded
                        const date = dayLabel(item.created_at, { year: true })

                        return (
                            <Card as="article" key={item.id} pad="flush" stack={false} className="overflow-hidden">
                                {/* Image Header */}
                                {item.image_path && (
                                    <img
                                        src={`/extra_images/${item.image_path}`}
                                        alt={item.title}
                                        className="h-48 w-full border-b border-stone-200/70 object-cover sm:h-56"
                                    />
                                )}

                                <div className="p-4 sm:p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            {/* Meta: Type · Date */}
                                            <p className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-stone-500">
                                                <span className="font-semibold uppercase tracking-wide text-stone-400">{item.type}</span>
                                                {date && (
                                                    <>
                                                        <span aria-hidden="true">·</span>
                                                        <time dateTime={item.created_at} className="tabular-nums">{date}</time>
                                                    </>
                                                )}
                                            </p>
                                            <h3 className="mt-1 text-base font-semibold leading-snug text-stone-900 sm:text-lg">
                                                {item.title}
                                            </h3>
                                        </div>

                                        {/* Admin Actions */}
                                        {user && (
                                            <div className="flex shrink-0 gap-1.5">
                                                <IconButton
                                                    label="Edit"
                                                    icon={Pencil}
                                                    onClick={() => {
                                                        setEditingExtra(item) // Set item to edit
                                                        setShowAddModal(true)
                                                    }}
                                                />
                                                <IconButton
                                                    label="Delete"
                                                    icon={Trash2}
                                                    onClick={() => deleteExtra(item)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {deleteError?.id === item.id && (
                                        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
                                            Could not delete this resource{deleteError.message ? ` – ${deleteError.message}` : '.'}
                                        </p>
                                    )}

                                    {/* Meta: Season & Tags */}
                                    {(item.season || item.tags?.length > 0) && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {item.season && <Chip tone="stone" title="Season"><span className="tabular-nums">{item.season}</span></Chip>}
                                            {item.tags?.slice().sort().map(tag => (
                                                <Chip key={tag} tone="ghost" className="text-stone-500">#{tag}</Chip>
                                            ))}
                                        </div>
                                    )}

                                    {item.content && (
                                        <div className="mt-3">
                                            <div
                                                id={`extra-content-${item.id}`}
                                                className={cn(
                                                    'rich-text-content overflow-hidden',
                                                    // Truncate long posts, fading the last lines out
                                                    collapsed && 'max-h-[150px] [mask-image:linear-gradient(to_bottom,black_50%,transparent)]',
                                                )}
                                                dangerouslySetInnerHTML={{ __html: item.content }}
                                            />

                                            {isCollapsible && (
                                                <Button
                                                    variant="text"
                                                    className="mt-1 h-8 font-semibold text-stone-700 hover:text-stone-900"
                                                    aria-expanded={!!isExpanded}
                                                    aria-controls={`extra-content-${item.id}`}
                                                    onClick={() => toggleReadMore(item.id)}
                                                    iconRight={<ChevronDown size={14} aria-hidden="true" className={cn('transition-transform', isExpanded && 'rotate-180')} />}
                                                >
                                                    {isExpanded ? 'Show less' : 'Read more'}
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {item.link_url && (
                                        <div className="mt-3 border-t border-stone-100 pt-3">
                                            <a
                                                href={item.link_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn('inline-flex items-center gap-1.5 rounded text-sm font-semibold text-red-600 hover:text-red-700 hover:underline', FOCUS_RING)}
                                            >
                                                Open link <ExternalLink size={14} aria-hidden="true" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            <AnimatePresence>
                {showAddModal && user && (
                    <AddExtraView
                        initialData={editingExtra} // Pass data if editing
                        onClose={() => {
                            setShowAddModal(false)
                            setEditingExtra(null)
                            loadExtras() // Refresh list on close
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default ExtraView
