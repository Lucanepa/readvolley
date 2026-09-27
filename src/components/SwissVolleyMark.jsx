import React from 'react'

// Lucide's "volleyball" icon — not in the lucide-react version we ship.
function VolleyballIcon({ size }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11.1 7.1a16.55 16.55 0 0 1 10.9 4" />
            <path d="M12 12a12.6 12.6 0 0 1-8.7 5" />
            <path d="M16.8 13.6a16.55 16.55 0 0 1-9 7.5" />
            <path d="M20.7 17a12.8 12.8 0 0 0-8.7-5 13.3 13.3 0 0 1 0-10" />
            <path d="M6.3 3.8a16.55 16.55 0 0 0 1.9 11.5" />
            <circle cx="12" cy="12" r="10" />
        </svg>
    )
}

function SwissFlag({ size }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="4" fill="#DA291C" />
            <path d="M13 6h6v7h7v6h-7v7h-6v-7H6v-6h7z" fill="#fff" />
        </svg>
    )
}

// Text mark used in place of the official Swiss Volley logo.
export default function SwissVolleyMark({ fontSize = '1.5rem' }) {
    return (
        <span
            role="img"
            aria-label="Swiss Volley"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45em',
                fontSize,
                fontWeight: '900',
                fontFamily: 'Outfit, sans-serif',
                lineHeight: 1,
                whiteSpace: 'nowrap'
            }}
        >
            <VolleyballIcon size="1.1em" />
            <span aria-hidden="true">Swiss Volley</span>
            <SwissFlag size="1em" />
        </span>
    )
}
