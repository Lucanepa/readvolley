import React, { useEffect, useRef } from 'react'
import { theme } from '../styles/theme'

/**
 * Horizontal tab strip used for the sub-navigation of both the indoor/beach
 * sections and Swiss Volley. Scrolls sideways on narrow screens and keeps the
 * active tab in view.
 */
function SubTabs({ items, activeId, onSelect, accentColor }) {
    const stripRef = useRef(null)
    const activeRef = useRef(null)

    useEffect(() => {
        const el = activeRef.current
        if (!el || !stripRef.current) return
        const strip = stripRef.current
        const left = el.offsetLeft - (strip.clientWidth - el.clientWidth) / 2
        strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
    }, [activeId])

    return (
        <div
            ref={stripRef}
            className="subtab-strip"
            role="tablist"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                width: '100%',
                maxWidth: theme.styles.container.maxWidth,
                margin: '0 auto',
                padding: '0 1rem',
                overflowX: 'auto',
                overflowY: 'hidden'
            }}
        >
            {items.map(item => {
                const isActive = item.id === activeId
                return (
                    <button
                        key={item.id}
                        ref={isActive ? activeRef : null}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onSelect(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            flexShrink: 0,
                            padding: '0.4rem 0.8rem',
                            borderRadius: '0.75rem',
                            border: '1px solid',
                            borderColor: isActive ? accentColor : 'rgba(255,255,255,0.06)',
                            backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.04)',
                            color: isActive ? '#ffffff' : theme.colors.text.secondary,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            if (isActive) return
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                            e.currentTarget.style.color = '#ffffff'
                        }}
                        onMouseLeave={(e) => {
                            if (isActive) return
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                            e.currentTarget.style.color = theme.colors.text.secondary
                        }}
                    >
                        <span style={{ display: 'flex', color: isActive ? '#ffffff' : accentColor }}>{item.icon}</span>
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: '900',
                            letterSpacing: '0.05em',
                            fontFamily: 'Outfit, sans-serif'
                        }}>{item.label}</span>
                    </button>
                )
            })}
        </div>
    )
}

export default SubTabs
