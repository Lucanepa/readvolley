import { useState, useEffect } from 'react'

// Tabs of the indoor/beach sections, in the order they appear in the tab bar.
export const ENV_TABS = ['rules', 'diagrams', 'definitions', 'protocols', 'hand_signals', 'extra']

// Tabs of the Swiss Volley section. '/swiss_volley' itself shows the overview.
export const SV_TABS = ['ssk_news', 'resource_hub', 'rule_changes_2027', 'multimedia']

const ROUTE_CHANGE = 'route-change'

export function getPath() {
    if (typeof window === 'undefined') return '/'
    return window.location.pathname.replace(/\/+$/, '') || '/'
}

export function navigate(path, { replace = false } = {}) {
    const target = path || '/'
    if (getPath() === target) return
    window.history[replace ? 'replaceState' : 'pushState']({}, '', target)
    window.dispatchEvent(new Event(ROUTE_CHANGE))
}

/**
 * Maps a pathname onto the view the app should render. Unknown paths fall back
 * to the home screen so a stale bookmark never lands on a blank page.
 */
export function parseRoute(path) {
    const segments = path.split('/').filter(Boolean)

    if (segments.length === 0) return { view: 'home' }

    if (segments[0] === 'indoor' || segments[0] === 'beach') {
        const tab = ENV_TABS.includes(segments[1]) ? segments[1] : 'rules'
        return { view: 'env', environment: segments[0], tab }
    }

    if (segments[0] === 'swiss_volley') return { view: 'swiss', tab: null }

    if (SV_TABS.includes(segments[0])) return { view: 'swiss', tab: segments[0] }

    return { view: 'home' }
}

export function useRoute() {
    const [path, setPath] = useState(getPath)

    useEffect(() => {
        const onChange = () => setPath(getPath())
        window.addEventListener('popstate', onChange)
        window.addEventListener(ROUTE_CHANGE, onChange)
        return () => {
            window.removeEventListener('popstate', onChange)
            window.removeEventListener(ROUTE_CHANGE, onChange)
        }
    }, [])

    return parseRoute(path)
}

const TAB_TITLES = {
    rules: 'Rules',
    diagrams: 'Diagrams',
    definitions: 'Definitions',
    protocols: 'Protocols',
    hand_signals: 'Hand Signals',
    extra: 'Extra',
    ssk_news: 'SSK News',
    resource_hub: 'Resource Hub',
    rule_changes_2027: 'Rule Changes 2027',
    multimedia: 'Multimedia',
}

export function routeTitle(route) {
    const base = 'ReadVolley'
    if (route.view === 'env') {
        const env = route.environment === 'beach' ? 'Beach Volleyball' : 'Volleyball'
        return `${TAB_TITLES[route.tab] || 'Rules'} · ${env} · ${base}`
    }
    if (route.view === 'swiss') {
        const tab = route.tab ? `${TAB_TITLES[route.tab]} · ` : ''
        return `${tab}Swiss Volley · ${base}`
    }
    return `${base} · Volleyball Rules`
}
