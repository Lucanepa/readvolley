import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, Maximize2, X } from 'lucide-react'
import { api } from './services/api'
import { theme } from './styles/theme'

function DiagramsView({ environment }) {
    const [diagrams, setDiagrams] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDiagram, setSelectedDiagram] = useState(null)

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
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.025em', fontFamily: 'Outfit, sans-serif' }}>
                    Official <span style={{ color: color }}>Diagrams</span>
                </h1>
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
                        <div
                            onClick={() => setSelectedDiagram(diagram)}
                            style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.4)', padding: '0.75rem', cursor: 'zoom-in' }}
                        >
                            <img
                                src={diagram.url}
                                alt={diagram.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.7s ease' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                            >
                                <Maximize2 color="white" size={32} />
                            </div>
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
                                    DIAGRAM {diagram.diagram_n}
                                </span>
                            </div>
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' }}>
                                {diagram.diagram_name}
                            </h3>
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

            <AnimatePresence>
                {selectedDiagram && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedDiagram(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 1000,
                            backgroundColor: 'rgba(0,0,0,0.95)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem',
                            cursor: 'zoom-out',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                position: 'absolute',
                                top: '2rem',
                                right: '2rem',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={32} />
                        </motion.button>

                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedDiagram.url}
                            alt={selectedDiagram.diagram_name}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                borderRadius: '1rem',
                                boxShadow: '0 2rem 4rem rgba(0,0,0,0.5)'
                            }}
                        />

                        <div style={{
                            position: 'absolute',
                            bottom: '2rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            textAlign: 'center',
                            width: '100%',
                            padding: '0 2rem'
                        }}>
                            <h2 style={{
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                marginBottom: '0.5rem',
                                letterSpacing: '-0.02em'
                            }}>
                                {selectedDiagram.diagram_name}
                            </h2>
                            <span style={{
                                color: color,
                                fontWeight: '900',
                                fontSize: '0.75rem',
                                letterSpacing: '0.1em'
                            }}>
                                DIAGRAM {selectedDiagram.diagram_n}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default DiagramsView
