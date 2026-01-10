import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from './styles/theme'
import { api } from './services/api'
import {
    Plus, ExternalLink, Calendar, ChevronRight, Pencil, Trash2,
    Filter, Tag, CalendarClock, Play, FileText, Image as ImageIcon,
    PlaySquare, Download, Share2
} from 'lucide-react'
import AddExtraView from './AddExtraView'

export function MultimediaView({ user, onLogin }) {
    const [mediaItems, setMediaItems] = useState([])
    const [filteredItems, setFilteredItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    // Filter State
    const [selectedSeason, setSelectedSeason] = useState('All')
    const [selectedType, setSelectedType] = useState('All')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        loadMedia()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [mediaItems, selectedSeason, selectedType])

    const loadMedia = async () => {
        try {
            setIsLoading(true)
            const data = await api.getExtras('multimedia')
            setMediaItems(data || [])
        } catch (error) {
            console.error('Error loading multimedia:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const applyFilters = () => {
        let result = mediaItems

        if (selectedSeason !== 'All') {
            result = result.filter(item => item.season === selectedSeason)
        }

        if (selectedType !== 'All') {
            result = result.filter(item => item.type === selectedType)
        }

        setFilteredItems(result)
    }

    const handleDelete = async (e, id) => {
        e.stopPropagation()
        if (!window.confirm('Are you sure you want to delete this item?')) return
        try {
            await api.deleteExtra(id)
            loadMedia()
        } catch (error) {
            console.error('Error deleting:', error)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('de-CH', {
            year: 'numeric', month: 'numeric', day: 'numeric'
        })
    }

    const getIcon = (type) => {
        switch (type) {
            case 'video': return <PlaySquare size={20} />
            case 'pdf': return <FileText size={20} />
            case 'image': return <ImageIcon size={20} />
            default: return <FileText size={20} />
        }
    }

    const distinctSeasons = ['All', ...new Set(mediaItems.map(n => n.season).filter(Boolean))].sort().reverse()
    const types = ['All', 'video', 'image', 'pdf']

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                padding: '2rem'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
                        Multimedia <span style={{ color: '#3b82f6' }}>Gallery</span>
                    </h1>
                    <p style={{ color: theme.colors.text.secondary }}>Official Swiss Volley presentations and media resources</p>
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '2rem',
                        backgroundColor: showFilters ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    <Filter size={18} /> Filters
                </button>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ ...theme.styles.glass, padding: '1.5rem', borderRadius: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <h4 style={{ color: theme.colors.text.secondary, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Season</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {distinctSeasons.map(s => (
                                        <button key={s} onClick={() => setSelectedSeason(s)} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid', borderColor: selectedSeason === s ? '#3b82f6' : 'rgba(255,255,255,0.1)', backgroundColor: selectedSeason === s ? '#3b82f622' : 'transparent', color: selectedSeason === s ? '#3b82f6' : theme.colors.text.secondary, cursor: 'pointer' }}>{s}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ color: theme.colors.text.secondary, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Type</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {types.map(t => (
                                        <button key={t} onClick={() => setSelectedType(t)} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid', borderColor: selectedType === t ? '#3b82f6' : 'rgba(255,255,255,0.1)', backgroundColor: selectedType === t ? '#3b82f622' : 'transparent', color: selectedType === t ? '#3b82f6' : theme.colors.text.secondary, cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Loading media...</div>
            ) : filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', ...theme.styles.glass, borderRadius: '2rem' }}>
                    <p style={{ color: theme.colors.text.muted }}>No media found.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem',
                    paddingBottom: '4rem'
                }}>
                    {filteredItems.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{
                                ...theme.styles.glass,
                                borderRadius: '1.5rem',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                transition: 'transform 0.3s ease',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {/* Thumbnail/Preview */}
                            <div style={{ height: '200px', backgroundColor: 'rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                                {item.image_path ? (
                                    <img
                                        src={`/multimedia/${item.image_path}`}
                                        alt={item.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f688' }}>
                                        {item.type === 'video' ? <Play size={64} /> : <FileText size={64} />}
                                    </div>
                                )}

                                {item.type === 'video' && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>
                                            <Play size={24} fill="currentColor" />
                                        </div>
                                    </div>
                                )}

                                <div style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.4rem 0.8rem', borderRadius: '2rem', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    {getIcon(item.type)} <span style={{ textTransform: 'uppercase' }}>{item.type}</span>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', lineHeight: 1.2 }}>{item.title}</h3>
                                    {user && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => { setEditingItem(item); setShowAddModal(true); }} style={{ padding: '0.4rem', background: 'none', border: 'none', color: theme.colors.text.muted, cursor: 'pointer' }}><Pencil size={14} /></button>
                                            <button onClick={(e) => handleDelete(e, item.id)} style={{ padding: '0.4rem', background: 'none', border: 'none', color: '#ef444488', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                        </div>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: theme.colors.text.secondary, marginBottom: '1.5rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.content?.replace(/<[^>]*>?/gm, ' ') || 'No description available.'}
                                </p>

                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: theme.colors.text.muted }}>{formatDate(item.created_at)}</span>
                                    <a
                                        href={item.link_url?.startsWith('http') ? item.link_url : `/multimedia/${item.link_url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            padding: '0.6rem 1.2rem',
                                            borderRadius: '0.75rem',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            textDecoration: 'none',
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {item.type === 'video' ? 'Watch Now' : item.type === 'pdf' ? 'Open PDF' : 'View'}
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {user && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setEditingItem(null); setShowAddModal(true); }}
                    style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', border: 'none', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 100 }}
                >
                    <Plus size={32} />
                </motion.button>
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
        </motion.div>
    )
}
