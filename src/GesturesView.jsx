import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, X, Maximize2 } from 'lucide-react'
import { api } from './services/api'
import { theme } from './styles/theme'

function GesturesView({ environment }) {
    const [gestures, setGestures] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedGesture, setSelectedGesture] = useState(null)

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
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '0.75rem',
                    fontSize: '0.65rem',
                    fontWeight: '900',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: color
                }}>
                    <List size={14} /> Official Signals
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.025em', fontFamily: 'Outfit, sans-serif' }}>
                    Referee <span style={{ color: color }}>Hand Signals</span>
                </h1>
                <p style={{ fontSize: '1.1rem', color: theme.colors.text.secondary, fontWeight: '500', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                    Official referee hand signals for match orchestration and rule enforcement.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
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
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: 0 // Allow shrinking
                        }}
                    >
                        {/* 1. Image & Badge Overlay */}
                        <div
                            onClick={() => setSelectedGesture(gesture)}
                            style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '4/3',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '1rem',
                                backgroundColor: 'rgba(0,0,0,0.4)',
                                cursor: 'zoom-in',
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={gesture.url}
                                alt={gesture.title}
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    zIndex: 1,
                                    transition: 'transform 0.5s ease'
                                }}
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
                                transition: 'opacity 0.3s ease',
                                zIndex: 2
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                            >
                                <Maximize2 color="white" size={32} />
                            </div>

                            {/* Signal Number Badge - Absolute Positioned */}
                            <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', zIndex: 3 }}>
                                <span style={{
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '0.625rem',
                                    ...theme.styles.glass,
                                    border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
                                    fontWeight: '900',
                                    fontSize: '0.75rem',
                                    color: color,
                                    textTransform: 'uppercase'
                                }}>
                                    SIGNAL {gesture.gesture_n}
                                </span>
                            </div>
                        </div>

                        {/* 2. Content Section */}
                        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '900',
                                letterSpacing: '-0.04em',
                                textTransform: 'uppercase',
                                margin: 0,
                                lineHeight: '1.2',
                                wordBreak: 'break-word'
                            }}>
                                {gesture.title}
                            </h3>

                            {gesture.text && (
                                <p style={{ fontSize: '1rem', color: theme.colors.text.primary, fontWeight: '500', lineHeight: '1.4', margin: 0, wordBreak: 'break-word' }}>
                                    {gesture.text}
                                </p>
                            )}

                            {/* 3. Referees - List Layout */}
                            {(gesture.first_r || gesture.first_r_special || gesture.second_r || gesture.second_r_special) && (
                                <div style={{
                                    width: '100%',
                                    marginTop: 'auto',
                                    borderTop: '0.0625rem solid rgba(255,255,255,0.05)',
                                    paddingTop: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.6rem'
                                }}>
                                    {[
                                        { show: gesture.first_r, role: 1, text: '1st referee responsibility', special: false },
                                        { show: gesture.first_r_special, role: 1, text: '1st referee in particular situations', special: true },
                                        { show: gesture.second_r, role: 2, text: '2nd referee responsibility', special: false },
                                        { show: gesture.second_r_special, role: 2, text: '2nd referee in particular situations', special: true }
                                    ].filter(r => r.show).map((r, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                                            <div style={{
                                                width: '1.4rem',
                                                height: '1.4rem',
                                                flexShrink: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '0.25rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '900',
                                                backgroundColor: r.special ? 'transparent' : '#fff',
                                                border: '0.1rem solid #fff',
                                                color: r.special ? '#fff' : '#000'
                                            }}>
                                                {r.role}
                                            </div>
                                            <span style={{
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                color: r.special ? theme.colors.text.secondary : theme.colors.text.primary,
                                                lineHeight: '1.2',
                                                wordBreak: 'break-word'
                                            }}>
                                                {r.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {gestures.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2rem', border: '0.0625rem dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ color: theme.colors.text.muted, fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Visualizing hand signals, please wait...</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedGesture && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedGesture(null)}
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

                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '100%', maxHeight: '100%' }}>
                            <motion.img
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                src={selectedGesture.url}
                                alt={selectedGesture.title}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    borderRadius: '1rem',
                                    boxShadow: '0 2rem 4rem rgba(0,0,0,0.5)'
                                }}
                            />
                        </div>

                        <div style={{
                            position: 'absolute',
                            bottom: '2rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            textAlign: 'center',
                            width: '100%',
                            padding: '0 2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{
                                color: color,
                                fontWeight: '900',
                                fontSize: '0.75rem',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                display: 'block'
                            }}>
                                SIGNAL {selectedGesture.gesture_n}
                            </span>
                            <h2 style={{
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                margin: 0,
                                letterSpacing: '-0.02em',
                                lineHeight: '1.2'
                            }}>
                                {selectedGesture.title}
                            </h2>
                            {selectedGesture.text && (
                                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', fontWeight: '500', margin: 0, marginTop: '0.5rem', maxWidth: '40rem' }}>
                                    {selectedGesture.text}
                                </p>
                            )}
                            {selectedGesture.notes && (
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: '400', fontStyle: 'italic', margin: 0, maxWidth: '40rem' }}>
                                    {selectedGesture.notes}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default GesturesView
