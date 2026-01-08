import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { List } from 'lucide-react'
import { api } from './services/api'
import { theme } from './styles/theme'

function GesturesView({ environment }) {
    const [gestures, setGestures] = useState([])
    const [loading, setLoading] = useState(true)

    const isBeach = environment === 'beach'
    const color = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary
    const accentBorder = isBeach ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'

    useEffect(() => {
        loadGestures()
    }, [environment])

    const loadGestures = async () => {
        setLoading(true)
        try {
            const data = await api.getGestures(environment)
            setGestures(data)
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
                border: `0.25rem solid ${accentBorder}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Preparing Referee Signals...</p>
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
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '0.0625rem solid rgba(255,255,255,0.1)',
                    marginBottom: '0.75rem',
                    fontSize: '0.65rem',
                    fontWeight: '900',
                    letterSpacing: '0.15rem',
                    textTransform: 'uppercase',
                    color: color
                }}>
                    <List size={14} /> Official Signals
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.025em', fontFamily: 'Outfit, sans-serif' }}>
                    Referee <span style={{ color: color }}>Hand Signals</span>
                </h1>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
                gap: '1.25rem',
                maxWidth: theme.styles.container.maxWidth,
                margin: '0 auto',
                width: '100%'
            }}>
                {gestures.map((gesture, index) => (
                    <motion.div
                        key={gesture.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                            ...theme.styles.glass,
                            borderRadius: '2rem',
                            overflow: 'hidden',
                            border: '0.0625rem solid rgba(255,255,255,0.05)',
                            transition: 'all 0.5s',
                            boxShadow: '0 1.5rem 3rem -0.75rem rgba(0, 0, 0, 0.5)',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1.25rem'
                        }}
                    >
                        {/* 1. Number and Title */}
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '0.5rem',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: '0.0625rem solid rgba(255,255,255,0.1)',
                                fontWeight: '700',
                                fontSize: '0.65rem',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: color,
                                marginBottom: '0.5rem'
                            }}>
                                SIGNAL {gesture.gestureNumber || gesture.gesture_n}
                            </div>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '900',
                                letterSpacing: '-0.04em',
                                textTransform: 'uppercase',
                                margin: 0,
                                lineHeight: '1.2',
                                minHeight: '3rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {gesture.title}
                            </h3>
                        </div>

                        {/* 2. Image */}
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: '1.5rem',
                            border: '0.0625rem solid rgba(255,255,255,0.05)',
                            minHeight: '200px'
                        }}>
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '1.5rem',
                                filter: 'blur(2.5rem)',
                                opacity: 0.1,
                                backgroundColor: color,
                                zIndex: 0
                            }} />
                            <img
                                src={gesture.url}
                                alt={gesture.title}
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    maxHeight: '200px',
                                    objectFit: 'contain',
                                    zIndex: 1,
                                    transition: 'transform 0.5s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                        </div>

                        {/* 3. Note */}
                        <div style={{ textAlign: 'center', width: '100%', minHeight: '3rem' }}>
                            {gesture.text && (
                                <p style={{ fontSize: '1rem', color: theme.colors.text.primary, fontWeight: '500', lineHeight: '1.4', margin: 0, marginBottom: '0.25rem' }}>
                                    {gesture.text}
                                </p>
                            )}
                            {gesture.notes && (
                                <p style={{ fontSize: '0.85rem', color: theme.colors.text.secondary, fontWeight: '400', lineHeight: '1.4', margin: 0, fontStyle: 'italic', opacity: 0.8 }}>
                                    {gesture.notes}
                                </p>
                            )}
                        </div>

                        {/* 4. Referees - Compact */}
                        {(gesture.first_r || gesture.second_r) && (
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                width: '100%',
                                marginTop: 'auto',
                                borderTop: '0.0625rem solid rgba(255,255,255,0.05)',
                                paddingTop: '1rem'
                            }}>
                                {gesture.first_r && (
                                    <div style={{
                                        padding: '0.4rem 0.75rem',
                                        borderRadius: '0.75rem',
                                        backgroundColor: gesture.first_r_special ? `${color}15` : 'rgba(255,255,255,0.03)',
                                        border: gesture.first_r_special ? `0.0625rem dashed ${color}` : '0.0625rem solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        minWidth: '10rem',
                                        justifyContent: 'center'
                                    }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#fff' }}>
                                            1st Referee
                                        </span>
                                        {gesture.first_r_special && (
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: color, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                                (Special)
                                            </span>
                                        )}
                                    </div>
                                )}

                                {gesture.second_r && (
                                    <div style={{
                                        padding: '0.4rem 0.75rem',
                                        borderRadius: '0.75rem',
                                        backgroundColor: gesture.second_r_special ? `${color}15` : 'rgba(255,255,255,0.03)',
                                        border: gesture.second_r_special ? `0.0625rem dashed ${color}` : '0.0625rem solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        minWidth: '10rem',
                                        justifyContent: 'center'
                                    }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#fff' }}>
                                            2nd Referee
                                        </span>
                                        {gesture.second_r_special && (
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: color, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                                (Special)
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {(!gesture.first_r && !gesture.second_r) && (
                            <div style={{ marginTop: 'auto', paddingTop: '1rem', minHeight: '2rem' }}></div>
                        )}

                    </motion.div>
                ))}

                {gestures.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2rem', border: '0.0625rem dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ color: theme.colors.text.muted, fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Visualizing hand signals, please wait...</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GesturesView
