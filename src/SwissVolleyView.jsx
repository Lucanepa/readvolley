import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Globe, ArrowUpRight } from 'lucide-react'
import { theme } from './styles/theme'

function SwissVolleyView({ onClose }) {
    const [activeView, setActiveView] = useState('menu') // 'menu' | 'resources'

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: theme.colors.bg.dark,
            color: theme.colors.text.primary,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1.5rem',
                borderBottom: `1px solid ${theme.colors.border.subtle}`,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: 'rgba(10, 10, 10, 0.9)',
                backdropFilter: 'blur(10px)',
                zIndex: 10
            }}>
                <button
                    onClick={() => {
                        if (activeView === 'resources') setActiveView('menu')
                        else onClose()
                    }}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.colors.text.secondary,
                        transition: 'all 0.2s ease',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        margin: 0,
                        fontFamily: 'Outfit, sans-serif',
                        lineHeight: '1'
                    }}>SWISS VOLLEY</h1>
                    {activeView === 'resources' && (
                        <span style={{ fontSize: '0.8rem', color: theme.colors.text.secondary, fontWeight: '500' }}> / Resource Hub</span>
                    )}
                </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeView === 'menu' ? (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2rem'
                        }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <img
                                src="/swissvolley.png"
                                alt="Swiss Volley Logo"
                                style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '1rem' }}
                            />
                            <h2 style={{ fontSize: '2rem', fontWeight: '900', fontFamily: 'Outfit, sans-serif' }}>Swiss Volley</h2>
                            <p style={{ color: theme.colors.text.secondary }}>Official Resources & Guidelines</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', width: '100%', maxWidth: '800px' }}>
                            <button
                                onClick={() => setActiveView('resources')}
                                style={{
                                    ...theme.styles.glass,
                                    padding: '1.5rem',
                                    borderRadius: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }}
                            >
                                <div style={{
                                    width: '3rem',
                                    height: '3rem',
                                    borderRadius: '1rem',
                                    backgroundColor: 'rgba(255, 0, 0, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ff4d4d'
                                }}>
                                    <Globe size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem' }}>Resource Hub</h3>
                                    <p style={{ fontSize: '0.85rem', color: theme.colors.text.secondary }}>Access external documentation and refereeing resources.</p>
                                </div>
                                <ArrowUpRight size={20} color={theme.colors.text.muted} />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="resources"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#ffffff' }}
                    >
                        <iframe
                            src="https://rueeggl.github.io/resources-hub/"
                            title="Swiss Volley Resource Hub"
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default SwissVolleyView
