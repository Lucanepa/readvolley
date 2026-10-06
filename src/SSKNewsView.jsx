import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Pencil, SlidersHorizontal, ChevronDown, Newspaper } from 'lucide-react'
import { accordionMotion, revealMotion } from './styles/motion'
import { api } from './services/api'
import AddSSKNewsModal from './components/AddSSKNewsModal'
import {
    Banner, Button, Card, Chip, CountBadge, EmptyState, Field, FilterPill, Notice, Row, RowList,
    RowTool, SectionHeader, Select, SkeletonRows, confirmDialog, dayLabel, toast, cn,
} from './ui/volleyui'

const ALL = 'All'

function SSKNewsView({ user, onLogin }) {
    const [news, setNews] = useState([])
    const [filteredNews, setFilteredNews] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [actionError, setActionError] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [expandedId, setExpandedId] = useState(null)

    // Filter State
    const [selectedSeason, setSelectedSeason] = useState(ALL)
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedAuthor, setSelectedAuthor] = useState(ALL)
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        loadNews()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [news, selectedSeason, selectedTags, selectedAuthor])

    const loadNews = async () => {
        setIsLoading(true)
        setLoadError(false)
        try {
            const data = await api.getExtras('ssk')
            setNews(data || [])
        } catch (error) {
            console.error('Error loading SSK news:', error)
            setLoadError(true)
        } finally {
            setIsLoading(false)
        }
    }

    const applyFilters = () => {
        let result = news

        if (selectedSeason !== ALL) {
            result = result.filter(item => item.season === selectedSeason)
        }

        if (selectedAuthor !== ALL) {
            result = result.filter(item => item.ssk_name === selectedAuthor)
        }

        if (selectedTags.length > 0) {
            result = result.filter(item => {
                if (!item.tags || item.tags.length === 0) return false
                return selectedTags.some(tag => item.tags.includes(tag))
            })
        }

        setFilteredNews(result)
    }

    const toggleReadMore = (id) => {
        setExpandedId(prev => prev === id ? null : id)
    }

    const handleDelete = async (item) => {
        const ok = await confirmDialog({
            title: 'Delete this news item?',
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
            toast.success('News item deleted.')
            loadNews()
        } catch (error) {
            console.error('Error deleting:', error)
            setActionError('Could not delete the news item. Please try again.')
        }
    }

    const handleEdit = (item) => {
        setEditingItem(item)
        setShowAddModal(true)
    }

    // Derived Data for Filter Options
    const distinctSeasons = [ALL, ...new Set(news.map(n => n.season).filter(Boolean))].sort().reverse()
    const distinctAuthors = [ALL, ...new Set(news.map(n => n.ssk_name).filter(Boolean))].sort()
    const distinctTags = [...new Set(news.flatMap(n => n.tags || []))].sort()

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }

    const activeFilterCount = selectedTags.length + (selectedSeason !== ALL ? 1 : 0) + (selectedAuthor !== ALL ? 1 : 0)
    const clearFilters = () => { setSelectedSeason(ALL); setSelectedTags([]); setSelectedAuthor(ALL) }

    // Grouped by issue (`ssk_name`), in the order the API returns them (newest first).
    const groups = Object.entries(
        filteredNews.reduce((acc, item) => {
            const group = item.ssk_name || 'Anonymous'
            if (!acc[group]) acc[group] = []
            acc[group].push(item)
            return acc
        }, {})
    )

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    icon={SlidersHorizontal}
                    aria-expanded={showFilters}
                    aria-controls="ssk-news-filters"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(showFilters && 'bg-stone-100')}
                >
                    Filters
                    {activeFilterCount > 0 && <CountBadge tone="stone" className="px-1.5 py-0 text-[11px]">{activeFilterCount}</CountBadge>}
                </Button>
                <div className="ml-auto flex items-center gap-2">
                    {user ? (
                        <Button icon={Plus} onClick={() => { setEditingItem(null); setShowAddModal(true) }}>
                            Add news
                        </Button>
                    ) : (
                        <Button variant="text" onClick={onLogin} className="underline decoration-stone-300 underline-offset-2">
                            Log in to manage news
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters Section */}
            <AnimatePresence initial={false}>
                {showFilters && (
                    <motion.div id="ssk-news-filters" {...accordionMotion} className="overflow-hidden">
                        <Card className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Season" tone="eyebrow">
                                    <Select block value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
                                        {distinctSeasons.map(season => (
                                            <option key={season} value={season}>{season === ALL ? 'All seasons' : season}</option>
                                        ))}
                                    </Select>
                                </Field>
                                <Field label="Issue" tone="eyebrow">
                                    <Select block value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)}>
                                        {distinctAuthors.map(author => (
                                            <option key={author} value={author}>{author === ALL ? 'All issues' : author}</option>
                                        ))}
                                    </Select>
                                </Field>
                            </div>
                            {/* Tags Filter */}
                            {distinctTags.length > 0 && (
                                <div role="group" aria-labelledby="ssk-news-topics">
                                    <p id="ssk-news-topics" className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Topics</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {distinctTags.map(tag => (
                                            <FilterPill key={tag} active={selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>
                                                {tag}
                                            </FilterPill>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeFilterCount > 0 && (
                                <Button variant="text" onClick={clearFilters}>Clear all filters</Button>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {loadError && (
                <Banner tone="danger" className="mb-4" action={{ label: 'Retry', onClick: loadNews }}>
                    Could not load the SSK news. Check your connection and try again.
                </Banner>
            )}
            <Notice className="mb-4">{actionError}</Notice>

            {isLoading && news.length === 0 ? (
                <Card pad="list">
                    <span className="sr-only">Loading news…</span>
                    <SkeletonRows rows={6} pill={false} />
                </Card>
            ) : loadError && news.length === 0 ? null : filteredNews.length === 0 ? (
                <Card pad="list">
                    <EmptyState
                        icon={Newspaper}
                        title={activeFilterCount > 0 ? 'No news matches your filters.' : 'No news yet.'}
                        action={activeFilterCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all filters</Button>
                        )}
                    />
                </Card>
            ) : (
                <Card pad="list" className="space-y-6">
                    {groups.map(([author, authorNews]) => (
                        <section key={author}>
                            <SectionHeader title={author} count={authorNews.length} />
                            <RowList soft className="mt-1">
                                {authorNews.map(item => {
                                    const isExpanded = expandedId === item.id
                                    const isCollapsible = item.content && item.content.length > 50
                                    const date = dayLabel(item.created_at, { year: true })
                                    return (
                                        <div key={item.id}>
                                            <Row
                                                stripe={false}
                                                title={item.title}
                                                label={isCollapsible ? `${item.title} – ${isExpanded ? 'hide' : 'read'} article` : undefined}
                                                selected={isExpanded}
                                                onOpen={isCollapsible ? () => toggleReadMore(item.id) : undefined}
                                                meta={(
                                                    <>
                                                        {date && <span className="tabular-nums">{date}</span>}
                                                        {item.season && <span className="tabular-nums">{item.season}</span>}
                                                        {item.tags?.map(tag => <Chip key={tag}>{tag}</Chip>)}
                                                    </>
                                                )}
                                                status={isCollapsible && (
                                                    <ChevronDown size={16} aria-hidden="true" className={cn('text-stone-400 transition-transform', isExpanded && 'rotate-180')} />
                                                )}
                                                tools={user && (
                                                    <>
                                                        <RowTool onClick={() => handleEdit(item)}>
                                                            <Pencil size={13} aria-hidden="true" /> Edit
                                                        </RowTool>
                                                        <RowTool onClick={() => handleDelete(item)} className="text-red-700 hover:bg-red-50">
                                                            <Trash2 size={13} aria-hidden="true" /> Delete
                                                        </RowTool>
                                                    </>
                                                )}
                                                toolsIndent="sm:pl-2"
                                            >
                                                {!isExpanded && isCollapsible && (
                                                    <p
                                                        className="mt-1 line-clamp-1 text-xs text-stone-500"
                                                        dangerouslySetInnerHTML={{ __html: item.content.replace(/<[^>]*>?/gm, ' ') }} // Strip HTML for one-line preview
                                                    />
                                                )}
                                            </Row>

                                            {/* Short items have nothing to expand: show them in full. */}
                                            {(isExpanded || (!isCollapsible && item.content)) && (
                                                <motion.div {...revealMotion} className="px-1.5 pb-5 pt-2 sm:px-2">
                                                    <div
                                                        className="news-content max-w-prose"
                                                        dangerouslySetInnerHTML={{ __html: item.content }}
                                                    />
                                                </motion.div>
                                            )}
                                        </div>
                                    )
                                })}
                            </RowList>
                        </section>
                    ))}
                </Card>
            )}

            {showAddModal && (
                <AddSSKNewsModal
                    initialData={editingItem}
                    onClose={() => {
                        setShowAddModal(false)
                        setEditingItem(null)
                        loadNews()
                    }}
                />
            )}
        </div>
    )
}

export default SSKNewsView
