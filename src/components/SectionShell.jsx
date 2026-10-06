import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, Search } from 'lucide-react'
import {
    AppPage, AppFooter, BottomNav, BottomNavItem, OptionsSheet, TitleCard, IconButton, FOCUS_RING, cn,
} from '../ui/volleyui'
import { tabPanelMotion } from '../styles/motion'
import { navigate } from '../services/router'
import { api } from '../services/api'
import ErrorBoundary from './ErrorBoundary'

// The search index is a single large download. Starting it when the pointer
// reaches the button means it is usually in hand by the time the overlay opens.
export const warmSearchIndex = () => { api.getAllSearchData().catch(() => {}) }

/**
 * The App shell shared by the indoor/beach sections and Swiss Volley: a bottom
 * bar on phones that becomes a left rail from lg, a title card in place of a
 * top bar, and an Options sheet for everything that does not fit the bar.
 *
 * `items` are the destinations. The bar has room for four plus Options, so an
 * item with `railOnly` is drawn in the rail but reached through the Options
 * sheet on smaller screens — the caller lists it there with `lg:hidden`.
 */
function SectionShell({
    items, activeId, onSelect, title, eyebrow, titleAside, onOpenSearch,
    options, panelKey, onResetPanel, children,
}) {
    const [optionsOpen, setOptionsOpen] = useState(false)
    const barCount = items.filter(item => !item.railOnly).length + 1
    // On a phone a rail-only destination lives in Options, so Options stands
    // in as the active item; the rail shows the destination itself.
    const activeInOptions = items.some(item => item.railOnly && item.id === activeId)

    // A tab is a fresh page, so it starts at the top. Without this you land
    // half way down the new panel at whatever offset the previous one had.
    useEffect(() => {
        window.scrollTo({ top: 0 })
        setOptionsOpen(false)
    }, [panelKey])

    return (
        <AppPage bottomNav width="max-w-5xl">
            <BottomNav label="Sections" count={barCount}>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className={cn('hidden lg:block mb-5 rounded-lg px-3 text-left text-lg font-bold tracking-tight text-stone-900', FOCUS_RING)}
                >
                    ReadVolley
                </button>
                {items.map(item => (
                    <BottomNavItem
                        key={item.id}
                        icon={item.icon}
                        active={item.id === activeId}
                        onClick={() => onSelect(item.id)}
                        className={item.railOnly ? 'hidden lg:flex' : undefined}
                    >
                        <span className="lg:hidden">{item.short || item.label}</span>
                        <span className="hidden lg:inline">{item.label}</span>
                    </BottomNavItem>
                ))}
                <BottomNavItem
                    icon={Menu}
                    active={activeInOptions}
                    open={optionsOpen}
                    aria-haspopup="dialog"
                    aria-expanded={optionsOpen}
                    onClick={() => setOptionsOpen(open => !open)}
                    className={activeInOptions ? 'lg:bg-transparent lg:text-stone-600 lg:hover:bg-stone-100' : undefined}
                >
                    More
                </BottomNavItem>
            </BottomNav>

            <OptionsSheet open={optionsOpen} onClose={() => setOptionsOpen(false)} title="More" closeLabel="Close">
                {/* Every row leads somewhere else, so picking one also closes the sheet. */}
                <div className="contents" onClick={() => setOptionsOpen(false)}>
                    {options}
                </div>
            </OptionsSheet>

            <TitleCard
                title={title}
                eyebrow={eyebrow}
                actions={(
                    <>
                        {titleAside}
                        {onOpenSearch && (
                            <IconButton
                                label="Search everything"
                                icon={Search}
                                onClick={onOpenSearch}
                                onPointerEnter={warmSearchIndex}
                                onFocus={warmSearchIndex}
                            />
                        )}
                    </>
                )}
            />

            <motion.div key={panelKey} role="region" aria-label={title} {...tabPanelMotion}>
                <ErrorBoundary onReset={onResetPanel}>
                    {children}
                </ErrorBoundary>
            </motion.div>

            <AppFooter>ReadVolley · Powered by OpenVolley</AppFooter>
        </AppPage>
    )
}

export default SectionShell
