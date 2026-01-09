import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy } from 'lucide-react'
import { theme } from './styles/theme'

function SwissVolleyView({ onClose }) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: theme.colors.bg.dark,
            color: theme.colors.text.primary,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
        }}>
            {/* Header */}
            <div style={{
                padding: '1.5rem',
                borderBottom: `1px solid ${theme.colors.border.subtle}`,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                position: 'sticky',
                top: 0,
                backgroundColor: 'rgba(10, 10, 10, 0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 10
            }}>
                <button
                    onClick={onClose}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.colors.text.secondary,
                        transition: 'all 0.2s ease',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    margin: 0,
                    fontFamily: 'Outfit, sans-serif'
                }}>SWISS VOLLEY</h1>
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        padding: '2rem',
                        borderRadius: '2rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <img
                        src="/swissvolley.png"
                        alt="Swiss Volley Logo"
                        style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                    />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        fontSize: '2rem',
                        fontWeight: '900',
                        marginBottom: '1rem',
                        fontFamily: 'Outfit, sans-serif'
                    }}
                >
                    Content Coming Soon
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        color: theme.colors.text.secondary,
                        fontSize: '1.125rem',
                        lineHeight: '1.6',
                        maxWidth: '500px'
                    }}
                >
                    This section will contain Swiss-specific regulations, protocols, and tournament guidelines.
                </motion.p>
            </div>
        </div>
    )
}

export default SwissVolleyView
