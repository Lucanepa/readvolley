import React, { useEffect, useRef } from 'react'
import { theme } from '../styles/theme'

/**
 * Motion for the panel behind a tab. Opacity only, and short: the panel
 * fetches its own data on mount, so a longer transition ends up animating an
 * empty box that then reflows as the content lands. No exit animation either —
 * waiting for one to finish before the next panel appears is what made
 * switching tabs feel sluggish.
 */
export const tabPanelMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.16, ease: 'easeOut' },
}

/**
 * Horizontal tab strip used for the sub-navigation of both the indoor/beach
 * sections and Swiss Volley. Scrolls sideways on narrow screens and keeps the
 * active tab in view.
 */
function SubTabs({ items, activeId, onSelect, accentColor }) {
    const stripRef = useRef(null)
    const activeRef = useRef(null)
    const hasScrolled = useRef(false)

    useEffect(() => {
        const el = activeRef.current
        if (!el || !stripRef.current) return
        const strip = stripRef.current
        const left = el.offsetLeft - (strip.clientWidth - el.clientWidth) / 2
        // On first paint the tab is put in view without animating — a strip
        // that slides on its own as the page opens looks like a glitch.
        strip.scrollTo({ left: Math.max(0, left), behavior: hasScrolled.current ? 'smooth' : 'auto' })
        hasScrolled.current = true
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
