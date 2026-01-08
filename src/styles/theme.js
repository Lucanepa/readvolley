export const theme = {
    colors: {
        beach: {
            primary: '#f59e0b',
            secondary: '#d97706',
        },
        indoor: {
            primary: '#3b82f6',
            secondary: '#2563eb',
        },
        bg: {
            darker: '#050505',
            dark: '#0a0a0a',
            surface: '#1a1a1a',
            hover: '#2a2a2a',
        },
        text: {
            primary: '#ffffff',
            secondary: '#a1a1aa',
            muted: '#71717a',
        },
        border: {
            subtle: '#333333',
        }
    },
    spacing: {
        headerHeight: '2.5rem',
        footerHeight: '3.5rem', // Slightly larger for mobile tap targets
    },
    styles: {
        glass: {
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(0.75rem)',
            WebkitBackdropFilter: 'blur(0.75rem)',
            border: '0.0625rem solid #333333',
        },
        container: {
            width: '100%',
            maxWidth: '75rem',
            margin: '0 auto',
            padding: '0 1rem',
        }
    }
}
