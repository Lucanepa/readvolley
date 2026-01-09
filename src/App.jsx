import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Home, ChevronRight, Search, Trophy } from 'lucide-react'
import MainLayout from './components/MainLayout'
import SearchView from './SearchView'
import SwissVolleyView from './SwissVolleyView'
import { theme } from './styles/theme'

function App() {
    const [environment, setEnvironment] = useState(null)
    const [hoveredEnv, setHoveredEnv] = useState(null)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isSwissVolleyOpen, setIsSwissVolleyOpen] = useState(false)

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: theme.colors.bg.dark,
            color: theme.colors.text.primary,
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            <AnimatePresence mode="wait">
                {!environment ? (
                    <motion.div
                        key="selector"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'relative',
                            minHeight: '100vh',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Dynamic Backgrounds */}
                        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundColor: theme.colors.bg.dark }}>
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10 }} />
                            <AnimatePresence>
                                {hoveredEnv === 'beach' && (
                                    <motion.div
                                        key="beach-bg"
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        transition={{ duration: 0.8 }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundImage: 'url("/beach-bg.png")'
                                        }}
                                    />
                                )}
                                {hoveredEnv === 'indoor' && (
                                    <motion.div
                                        key="indoor-bg"
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        transition={{ duration: 0.8 }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundImage: 'url("/indoor-bg.png")'
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        <div style={{
                            position: 'relative',
                            zIndex: 20,
                            width: '100%',
                            maxWidth: '1200px',
                            margin: '0 auto',
                            padding: '0 1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            itemsCenter: 'center',
                            justifyContent: 'center',
                            minHeight: '100vh',
                            paddingTop: '5rem',
                            paddingBottom: '5rem'
                        }}>
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                style={{ textAlign: 'center', marginBottom: '6rem' }}
                            >
                                <h1 style={{
                                    fontSize: 'clamp(3rem, 10vw, 6rem)',
                                    fontWeight: '900',
                                    marginBottom: '1.5rem',
                                    letterSpacing: '-0.05em',
                                    fontFamily: 'Outfit, sans-serif'
                                }}>
                                    READ<span style={{ color: theme.colors.beach.primary, fontStyle: 'italic' }}>VOLLEY</span>
                                </h1>
                            </motion.div>

                            <div className="home-grid">
                                <EnvironmentCard
                                    type="indoor"
                                    title="VOLLEYBALL"
                                    icon={<Home style={{ width: '2.5rem', height: '2.5rem' }} />}
                                    onHover={() => setHoveredEnv('indoor')}
                                    onBlur={() => setHoveredEnv(null)}
                                    onClick={() => setEnvironment('indoor')}
                                    accentColor="indoor"
                                />
                                <EnvironmentCard
                                    type="beach"
                                    title="BEACH VOLLEYBALL"
                                    icon={<Sun style={{ width: '2.5rem', height: '2.5rem' }} />}
                                    onHover={() => setHoveredEnv('beach')}
                                    onBlur={() => setHoveredEnv(null)}
                                    onClick={() => setEnvironment('beach')}
                                    accentColor="beach"
                                />
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                style={{
                                    marginTop: '4rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1.5rem'
                                }}
                            >
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    style={{
                                        ...theme.styles.glass,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1rem 2rem',
                                        borderRadius: '1.5rem',
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        fontWeight: '800',
                                        letterSpacing: '0.05em',
                                        transition: 'all 0.3s ease',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        width: 'fit-content'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1.05)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.8)'; e.currentTarget.style.transform = 'scale(1)' }}
                                >
                                    <Search size={20} />
                                    SEARCH EVERYTHING
                                </button>

                                <button
                                    onClick={() => setIsSwissVolleyOpen(true)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        width: 'fit-content',
                                        opacity: 0.8
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.opacity = '1' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.8' }}
                                >
                                    <img
                                        src="/swissvolley.png"
                                        alt="Swiss Volley"
                                        style={{ width: '250px', objectFit: 'contain', borderRadius: '2rem' }}
                                    />
                                </button>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                style={{
                                    marginTop: '5rem',
                                    fontSize: '10px',
                                    textAlign: 'center',
                                    letterSpacing: '0.4em',
                                    textTransform: 'uppercase',
                                    opacity: 0.4,
                                    fontWeight: '700'
                                }}
                            >
                                Powered by OpenVolley • v1.2.5
                            </motion.p>
                        </div>
                    </motion.div>
                ) : (
                    <MainLayout
                        key="main"
                        environment={environment}
                        onBack={() => setEnvironment(null)}
                        onOpenSearch={() => setIsSearchOpen(true)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000 }}
                    >
                        <SearchView
                            onClose={() => setIsSearchOpen(false)}
                            initialEnvironment={environment}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isSwissVolleyOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000 }}
                    >
                        <SwissVolleyView
                            onClose={() => setIsSwissVolleyOpen(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function EnvironmentCard({ title, subtitle, icon, onClick, onHover, onBlur, accentColor }) {
    const isBeach = accentColor === 'beach'
    const color = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary
    const [isHovered, setIsHovered] = useState(false)

    return (
        <motion.button
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={() => { onHover(); setIsHovered(true) }}
            onMouseLeave={() => { onBlur(); setIsHovered(false) }}
            onClick={onClick}
            style={{
                position: 'relative',
                ...theme.styles.glass,
                padding: '1.25rem 2rem',
                borderRadius: '2rem',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '1.5rem',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: isHovered ? color : 'rgba(255, 255, 255, 0.05)',
                boxShadow: isHovered ? `0 0 40px -10px ${color}33` : 'none',
                cursor: 'pointer',
                width: '100%',
                overflow: 'hidden'
            }}
        >
            <div style={{
                padding: '0.75rem',
                borderRadius: '1rem',
                backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                color: color,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {React.cloneElement(icon, { size: 24, style: { width: '24px', height: '24px' } })}
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                flexGrow: 1,
                minWidth: 0
            }}>
                <h2 style={{
                    fontSize: 'clamp(1.1rem, 3.5vw, 1.75rem)',
                    fontWeight: '900',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    transition: 'transform 0.3s ease',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: '1.1',
                    width: '100%'
                }}>{title}</h2>
                {subtitle && (
                    <p style={{
                        color: theme.colors.text.secondary,
                        fontSize: '0.875rem',
                        margin: 0,
                        marginTop: '0.25rem',
                        fontWeight: '500',
                        opacity: 0.6,
                        letterSpacing: '0.01em',
                        width: '100%'
                    }}>{subtitle}</p>
                )}
            </div>

            <div style={{
                color: color,
                opacity: isHovered ? 1 : 0.3,
                transition: 'all 0.3s ease',
                transform: isHovered ? 'translateX(0)' : 'translateX(-5px)',
                flexShrink: 0
            }}>
                <ChevronRight size={20} />
            </div>
        </motion.button>
    )
}

export default App
