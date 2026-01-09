import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Home, ChevronRight, Search } from 'lucide-react'
import MainLayout from './components/MainLayout'
import SearchView from './SearchView'
import { theme } from './styles/theme'

function App() {
    const [environment, setEnvironment] = useState(null)
    const [hoveredEnv, setHoveredEnv] = useState(null)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

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
                                    VOLLEY<span style={{ color: theme.colors.beach.primary, fontStyle: 'italic' }}>RULES</span>
                                </h1>
                            </motion.div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                                gap: '3rem',
                                width: '100%',
                                maxWidth: '1152px'
                            }}>
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
                                    justifyContent: 'center'
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
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1.05)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.8)'; e.currentTarget.style.transform = 'scale(1)' }}
                                >
                                    <Search size={20} />
                                    SEARCH EVERYTHING
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
                padding: '4rem 2rem',
                paddingTop: '6rem',
                paddingBottom: '6rem',
                borderRadius: '48px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                borderWidth: '2px',
                borderColor: isHovered ? color : 'rgba(255, 255, 255, 0.05)',
                boxShadow: isHovered ? `0 0 50px -12px ${color}4D` : 'none',
                cursor: 'pointer'
            }}
        >
            <div style={{
                padding: '2rem',
                borderRadius: '1.5rem',
                backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                marginBottom: '3rem',
                transition: 'all 0.5s ease',
                color: color
            }}>
                {icon}
            </div>
            <h2 style={{
                fontSize: '3rem',
                fontWeight: '900',
                marginBottom: '1.5rem',
                letterSpacing: '-0.025em',
                transition: 'transform 0.5s ease',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                fontFamily: 'Outfit, sans-serif'
            }}>{title}</h2>
            <p style={{
                color: theme.colors.text.secondary,
                fontSize: '1.125rem',
                marginBottom: '3rem',
                fontWeight: '500',
                opacity: 0.6,
                letterSpacing: '0.025em'
            }}>{subtitle}</p>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '10px',
                fontWeight: '900',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                opacity: isHovered ? 1 : 0,
                transition: 'all 0.3s ease',
                transform: isHovered ? 'translateY(0)' : 'translateY(1rem)'
            }}>
                Enter<ChevronRight size={14} />
            </div>
        </motion.button>
    )
}

export default App
