import React from 'react'
import { motion } from 'framer-motion'
import SSKNewsView from './SSKNewsView'
import { MultimediaView } from './MultimediaView'
import ResourceHubView from './ResourceHubView'
import RuleChanges2027View from './RuleChanges2027View'
import { ArrowLeft, Globe, ArrowUpRight, FileText, PlaySquare, Scale } from 'lucide-react'
import { theme } from './styles/theme'
import SubTabs from './components/SubTabs'
import { tabPanelMotion } from './styles/motion'
import { navigate } from './services/router'

const ACCENT = theme.colors.ssk.primary

const TABS = [
    { id: 'ssk_news', label: 'SSK NEWS', icon: <FileText size={14} /> },
    { id: 'resource_hub', label: 'RESOURCE HUB', icon: <Globe size={14} /> },
    { id: 'rule_changes_2027', label: 'RULE CHANGES 2027', icon: <Scale size={14} /> },
    { id: 'multimedia', label: 'MULTIMEDIA', icon: <PlaySquare size={14} /> },
]

const CARDS = [
    {
        id: 'ssk_news',
        title: 'SSK News',
        description: 'Latest updates and PDF documents from SSK.',
        icon: <FileText size={24} />,
        iconBg: 'rgba(239, 68, 68, 0.2)',
        iconColor: '#ef4444',
    },
    {
        id: 'resource_hub',
        title: 'Resource Hub (NL Referees)',
        description: 'Documents, links and the hall report tool for referees in NLA and NLB.',
        icon: <Globe size={24} />,
        iconBg: 'rgba(255, 0, 0, 0.2)',
        iconColor: '#ff4d4d',
    },
    {
        id: 'rule_changes_2027',
        title: 'Rule Changes 2027',
        description: 'SSK explanations of the rule changes and rule tests for the 2026/2027 season.',
        icon: <Scale size={24} />,
        iconBg: 'rgba(239, 68, 68, 0.2)',
        iconColor: '#ef4444',
    },
    {
        id: 'multimedia',
        title: 'Multimedia',
        description: 'Presentations, videos and other material shared by the SSK.',
        icon: <PlaySquare size={24} />,
        iconBg: 'rgba(59, 130, 246, 0.2)',
        iconColor: '#3b82f6',
    },
]

function SwissVolleyView({ onClose, user, onLogin, activeTab }) {
    const goToTab = (id) => navigate(`/${id}`)

    const renderContent = () => {
        switch (activeTab) {
            case 'ssk_news': return <SSKNewsView user={user} onLogin={onLogin} />
            case 'resource_hub': return <ResourceHubView />
            case 'rule_changes_2027': return <RuleChanges2027View />
            case 'multimedia': return <MultimediaView user={user} onLogin={onLogin} />
            default: return <OverviewMenu onSelect={goToTab} />
        }
    }

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
                borderBottom: `1px solid ${theme.colors.border.subtle}`,
                backgroundColor: 'rgba(10, 10, 10, 0.9)',
                backdropFilter: 'blur(10px)',
                zIndex: 10,
                flexShrink: 0
            }}>
                <div style={{
                    padding: '1rem 1.5rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <button
                        onClick={() => {
                            if (activeTab) navigate('/swiss_volley')
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
                        aria-label={activeTab ? 'Back to Swiss Volley overview' : 'Close Swiss Volley'}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <button
                        onClick={() => navigate('/swiss_volley')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: 'inherit'
                        }}
                    >
                        <h1 style={{
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            margin: 0,
                            fontFamily: 'Outfit, sans-serif',
                            lineHeight: '1'
                        }}>SWISS VOLLEY</h1>
                    </button>
                </div>

                {/* Sub-tabs */}
                <div style={{
                    width: '100%',
                    height: theme.spacing.tabsHeight,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <SubTabs
                        items={TABS}
                        activeId={activeTab}
                        onSelect={goToTab}
                        accentColor={ACCENT}
                    />
                </div>
            </div>

            {/* Content */}
            <motion.div
                key={activeTab || 'overview'}
                role="tabpanel"
                {...tabPanelMotion}
                style={{ flex: 1, width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}
            >
                {renderContent()}
            </motion.div>
        </div>
    )
}

function OverviewMenu({ onSelect }) {
    return (
        <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <img
                    src="/swissvolley.png"
                    alt="Swiss Volley Logo"
                    style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '1rem' }}
                />
                <h2 style={{ fontSize: '2rem', fontWeight: '900', fontFamily: 'Outfit, sans-serif' }}>Swiss Volley</h2>
                <p style={{ color: theme.colors.text.secondary }}>Official Resources &amp; Guidelines</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
                width: '100%',
                maxWidth: '800px'
            }}>
                {CARDS.map(card => (
                    <button
                        key={card.id}
                        onClick={() => onSelect(card.id)}
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
                            backgroundColor: card.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: card.iconColor,
                            flexShrink: 0
                        }}>
                            {card.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem' }}>{card.title}</h3>
                            <p style={{
                                fontSize: '0.85rem',
                                color: theme.colors.text.secondary,
                                textAlign: 'justify',
                                textJustify: 'inter-word',
                                hyphens: 'auto'
                            }}>{card.description}</p>
                        </div>
                        <ArrowUpRight size={20} color={theme.colors.text.muted} style={{ flexShrink: 0 }} />
                    </button>
                ))}
            </div>
        </div>
    )
}

export default SwissVolleyView
