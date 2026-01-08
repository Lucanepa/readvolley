import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, Search, Type } from 'lucide-react'
import { api } from './services/api'
import { theme } from './styles/theme'

function DefinitionsView({ environment }) {
    const [definitions, setDefinitions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const isBeach = environment === 'beach'
    const color = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary
    const accentBorder = isBeach ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'

    useEffect(() => {
        loadDefinitions()
    }, [environment])

    const loadDefinitions = async () => {
        setLoading(true)
        try {
            const data = await api.getDefinitions(environment)
            const sorted = [...data].sort((a, b) => a.term.localeCompare(b.term))
            setDefinitions(sorted)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const filteredDefinitions = definitions.filter(d =>
        d.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.definition.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1.5rem',
            color: theme.colors.text.muted,
            gap: '1.5rem'
        }}>
            <div style={{
                width: '3rem',
                height: '3rem',
                border: '0.25rem solid ' + accentBorder,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Indexing Definitions...</p>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', paddingBottom: '1rem', width: '100%' }}>
            <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto', marginBottom: '0.5rem' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '99rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '0.75rem',
                    fontSize: '0.65rem',
                    fontWeight: '900',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: color
                }}>
                    <Info size={14} /> Official Terminology
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.025em', fontFamily: 'Outfit, sans-serif' }}>
                    Rules <span style={{ color: color }}>Glossary</span>
                </h1>
                <p style={{ fontSize: '1.1rem', color: theme.colors.text.secondary, fontWeight: '500', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                    A comprehensive guide to all official {environment} volleyball terms.
                </p>
            </div>

            <div style={{ maxWidth: '48rem', margin: '0 auto', width: '100%', marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '1.25rem', display: 'flex', alignItems: 'center', pointerEvents: 'none', height: '100%' }}>
                    <Search style={{ width: '1.25rem', height: '1.25rem', color: theme.colors.text.muted }} />
                </div>
                <input
                    type="text"
                    placeholder="Search for terms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '1.75rem',
                        padding: '0.8rem 1.5rem',
                        paddingLeft: '3.5rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        outline: 'none',
                        transition: 'all 0.3s',
                        boxShadow: '0 1.5rem 3rem -0.75rem rgba(0, 0, 0, 0.5)',
                        color: theme.colors.text.primary
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = color + '80'
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    }}
                />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '0.75rem',
                maxWidth: '60rem',
                margin: '0 auto',
                width: '100%'
            }}>
                {filteredDefinitions.map((def, index) => (
                    <motion.div
                        key={def.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        style={{
                            ...theme.styles.glass,
                            padding: '1.5rem',
                            borderRadius: '1.5rem',
                            border: '0.0625rem solid rgba(255, 255, 255, 0.05)',
                            transition: 'all 0.5s ease',
                            boxShadow: '0 0.625rem 0.9375rem -0.1875rem rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'}
                    >
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '1.25rem' }}>
                            <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                flexShrink: 0,
                                borderRadius: '0.75rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: color,
                                border: '0.0625rem solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <Type size={20} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                                    {def.term}
                                </h3>
                                <p style={{ fontSize: '1rem', color: theme.colors.text.secondary, lineHeight: '1.5', fontWeight: '500' }}>
                                    {def.definition}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredDefinitions.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem 1.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '2rem',
                        border: '0.0625rem dashed rgba(255, 255, 255, 0.1)'
                    }}>
                        <p style={{ color: theme.colors.text.muted, fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.8rem' }}>No matching definitions found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DefinitionsView
