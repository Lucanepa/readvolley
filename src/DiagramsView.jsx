import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Maximize2 } from 'lucide-react'
import { api } from './services/api'
import { theme } from './styles/theme'

function DiagramsView({ environment }) {
    const [diagrams, setDiagrams] = useState([])
    const [loading, setLoading] = useState(true)

    const isBeach = environment === 'beach'
    const color = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary
    const accentBorder = isBeach ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'

    useEffect(() => {
        loadDiagrams()
    }, [environment])

    const loadDiagrams = async () => {
        setLoading(true)
        try {
            const data = await api.getDiagrams(environment)
            setDiagrams(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1rem',
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
            <p style={{ fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Loading Visual Assets...</p>
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
                    <ImageIcon size={14} /> Visual Reference
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.025em', fontFamily: 'Outfit, sans-serif' }}>
                    Official <span style={{ color: color }}>Diagrams</span>
                </h1>
                <p style={{ fontSize: '1.1rem', color: theme.colors.text.secondary, fontWeight: '500', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                    Detailed court dimensions, equipment specifications, and field layouts.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
                gap: '1.25rem',
                width: '100%',
                maxWidth: theme.styles.container.maxWidth,
                margin: '0 auto'
            }}>
                {diagrams.map((diagram, index) => (
                    <motion.div
                        key={diagram.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                            ...theme.styles.glass,
                            borderRadius: '2rem',
                            overflow: 'hidden',
                            border: '0.0625rem solid rgba(255, 255, 255, 0.05)',
                            transition: 'all 0.5s ease',
                            boxShadow: '0 1.5rem 3rem -0.75rem rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.4)', padding: '0.75rem' }}>
                            <img
                                src={diagram.url}
                                alt={diagram.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.7s ease' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
                                <span style={{
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '0.625rem',
                                    ...theme.styles.glass,
                                    border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
                                    fontWeight: '900',
                                    fontSize: '0.75rem',
                                    color: color
                                }}>
                                    DIAGRAM {diagram.n}
                                </span>
                            </div>
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                                {diagram.name}
                            </h3>
                            <p style={{ color: theme.colors.text.secondary, fontWeight: '500', opacity: 0.6, fontSize: '0.8rem' }}>
                                Official scale reference for {environment} volleyball standards.
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {diagrams.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 1rem',
                    ...theme.styles.glass,
                    borderRadius: '2rem',
                    border: '0.0625rem dashed rgba(255, 255, 255, 0.1)'
                }}>
                    <p style={{ color: theme.colors.text.muted, fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.8rem' }}>No diagrams available for this environment yet.</p>
                </div>
            )}
        </div>
    )
}

export default DiagramsView
