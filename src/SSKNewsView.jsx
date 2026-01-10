
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Plus, Trash2, Pencil, Filter, Tag, CalendarClock, ChevronDown, ChevronUp } from 'lucide-react'
import { theme } from './styles/theme'
import { api } from './services/api'
import AddSSKNewsModal from './components/AddSSKNewsModal'

function SSKNewsView({ onClose, user, onLogin }) {
    const [news, setNews] = useState([])
    const [filteredNews, setFilteredNews] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [expandedId, setExpandedId] = useState(null)

    // Filter State
    const [selectedSeason, setSelectedSeason] = useState('All')
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedAuthor, setSelectedAuthor] = useState('All')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        loadNews()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [news, selectedSeason, selectedTags, selectedAuthor])

    const loadNews = async () => {
        setIsLoading(true)
        try {
            const data = await api.getExtras('ssk')
            setNews(data || [])
        } catch (error) {
            console.error('Error loading SSK news:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const applyFilters = () => {
        let result = news

        if (selectedSeason !== 'All') {
            result = result.filter(item => item.season === selectedSeason)
        }

        if (selectedAuthor !== 'All') {
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('de-CH', {
            year: 'numeric', month: 'numeric', day: 'numeric'
        })
    }

    const toggleReadMore = (id) => {
        setExpandedId(prev => prev === id ? null : id)
    }

    const handleDelete = async (e, id) => {
        e.stopPropagation()
        if (!window.confirm('Are you sure you want to delete this news item?')) return
        try {
            await api.deleteExtra(id)
            loadNews()
        } catch (error) {
            console.error('Error deleting:', error)
        }
    }

    const handleEdit = (e, item) => {
        e.stopPropagation()
        setEditingItem(item)
        setShowAddModal(true)
    }

    // Derived Data for Filter Options
    const distinctSeasons = ['All', ...new Set(news.map(n => n.season).filter(Boolean))].sort().reverse()
    const distinctAuthors = ['All', ...new Set(news.map(n => n.ssk_name).filter(Boolean))].sort()
    const distinctTags = [...new Set(news.flatMap(n => n.tags || []))].sort()

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }

    return (
        <div style={{ flex: 1, width: '100%', height: '100%', backgroundColor: theme.colors.bg.dark, overflowY: 'auto', padding: '2rem 1.5rem', position: 'relative' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '5rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem', textAlign: 'center', letterSpacing: '-0.025em' }}>
                    SSK <span style={{ color: '#ef4444' }}>News</span>
                </h2>

                {!user && (
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <button onClick={onLogin} style={{ background: 'none', border: 'none', color: theme.colors.text.secondary, fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer', opacity: 0.7 }}>
                            Log in to manage news
                        </button>
                    </div>
                )}

                {/* Filter Toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '2rem',
                            backgroundColor: showFilters ? '#ef4444' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${showFilters ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Filter size={18} /> Filters {(selectedTags.length > 0 || selectedSeason !== 'All' || selectedAuthor !== 'All') && <span style={{ backgroundColor: 'white', color: 'black', borderRadius: '50%', width: '1.2em', height: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em' }}>{selectedTags.length + (selectedSeason !== 'All' ? 1 : 0) + (selectedAuthor !== 'All' ? 1 : 0)}</span>}
                    </button>
                </div>

                {/* Filters Section */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ ...theme.styles.glass, padding: '1.5rem', borderRadius: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    {/* Season Filter */}
                                    <div>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.colors.text.secondary, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                                            <CalendarClock size={16} /> Season
                                        </h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {distinctSeasons.map(season => (
                                                <button key={season} onClick={() => setSelectedSeason(season)} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid', borderColor: selectedSeason === season ? '#ef4444' : 'rgba(255,255,255,0.1)', backgroundColor: selectedSeason === season ? '#ef444422' : 'transparent', color: selectedSeason === season ? '#ef4444' : theme.colors.text.secondary, cursor: 'pointer', fontSize: '0.85rem' }}>{season}</button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Author Filter */}
                                    <div>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.colors.text.secondary, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                                            <Tag size={16} /> Author
                                        </h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {distinctAuthors.map(author => (
                                                <button key={author} onClick={() => setSelectedAuthor(author)} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid', borderColor: selectedAuthor === author ? '#ef4444' : 'rgba(255,255,255,0.1)', backgroundColor: selectedAuthor === author ? '#ef444422' : 'transparent', color: selectedAuthor === author ? '#ef4444' : theme.colors.text.secondary, cursor: 'pointer', fontSize: '0.85rem' }}>{author}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Tags Filter */}
                                {distinctTags.length > 0 && (
                                    <div>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.colors.text.secondary, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                                            <Tag size={16} /> Topics
                                        </h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {distinctTags.map(tag => (
                                                <button key={tag} onClick={() => toggleTag(tag)} style={{ padding: '0.4rem 0.8rem', borderRadius: '2rem', border: '1px solid', borderColor: selectedTags.includes(tag) ? '#ef4444' : 'rgba(255,255,255,0.1)', backgroundColor: selectedTags.includes(tag) ? '#ef4444' : 'transparent', color: selectedTags.includes(tag) ? 'white' : theme.colors.text.secondary, cursor: 'pointer', fontSize: '0.85rem' }}>{tag}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLoading ? (
                    <div style={{ textAlign: 'center', color: theme.colors.text.secondary }}>Loading news...</div>
                ) : filteredNews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', ...theme.styles.glass, borderRadius: '2rem' }}>
                        <p style={{ color: theme.colors.text.muted }}>No news found matching your filters.</p>
                        {(selectedSeason !== 'All' || selectedTags.length > 0 || selectedAuthor !== 'All') && (
                            <button onClick={() => { setSelectedSeason('All'); setSelectedTags([]); setSelectedAuthor('All'); }} style={{ marginTop: '1rem', color: '#ef4444', textDecoration: 'underline' }}>Clear all filters</button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {Object.entries(
                            filteredNews.reduce((acc, item) => {
                                const group = item.ssk_name || 'Anonymous'
                                if (!acc[group]) acc[group] = []
                                acc[group].push(item)
                                return acc
                            }, {})
                        ).map(([author, authorNews]) => (
                            <div key={author} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    <h2 style={{
                                        fontSize: '1.2rem',
                                        fontWeight: '900',
                                        color: '#ef4444',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {author}
                                    </h2>
                                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #ef444444, transparent)' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {authorNews.map((item, index) => {
                                        const isExpanded = expandedId === item.id
                                        const isCollapsible = item.content && item.content.length > 50
                                        return (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                style={{
                                                    ...theme.styles.glass,
                                                    padding: isExpanded ? '2rem' : '0.75rem 1.25rem',
                                                    borderRadius: '1.25rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    position: 'relative',
                                                    width: '100%'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '1rem' : '0' }}>
                                                    <h3
                                                        onClick={() => isCollapsible && !isExpanded && toggleReadMore(item.id)}
                                                        style={{
                                                            fontSize: isExpanded ? '1.5rem' : '1.1rem',
                                                            fontWeight: 'bold',
                                                            lineHeight: 1.2,
                                                            flex: 1,
                                                            cursor: (!isExpanded && isCollapsible) ? 'pointer' : 'default',
                                                            transition: 'font-size 0.3s ease'
                                                        }}
                                                    >
                                                        {item.title}
                                                    </h3>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        {!isExpanded && (
                                                            <span style={{ fontSize: '0.8rem', color: theme.colors.text.muted, whiteSpace: 'nowrap' }}>
                                                                {formatDate(item.created_at)}
                                                            </span>
                                                        )}
                                                        {user && (
                                                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                                <button onClick={(e) => handleEdit(e, item)} style={{ padding: '0.4rem', background: 'none', border: 'none', color: theme.colors.text.muted, cursor: 'pointer' }}><Pencil size={14} /></button>
                                                                <button onClick={(e) => handleDelete(e, item.id)} style={{ padding: '0.4rem', background: 'none', border: 'none', color: '#ef444488', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                            </div>
                                                        )}
                                                        {isCollapsible && (
                                                            <button
                                                                onClick={() => toggleReadMore(item.id)}
                                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem' }}
                                                            >
                                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <>
                                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                                            {item.season && <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: theme.colors.text.secondary }}>{item.season}</span>}
                                                            {item.tags?.map(tag => (
                                                                <span key={tag} style={{ fontSize: '0.7rem', backgroundColor: '#ef444415', padding: '2px 8px', borderRadius: '4px', color: '#ef4444' }}>{tag}</span>
                                                            ))}
                                                        </div>

                                                        <div
                                                            className="news-content"
                                                            style={{
                                                                fontSize: '1rem',
                                                                color: theme.colors.text.secondary,
                                                                lineHeight: 1.7,
                                                                textAlign: 'justify'
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                                        />

                                                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: theme.colors.text.muted }}>
                                                                <Calendar size={12} /> {formatDate(item.created_at)}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}

                                                {!isExpanded && isCollapsible && (
                                                    <div
                                                        className="news-content"
                                                        style={{
                                                            fontSize: '0.9rem',
                                                            color: theme.colors.text.muted,
                                                            lineHeight: 1.5,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 1,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            marginTop: '0.25rem'
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: item.content.replace(/<[^>]*>?/gm, ' ') }} // Strip HTML for one-line preview
                                                    />
                                                )}
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {user && (
                    <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setEditingItem(null); setShowAddModal(true); }} style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', border: 'none', boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 100 }}><Plus size={32} /></motion.button>
                )}
            </div>

            <AnimatePresence>
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
            </AnimatePresence>
        </div>
    )
}

export default SSKNewsView
