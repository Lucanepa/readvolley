import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Book, Image as ImageIcon, Info, ShieldCheck, List,
    ChevronLeft, Search, ChevronDown, MoreHorizontal
} from 'lucide-react'
import RulesView from '../RulesView'
import DiagramsView from '../DiagramsView'
import DefinitionsView from '../DefinitionsView'
import ProtocolsView from '../ProtocolsView'
import GesturesView from '../GesturesView'
import ExtraView from '../ExtraView'
import { theme } from '../styles/theme'

function MainLayout({ environment, onBack, onOpenSearch }) {
    const [activeTab, setActiveTab] = useState('rules')
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const isBeach = environment === 'beach'
    const color = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary
    const accentBg = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary

    const navItems = [
        { id: 'rules', label: 'RULES', icon: <Book size={18} /> },
        { id: 'diagrams', label: 'DIAGRAMS', icon: <ImageIcon size={18} /> },
        { id: 'definitions', label: 'DEFINITIONS', icon: <Info size={18} /> },
        { id: 'protocols', label: 'PROTOCOLS', icon: <ShieldCheck size={18} /> },
        { id: 'gestures', label: 'HAND SIGNALS', icon: <List size={18} /> },
        { id: 'extra', label: 'EXTRA', icon: <MoreHorizontal size={18} /> },
    ]

    const activeItem = navItems.find(item => item.id === activeTab)

    const renderContent = () => {
        switch (activeTab) {
            case 'rules': return <RulesView environment={environment} />
            case 'diagrams': return <DiagramsView environment={environment} />
            case 'definitions': return <DefinitionsView environment={environment} />
            case 'protocols': return <ProtocolsView environment={environment} />
            case 'gestures': return <GesturesView environment={environment} />
            case 'extra': return <ExtraView environment={environment} />
            default: return <RulesView environment={environment} />
        }
    }

    return (
        <div style={{
            minHeight: '100dvh',
            backgroundColor: theme.colors.bg.dark,
            color: theme.colors.text.primary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowX: 'hidden',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Header - Fixed & Fluid */}
            <header
                style={{
                    position: 'fixed',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    ...theme.styles.glass,
                    padding: '0 1rem',
                    width: '100%',
                    maxWidth: theme.styles.container.maxWidth,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    height: theme.spacing.headerHeight,
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <div style={{
                    height: '100%',
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center'
                }}>
                    {/* Left: Back + Env (Compact for mobile) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifySelf: 'start' }}>
                        <button
                            onClick={onBack}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{
                                fontSize: '1rem',
                                fontWeight: '900',
                                letterSpacing: '-0.02em',
                                color: color,
                                fontFamily: 'Outfit, sans-serif'
                            }}>
                                {environment.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Middle: Menu Trigger (Main control) */}
                    <div style={{ position: 'relative', justifySelf: 'center' }}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.2rem 0.2rem',
                                borderRadius: '0.75rem',
                                border: '1px solid',
                                borderColor: isMenuOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                                backgroundColor: isMenuOpen ? accentBg : 'rgba(255,255,255,0.05)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                boxShadow: isMenuOpen ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            <div style={{ color: isMenuOpen ? '#ffffff' : color }}>{activeItem.icon}</div>
                            <span style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '0.05em' }}>{activeItem.label}</span>
                            <ChevronDown size={14} style={{ opacity: 0.4, transition: 'transform 0.3s', transform: isMenuOpen ? 'rotate(180deg)' : 'none' }} />
                        </button>

                        <AnimatePresence>
                            {isMenuOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            position: 'fixed',
                                            inset: 0,
                                            zIndex: 200,
                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                            backdropFilter: 'blur(4px)'
                                        }}
                                        onClick={() => setIsMenuOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        style={{
                                            position: 'absolute',
                                            top: '110%',
                                            right: '0',
                                            width: '14rem',
                                            backgroundColor: '#000000',
                                            borderRadius: '1.25rem',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                                            zIndex: 210,
                                            overflow: 'hidden',
                                            padding: '0.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        {navItems.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    setActiveTab(item.id)
                                                    setIsMenuOpen(false)
                                                }}
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '0.75rem',
                                                    textAlign: 'left',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: activeTab === item.id ? accentBg : 'transparent',
                                                    color: activeTab === item.id ? '#ffffff' : theme.colors.text.secondary,
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (activeTab !== item.id) {
                                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                                                        e.currentTarget.style.color = '#ffffff'
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (activeTab !== item.id) {
                                                        e.currentTarget.style.backgroundColor = 'transparent'
                                                        e.currentTarget.style.color = theme.colors.text.secondary
                                                    }
                                                }}
                                            >
                                                <div style={{ color: activeTab === item.id ? '#ffffff' : color }}>
                                                    {item.icon}
                                                </div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.02em' }}>{item.label}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: Search (Compact) */}
                    <div style={{ justifySelf: 'end' }}>
                        <button
                            onClick={onOpenSearch}
                            style={{
                                padding: '0.5rem',
                                ...theme.styles.glass,
                                borderRadius: '0.5rem',
                                transition: 'all 0.2s',
                                opacity: 0.6,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.backgroundColor = theme.styles.glass.background }}
                        >
                            <Search size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Spacer for Fixed Header */}
            <div style={{ height: theme.spacing.headerHeight, width: '100%', flexShrink: 0 }} />

            {/* Main Content Area */}
            <main style={{
                width: '100%',
                maxWidth: theme.styles.container.maxWidth,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '1rem',
                flex: 1
            }}>
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                    {renderContent()}
                </motion.div>
            </main>

            {/* Spacer for Fixed Footer */}
            <div style={{ height: theme.spacing.footerHeight, width: '100%', flexShrink: 0 }} />

            {/* Footer - Fixed & Fluid */}
            <footer
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    ...theme.styles.glass,
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: theme.styles.container.maxWidth,
                    height: theme.spacing.footerHeight
                }}
            >
                <span style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.2em', color: theme.colors.text.muted, opacity: 0.6, textTransform: 'uppercase', textAlign: 'center' }}>
                    © 2026 OpenVolley • Elite Rules Companion
                </span>
            </footer>
        </div>
    )
}

export default MainLayout
