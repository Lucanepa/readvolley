import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Book, Image as ImageIcon, Info, ShieldCheck, List,
    ChevronLeft, Search, MoreHorizontal, Lock, LogOut
} from 'lucide-react'
import RulesView from '../RulesView'
import DiagramsView from '../DiagramsView'
import DefinitionsView from '../DefinitionsView'
import ProtocolsView from '../ProtocolsView'
import GesturesView from '../GesturesView'
import ExtraView from '../ExtraView'
import { theme } from '../styles/theme'
import ErrorBoundary from './ErrorBoundary'
import SubTabs from './SubTabs'
import { tabPanelMotion } from '../styles/motion'
import { navigate } from '../services/router'

function MainLayout({ environment, activeTab, onBack, onOpenSearch, user, onLogin }) {
    const isBeach = environment === 'beach'
    const color = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary

    const navItems = [
        { id: 'rules', label: 'RULES', icon: <Book size={14} /> },
        { id: 'diagrams', label: 'DIAGRAMS', icon: <ImageIcon size={14} /> },
        { id: 'definitions', label: 'DEFINITIONS', icon: <Info size={14} /> },
        { id: 'protocols', label: 'PROTOCOLS', icon: <ShieldCheck size={14} /> },
        { id: 'hand_signals', label: 'HAND SIGNALS', icon: <List size={14} /> },
        { id: 'extra', label: 'EXTRA', icon: <MoreHorizontal size={14} /> },
    ]

    const setActiveTab = (id) => navigate(`/${environment}/${id}`)

    // A tab is a fresh page, so it starts at the top. Without this you land
    // half way down the new panel at whatever offset the previous one had.
    useEffect(() => {
        window.scrollTo({ top: 0 })
    }, [activeTab])

    const renderContent = () => {
        switch (activeTab) {
            case 'rules': return <RulesView environment={environment} />
            case 'diagrams': return <DiagramsView environment={environment} />
            case 'definitions': return <DefinitionsView environment={environment} />
            case 'protocols': return <ProtocolsView environment={environment} />
            case 'hand_signals': return <GesturesView environment={environment} />
            case 'extra': return <ExtraView environment={environment} user={user} onLogin={onLogin} />
            default: return <RulesView environment={environment} />
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        window.dispatchEvent(new Event('auth-change'))
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
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    ...theme.styles.glass,
                    width: '100%',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <div style={{
                    height: theme.spacing.headerHeight,
                    width: '100%',
                    maxWidth: theme.styles.container.maxWidth,
                    padding: '0 1rem',
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

                    {/* Middle: current section (tabs live in the row below) */}
                    <div style={{ justifySelf: 'center' }}>
                        <span style={{
                            fontSize: '0.6rem',
                            fontWeight: '700',
                            letterSpacing: '0.25em',
                            textTransform: 'uppercase',
                            color: theme.colors.text.muted,
                            opacity: 0.7
                        }}>ReadVolley</span>
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

                {/* Sub-tabs */}
                <div style={{
                    width: '100%',
                    height: theme.spacing.tabsHeight,
                    display: 'flex',
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <SubTabs
                        items={navItems}
                        activeId={activeTab}
                        onSelect={setActiveTab}
                        accentColor={color}
                    />
                </div>
            </header>

            {/* Spacer for Fixed Header + Tabs */}
            <div style={{
                height: `calc(${theme.spacing.headerHeight} + ${theme.spacing.tabsHeight})`,
                width: '100%',
                flexShrink: 0
            }} />

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
                    role="tabpanel"
                    {...tabPanelMotion}
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                    <ErrorBoundary onReset={() => setActiveTab(activeTab)}>
                        {renderContent()}
                    </ErrorBoundary>
                </motion.div>
            </main>

            {/* Spacer for Fixed Footer */}
            <div style={{ height: theme.spacing.footerHeight, width: '100%', flexShrink: 0 }} />

            {/* Footer - Fixed & Fluid */}
            <footer
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    ...theme.styles.glass,
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: theme.spacing.footerHeight
                }}
            >
                <div style={{
                    width: '100%',
                    maxWidth: theme.styles.container.maxWidth,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    padding: '0 1rem'
                }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.2em', color: theme.colors.text.muted, opacity: 0.6, textTransform: 'uppercase', textAlign: 'center' }}>
                        © 2026 OpenVolley • Elite Rules Companion
                    </span>

                    {/* Auth Trigger */}

                    <button
                        onClick={() => user ? handleLogout() : onLogin()}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: theme.colors.text.muted,
                            opacity: 0.5,
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                        title={user ? 'Sign Out' : 'Admin Login'}
                    >
                        {user ? (
                            <>
                                <LogOut size={12} />
                                <span>Sign Out</span>
                            </>
                        ) : (
                            <>
                                <Lock size={12} />
                                <span>Manage</span>
                            </>
                        )}
                    </button>
                </div>
            </footer>

        </div>
    )
}

export default MainLayout
