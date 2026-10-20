/**
 * Shared motion vocabulary.
 *
 * Framer Motion's defaults are tuned for standalone elements, not for the
 * accordions and tab panels this app is built from: the default `layout`
 * spring has a long decelerating tail (a card took ~600ms to settle), and
 * animating `height: auto` picks up whatever easing the default tween uses.
 * Keeping the numbers in one place is what stops the app feeling uneven —
 * every reveal should take about a quarter of a second.
 */

const EASE_OUT = [0.4, 0, 0.2, 1]
const DURATION = 0.24

/**
 * The panel behind a tab. Opacity only, and short: the panel fetches its own
 * data on mount, so a longer transition ends up animating an empty box that
 * then reflows as the content lands. No exit animation either — waiting for
 * one to finish before the next panel appears is what made switching tabs
 * feel sluggish.
 */
export const tabPanelMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.16, ease: 'easeOut' },
}

/** A section that expands in place (height 0 <-> auto). */
export const accordionMotion = {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: DURATION, ease: EASE_OUT },
}

/**
 * For cards that grow in place via `layout`. The surrounding cards reflow with
 * them, so this wants to be over quickly rather than springing.
 */
export const expandTransition = { duration: DURATION, ease: EASE_OUT }

/** Content revealed inside an already-open container. */
export const revealMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2, ease: 'easeOut', delay: 0.04 },
}

let pendingScroll = null

/**
 * Brings the header of a section the user just opened to the top of the
 * screen. Opening one section closes the previous one, which can sit above it
 * and shift everything up, so this waits for the accordion to settle first.
 */
export function scrollOpenedToTop(el) {
    if (!el) return
    clearTimeout(pendingScroll)
    pendingScroll = setTimeout(() => {
        const top = el.getBoundingClientRect().top
        if (top >= 0 && top < 80) return
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: window.scrollY + top - 12, behavior: reduce ? 'auto' : 'smooth' })
    }, DURATION * 1000 + 40)
}
