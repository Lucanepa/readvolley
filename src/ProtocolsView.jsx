import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Clock, ClipboardList, Zap } from 'lucide-react'
import { api } from './services/api'
import { theme } from './styles/theme'

function ProtocolsView({ environment }) {
    const [type, setType] = useState('game') // 'game' | 'other'
    const [protocols, setProtocols] = useState([])
    const [loading, setLoading] = useState(true)

    const isBeach = environment === 'beach'
    const color = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary
    const accentBg = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary
    const accentBorder = isBeach ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'

    useEffect(() => {
        loadProtocols()
    }, [environment, type])

    const loadProtocols = async () => {
        setLoading(true)
        try {
            const data = await api.getProtocols(environment)
            setProtocols(type === 'game' ? data.gameProtocol : data.otherProtocols)
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
            <p style={{ fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Loading Procedural Guides...</p>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', paddingBottom: '1rem', width: '100%' }}>
            <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.025em', fontFamily: 'Outfit, sans-serif' }}>
                    Official <span style={{ color: color }}>Protocols</span>
                </h1>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                    display: 'flex',
                    padding: '0.3rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '1.5rem',
                    border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
                    width: '100%',
                    maxWidth: '30rem',
                    boxShadow: '0 1.5rem 3rem -0.75rem rgba(0, 0, 0, 0.5)'
                }}>
                    <button
                        onClick={() => setType('game')}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 0',
                            borderRadius: '1.25rem',
                            fontWeight: '900',
                            fontSize: '0.85rem',
                            letterSpacing: '-0.01em',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            backgroundColor: type === 'game' ? accentBg : 'transparent',
                            color: type === 'game' ? '#ffffff' : theme.colors.text.secondary,
                            boxShadow: type === 'game' ? '0 0.5rem 1rem -0.2rem rgba(0, 0, 0, 0.1)' : 'none'
                        }}
                    >
                        <Clock size={16} /> Game
                    </button>
                    <button
                        onClick={() => setType('other')}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 0',
                            borderRadius: '1.25rem',
                            fontWeight: '900',
                            fontSize: '0.85rem',
                            letterSpacing: '-0.01em',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            backgroundColor: type === 'other' ? accentBg : 'transparent',
                            color: type === 'other' ? '#ffffff' : theme.colors.text.secondary,
                            boxShadow: type === 'other' ? '0 0.5rem 1rem -0.2rem rgba(0, 0, 0, 0.1)' : 'none'
                        }}
                    >
                        <Zap size={16} /> Others
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '0.75rem',
                        maxWidth: theme.styles.container.maxWidth,
                        margin: '0 auto',
                        width: '100%'
                    }}
                >
                    {type === 'game' ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            ...theme.styles.glass,
                            padding: '1.5rem',
                            borderRadius: '2rem',
                            border: '0.0625rem solid rgba(255, 255, 255, 0.05)',
                        }}>
                            {/* Header */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '8rem 2fr 1fr 1fr',
                                gap: '1rem',
                                padding: '0 1rem 1rem 1rem',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                marginBottom: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '900',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: theme.colors.text.muted
                            }}>
                                <div>Time to Start</div>
                                <div>Description</div>
                                <div>Referees</div>
                                <div>Teams</div>
                            </div>

                            {/* Rows */}
                            {protocols.map((protocol, index) => (
                                <div
                                    key={protocol.id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '8rem 2fr 1fr 1fr',
                                        gap: '1rem',
                                        padding: '1rem',
                                        borderRadius: '1rem',
                                        transition: 'background-color 0.2s',
                                        fontSize: '0.9rem',
                                        alignItems: 'start',
                                        borderBottom: index !== protocols.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ fontWeight: '800', color: color }}>
                                        {protocol.time_to_start || protocol.time || '-'}
                                    </div>
                                    <div style={{ color: theme.colors.text.primary, lineHeight: '1.5', textAlign: 'justify' }}>
                                        {protocol.description || protocol.title || '-'}
                                    </div>
                                    <div style={{ color: theme.colors.text.secondary, fontSize: '0.85rem', textAlign: 'justify' }}>
                                        {protocol.referees || '-'}
                                    </div>
                                    <div style={{ color: theme.colors.text.secondary, fontSize: '0.85rem', textAlign: 'justify' }}>
                                        {protocol.teams || '-'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        protocols.map((protocol, index) => (
                            <div
                                key={protocol.id}
                                style={{
                                    ...theme.styles.glass,
                                    padding: '1.5rem',
                                    borderRadius: '2rem',
                                    border: '0.0625rem solid rgba(255, 255, 255, 0.05)',
                                    transition: 'all 0.5s ease',
                                    boxShadow: '0 1.5rem 3rem -0.75rem rgba(0, 0, 0, 0.5)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'}
                            >
                                <div style={{ display: 'flex', flexDirection: 'row', gap: '1.25rem' }}>
                                    <div style={{
                                        flexShrink: 0,
                                        width: '3.5rem',
                                        height: '3.5rem',
                                        borderRadius: '1rem',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: color,
                                        transition: 'transform 0.5s ease'
                                    }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                        <ClipboardList size={24} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{protocol.title}</h3>
                                            <span style={{
                                                padding: '0.3rem 0.75rem',
                                                borderRadius: '0.625rem',
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
                                                fontWeight: '900',
                                                fontSize: '0.65rem',
                                                letterSpacing: '0.05em',
                                                textTransform: 'uppercase',
                                                color: color
                                            }}>
                                                STEP {index + 1}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '1.05rem', color: theme.colors.text.secondary, fontWeight: '500', lineHeight: '1.5', textAlign: 'justify' }}>
                                            {protocol.protocolText}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {protocols.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '4rem 1.5rem',
                            ...theme.styles.glass,
                            borderRadius: '2rem',
                            border: '0.0625rem dashed rgba(255, 255, 255, 0.1)'
                        }}>
                            <p style={{ color: theme.colors.text.muted, fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.8rem' }}>No protocols recorded for this category yet.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default ProtocolsView
