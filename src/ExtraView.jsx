import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from './styles/theme'
import { api } from './services/api'
import { Plus, ExternalLink, Calendar, ChevronRight, Pencil, Trash2, ChevronDown, ChevronUp, Filter, Tag, CalendarClock, X } from 'lucide-react'
import AddExtraView from './AddExtraView'

function ExtraView({ environment, user, onLogin }) { // Props explicitly destructured
    const [extras, setExtras] = useState([])
    const [filteredExtras, setFilteredExtras] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingExtra, setEditingExtra] = useState(null) // State for the item being edited
    const [expandedItems, setExpandedItems] = useState({}) // State for read more toggles: { id: boolean }

    // Filter State
    const [selectedSeason, setSelectedSeason] = useState('All')
    const [selectedTags, setSelectedTags] = useState([])
    const [showFilters, setShowFilters] = useState(false)

    const isBeach = environment === 'beach'
    const color = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary

    useEffect(() => {
        loadExtras()
    }, [environment])

    useEffect(() => {
        applyFilters()
    }, [extras, selectedSeason, selectedTags])

    const loadExtras = async () => {
        try {
            setIsLoading(true)
            const data = await api.getExtras(environment)
            setExtras(data || [])
        } catch (error) {
            console.error('Error loading extras:', error)
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

    const deleteExtra = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) return
        try {
            await api.deleteExtra(id)
            setExtras(prev => prev.filter(item => item.id !== id))
        } catch (error) {
            alert('Error deleting item: ' + error.message)
        }
    }

    const toggleReadMore = (id) => {
        setExpandedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // Derived Data for Filter Options
    const distinctSeasons = ['All', ...new Set(extras.map(e => e.season).filter(Boolean))].sort().reverse() // Newest first
    const distinctTags = [...new Set(extras.flatMap(e => e.tags || []))].sort()

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                maxWidth: theme.styles.container.maxWidth,
                margin: '0 auto',
                width: '100%',
                paddingTop: '2rem',
                paddingBottom: '6rem'
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.025em', fontFamily: 'Outfit, sans-serif' }}>
                    Extra <span style={{ color: color }}>Resources</span>
                </h1>
                <p style={{ color: theme.colors.text.secondary }}>Additional materials and tools</p>
            </div>

            {/* Filter Toggle Button (Mobile/Desktop) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '2rem',
                        backgroundColor: showFilters ? color : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${showFilters ? color : 'rgba(255,255,255,0.1)'}`,
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                >
                    <Filter size={18} /> Filters {(selectedTags.length > 0 || selectedSeason !== 'All') && <span style={{ backgroundColor: 'white', color: 'black', borderRadius: '50%', width: '1.2em', height: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em' }}>{selectedTags.length + (selectedSeason !== 'All' ? 1 : 0)}</span>}
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
                        <div style={{
                            ...theme.styles.glass,
                            padding: '1.5rem',
                            borderRadius: '1.5rem',
                            marginBottom: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            {/* Season Filter */}
                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.colors.text.secondary, marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <CalendarClock size={16} /> Season
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {distinctSeasons.map(season => (
                                        <button
                                            key={season}
                                            onClick={() => setSelectedSeason(season)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.5rem',
                                                border: '1px solid',
                                                borderColor: selectedSeason === season ? color : 'rgba(255,255,255,0.1)',
                                                backgroundColor: selectedSeason === season ? `${color}22` : 'transparent',
                                                color: selectedSeason === season ? color : theme.colors.text.secondary,
                                                cursor: 'pointer',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {season}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tags Filter */}
                            {distinctTags.length > 0 && (
                                <div>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.colors.text.secondary, marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <Tag size={16} /> Tags
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {distinctTags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '2rem',
                                                    border: '1px solid',
                                                    borderColor: selectedTags.includes(tag) ? color : 'rgba(255,255,255,0.1)',
                                                    backgroundColor: selectedTags.includes(tag) ? color : 'transparent',
                                                    color: selectedTags.includes(tag) ? 'white' : theme.colors.text.secondary,
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clear Filters */}
                            {(selectedSeason !== 'All' || selectedTags.length > 0) && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => { setSelectedSeason('All'); setSelectedTags([]); }}
                                        style={{ background: 'none', border: 'none', color: theme.colors.text.secondary, fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: theme.colors.text.secondary }}>
                    Loading...
                </div>
            ) : filteredExtras.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 1.5rem',
                    ...theme.styles.glass,
                    borderRadius: '2rem',
                    border: '0.0625rem dashed rgba(255, 255, 255, 0.1)'
                }}>
                    <p style={{ color: theme.colors.text.muted, fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                        {extras.length === 0 ? 'No content yet' : 'No matches found'}
                    </p>
                    {extras.length > 0 && <button onClick={() => { setSelectedSeason('All'); setSelectedTags([]); }} style={{ marginTop: '1rem', background: 'none', border: 'none', color: color, textDecoration: 'underline', cursor: 'pointer' }}>Clear filters</button>}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {filteredExtras.map((item, index) => {
                        const isExpanded = expandedItems[item.id]
                        // Simple heuristic: If content is long/HTML, we might want to collapse it initially
                        // For now, let's always collapsible if it's a post
                        const isCollapsible = item.type === 'post' && item.content && item.content.length > 300

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{
                                    ...theme.styles.glass,
                                    borderRadius: '1.5rem',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative' // For absolute positioning of edit buttons
                                }}
                            >
                                {/* Admin Actions */}
                                {user && (
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                                        <button
                                            onClick={() => {
                                                setEditingExtra(item) // Set item to edit
                                                setShowAddModal(true)
                                            }}
                                            style={{
                                                padding: '0.5rem',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: 'white',
                                                cursor: 'pointer'
                                            }}
                                            title="Edit"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => deleteExtra(item.id)}
                                            style={{
                                                padding: '0.5rem',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(220, 38, 38, 0.8)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: 'white',
                                                cursor: 'pointer'
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}

                                {/* Image Header */}
                                {item.image_path && (
                                    <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                                        <img
                                            src={`/extra_images/${item.image_path}`}
                                            alt={item.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                                    </div>
                                )}

                                <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    {/* Meta: Type • Date */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                                        <span style={{
                                            color: color,
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {item.type}
                                        </span>
                                        <span>•</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Calendar size={12} /> {formatDate(item.created_at)}
                                        </span>
                                    </div>

                                    {/* Meta: Season & Tags */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                        {item.season && (
                                            <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: theme.colors.text.secondary }}>
                                                {item.season}
                                            </span>
                                        )}
                                        {item.tags?.slice().sort().map(tag => (
                                            <span key={tag} style={{ fontSize: '0.7rem', backgroundColor: `${color}33`, padding: '2px 8px', borderRadius: '10px', color: color }}>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: 1.2 }}>
                                        {item.title}
                                    </h3>

                                    {item.content && (
                                        <div style={{
                                            flex: 1,
                                            marginBottom: '1.5rem',
                                            position: 'relative'
                                        }}>
                                            <div
                                                className="rich-text-content"
                                                style={{
                                                    color: theme.colors.text.secondary,
                                                    fontSize: '0.95rem',
                                                    lineHeight: 1.7,
                                                    textAlign: 'justify', // Justify text
                                                    overflow: 'hidden',
                                                    maxHeight: isExpanded || !isCollapsible ? 'none' : '150px', // Truncate
                                                    maskImage: isExpanded || !isCollapsible ? 'none' : 'linear-gradient(to bottom, black 50%, transparent 100%)',
                                                    transition: 'max-height 0.3s ease'
                                                }}
                                                dangerouslySetInnerHTML={{ __html: item.content }}
                                            />

                                            {isCollapsible && (
                                                <button
                                                    onClick={() => toggleReadMore(item.id)}
                                                    style={{
                                                        marginTop: '0.5rem',
                                                        background: 'none',
                                                        border: 'none',
                                                        color: color,
                                                        fontSize: '0.85rem',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        padding: 0
                                                    }}
                                                >
                                                    {isExpanded ? (
                                                        <>Show Less <ChevronUp size={14} /></>
                                                    ) : (
                                                        <>Read More <ChevronDown size={14} /></>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {item.link_url && (
                                        <a
                                            href={item.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: color,
                                                textDecoration: 'none',
                                                fontWeight: 'bold',
                                                marginTop: 'auto',
                                                paddingTop: '1rem',
                                                borderTop: '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            Open Link <ExternalLink size={16} />
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Floating Add Button */}
            {user && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        setEditingExtra(null) // Reset editing state for new item
                        setShowAddModal(true)
                    }}
                    style={{
                        position: 'fixed',
                        bottom: '5rem',
                        right: '2rem',
                        width: '3.5rem',
                        height: '3.5rem',
                        borderRadius: '50%',
                        backgroundColor: color,
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        zIndex: 100
                    }}
                >
                    <Plus size={24} strokeWidth={3} />
                </motion.button>
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
        </motion.div>
    )
}

export default ExtraView
