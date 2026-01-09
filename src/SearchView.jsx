import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Filter, Book, AlertCircle, Info, ShieldCheck, Image as ImageIcon, List, ChevronRight } from 'lucide-react'
import { api } from './services/api'
import { theme } from './styles/theme'

function SearchView({ onClose, initialEnvironment }) {
    const [allData, setAllData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Filters
    const [envFilter, setEnvFilter] = useState(initialEnvironment || 'indoor') // 'indoor' | 'beach'
    const [category, setCategory] = useState('all')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await api.getAllSearchData()
            setAllData(data)
        } catch (e) {
            console.error("Failed to load search data:", e)
        } finally {
            setLoading(false)
        }
    }

    const filteredResults = useMemo(() => {
        if (!allData || !searchTerm.trim()) return []

        const searchLower = searchTerm.toLowerCase()
        const results = []

        // 1. Rules (Rulebook)
        if (category === 'all' || category === 'rulebook') {
            allData.rules.forEach(rule => {
                if (rule.rules_type === envFilter) {
                    const titleMatch = rule.title?.toLowerCase().includes(searchLower)
                    const textMatch = rule.text?.toLowerCase().includes(searchLower)
                    const nMatch = rule.rule_n?.toLowerCase().includes(searchLower)

                    if (titleMatch || textMatch || nMatch) {
                        results.push({
                            type: 'rulebook',
                            id: `rule-${rule.id}`,
                            title: `Rule ${rule.rule_n}: ${rule.title}`,
                            content: rule.text,
                            raw: rule
                        })
                    }
                }
            })
        }

        // 2. Casebook
        if (category === 'all' || category === 'casebook') {
            // Find rules for current environment
            const envRules = new Set(allData.rules.filter(r => r.rules_type === envFilter).map(r => r.id))
            // Find case IDs linked to these rules
            const envCaseIds = new Set(allData.casebookRules.filter(cr => envRules.has(cr.rule_id)).map(cr => cr.casebook_id))

            allData.cases.forEach(c => {
                if (envCaseIds.has(c.id)) {
                    const textMatch = c.case_text?.toLowerCase().includes(searchLower)
                    const rulingMatch = c.case_ruling?.toLowerCase().includes(searchLower)
                    const nMatch = c.case_number?.toString().includes(searchLower)

                    if (textMatch || rulingMatch || nMatch) {
                        results.push({
                            type: 'casebook',
                            id: `case-${c.id}`,
                            title: `Case ${c.case_number}`,
                            content: c.case_text,
                            subContent: c.case_ruling,
                            raw: c
                        })
                    }
                }
            })
        }

        // 3. Guidelines
        if (category === 'all' || category === 'guidelines') {
            // Check definitions (legacy guidelines)
            allData.definitions.forEach(def => {
                if (def.rules_type === envFilter) {
                    const termMatch = def.term?.toLowerCase().includes(searchLower)
                    const defMatch = def.definition?.toLowerCase().includes(searchLower)

                    if (termMatch || defMatch) {
                        results.push({
                            type: 'guidelines',
                            id: `def-${def.id}`,
                            title: def.term,
                            content: def.definition,
                            raw: def
                        })
                    }
                }
            })

            // Check new guidelines table
            allData.guidelines.forEach(gl => {
                if (gl.rules_type === envFilter) {
                    const titleMatch = gl.title?.toLowerCase().includes(searchLower)
                    const textMatch = gl.text?.toLowerCase().includes(searchLower)
                    const notesMatch = gl.notes?.toLowerCase().includes(searchLower)

                    if (titleMatch || textMatch || notesMatch) {
                        results.push({
                            type: 'guidelines',
                            id: `gl-${gl.id}`,
                            title: gl.title || 'Guideline',
                            content: gl.text,
                            subContent: gl.notes,
                            raw: gl
                        })
                    }
                }
            })
        }

        // 4. Protocols
        if (category === 'all' || category === 'protocol') {
            allData.gameProtocols.forEach(p => {
                if (p.rules_type === envFilter) {
                    const titleMatch = p.title?.toLowerCase().includes(searchLower)
                    const textMatch = p.protocolText?.toLowerCase().includes(searchLower)

                    if (titleMatch || textMatch) {
                        results.push({
                            type: 'protocol',
                            id: `gp-${p.id}`,
                            title: p.title,
                            content: p.protocolText,
                            raw: p
                        })
                    }
                }
            })
            allData.otherProtocols.forEach(p => {
                if (p.protocol_filter === envFilter) {
                    const titleMatch = p.title?.toLowerCase().includes(searchLower)
                    const textMatch = p.protocolText?.toLowerCase().includes(searchLower)

                    if (titleMatch || textMatch) {
                        results.push({
                            type: 'protocol',
                            id: `op-${p.id}`,
                            title: p.title,
                            content: p.protocolText,
                            raw: p
                        })
                    }
                }
            })
        }

        // 5. Diagrams
        if (category === 'all' || category === 'diagrams') {
            allData.diagrams.forEach(d => {
                if (d.rules_type === envFilter) {
                    const titleMatch = d.diagram_name?.toLowerCase().includes(searchLower)
                    const nMatch = d.diagram_n?.toLowerCase().includes(searchLower)

                    if (titleMatch || nMatch) {
                        results.push({
                            type: 'diagrams',
                            id: `diag-${d.id}`,
                            title: `Diagram ${d.diagram_n}: ${d.diagram_name}`,
                            content: '',
                            raw: d
                        })
                    }
                }
            })
        }

        // 6. Gestures (Hand Signals)
        if (category === 'all' || category === 'gestures') {
            allData.gestures.forEach(g => {
                if (g.rules_type === envFilter) {
                    const titleMatch = g.gesture_name?.toLowerCase().includes(searchLower)
                    const nMatch = g.gesture_n?.toLowerCase().includes(searchLower)

                    if (titleMatch || nMatch) {
                        results.push({
                            type: 'gestures',
                            id: `gest-${g.id}`,
                            title: `Signal ${g.gesture_n}: ${g.gesture_name}`,
                            content: '',
                            raw: g
                        })
                    }
                }
            })
        }

        return results
    }, [allData, searchTerm, envFilter, category])

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: theme.colors.bg.dark,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '2rem'
        }}>
            {/* Header / Search Bar Area */}
            <div style={{
                width: '100%',
                maxWidth: '60rem',
                padding: '0 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{
                            position: 'absolute',
                            left: '1.25rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: theme.colors.text.muted,
                            width: '1.5rem',
                            height: '1.5rem'
                        }} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search everything..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '2rem',
                                padding: '1.25rem 1.5rem',
                                paddingLeft: '3.5rem',
                                fontSize: '1.25rem',
                                color: '#ffffff',
                                outline: 'none',
                                transition: 'all 0.3s',
                                boxShadow: '0 1rem 3rem -1rem rgba(0,0,0,0.5)'
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = (envFilter === 'beach' ? theme.colors.beach.primary : theme.colors.indoor.primary) + '80'}
                            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '1rem',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: theme.colors.text.muted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#ffffff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = theme.colors.text.muted }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2rem',
                    padding: '1.5rem',
                    ...theme.styles.glass,
                    borderRadius: '2rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {/* Env Filter */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.colors.text.muted }}>Environment</span>
                        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '1rem' }}>
                            {['indoor', 'beach'].map(env => (
                                <button
                                    key={env}
                                    onClick={() => setEnvFilter(env)}
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.8rem',
                                        fontWeight: '800',
                                        textTransform: 'uppercase',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        backgroundColor: envFilter === env ? (env === 'beach' ? theme.colors.beach.primary : theme.colors.indoor.primary) : 'transparent',
                                        color: envFilter === env ? '#ffffff' : theme.colors.text.muted,
                                        border: 'none'
                                    }}
                                >
                                    {env}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.colors.text.muted }}>Categories</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {[
                                { id: 'all', label: 'All', icon: <Search size={14} /> },
                                { id: 'rulebook', label: 'Rulebook', icon: <Book size={14} /> },
                                { id: 'casebook', label: 'Casebook', icon: <AlertCircle size={14} /> },
                                { id: 'guidelines', label: 'Guidelines', icon: <Info size={14} /> },
                                { id: 'protocol', label: 'Protocol', icon: <ShieldCheck size={14} /> },
                                { id: 'diagrams', label: 'Diagrams', icon: <ImageIcon size={14} /> },
                                { id: 'gestures', label: 'Signals', icon: <List size={14} /> }
                            ].map(cat => {
                                const active = category === cat.id
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.8rem',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                                            color: active ? '#ffffff' : theme.colors.text.muted,
                                            border: '1px solid',
                                            borderColor: active ? 'rgba(255,255,255,0.2)' : 'transparent'
                                        }}
                                    >
                                        {cat.icon}
                                        {cat.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <div style={{
                flex: 1,
                width: '100%',
                maxWidth: '60rem',
                padding: '2rem 1.5rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '4rem' }}>
                        <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.5 }}>Preparing your search...</span>
                    </div>
                ) : searchTerm.trim() === '' ? (
                    <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.3 }}>
                        <Search size={48} style={{ marginBottom: '1rem' }} />
                        <p style={{ fontWeight: '700', letterSpacing: '0.05em' }}>Start typing to search all rules and documents</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.5 }}>
                        <p style={{ fontSize: '1.25rem', fontWeight: '800' }}>No matches found for "{searchTerm}"</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try adjusting your filters or search terms</p>
                    </div>
                ) : (
                    filteredResults.map((res, index) => (
                        <SearchResultCard key={res.id} result={res} index={index} envFilter={envFilter} />
                    ))
                )}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

function SearchResultCard({ result, index, envFilter }) {
    const isBeach = envFilter === 'beach'
    const color = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary

    const getIcon = (type) => {
        switch (type) {
            case 'rulebook': return <Book size={18} />
            case 'casebook': return <AlertCircle size={18} />
            case 'guidelines': return <Info size={18} />
            case 'protocol': return <ShieldCheck size={18} />
            case 'diagrams': return <ImageIcon size={18} />
            case 'gestures': return <List size={18} />
            default: return <ChevronRight size={18} />
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.05, 0.5) }}
            style={{
                ...theme.styles.glass,
                padding: '1.5rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.8)' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ color: color }}>{getIcon(result.type)}</div>
                <span style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase', color: color }}>{result.type}</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{result.title}</h3>
            <p style={{ fontSize: '0.95rem', color: theme.colors.text.secondary, lineHeight: '1.5', fontWeight: '500' }}>
                {result.content}
            </p>
            {result.subContent && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderLeft: `2px solid ${color}` }}>
                    <p style={{ fontSize: '0.9rem', color: theme.colors.text.primary, fontWeight: '600', fontStyle: 'italic' }}>
                        {result.subContent}
                    </p>
                </div>
            )}
        </motion.div>
    )
}

export default SearchView
