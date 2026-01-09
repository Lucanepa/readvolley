import React from 'react'
import { motion } from 'framer-motion'
import { theme } from './styles/theme'

function ExtraView({ environment }) {
    const isBeach = environment === 'beach'
    const color = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                maxWidth: theme.styles.container.maxWidth,
                margin: '0 auto',
                width: '100%',
                paddingTop: '2rem'
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.025em', fontFamily: 'Outfit, sans-serif' }}>
                    Extra <span style={{ color: color }}>Resources</span>
                </h1>
                <p style={{ color: theme.colors.text.secondary }}>Additional materials and tools</p>
            </div>

            <div style={{
                textAlign: 'center',
                padding: '4rem 1.5rem',
                ...theme.styles.glass,
                borderRadius: '2rem',
                border: '0.0625rem dashed rgba(255, 255, 255, 0.1)'
            }}>
                <p style={{ color: theme.colors.text.muted, fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                    Content coming soon
                </p>
            </div>
        </motion.div>
    )
}

export default ExtraView
