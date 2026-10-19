import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        proxy: {
            '/api': 'http://localhost:8788'
        }
    },
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico'],
            workbox: {
                // Precache the app shell and every static asset — diagrams,
                // hand signals, hub documents — so the PWA works fully
                // offline after the first visit. The rules data itself is
                // cached by services/api.js.
                globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff2,pdf,webmanifest}'],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                cleanupOutdatedCaches: true,
                navigateFallback: 'index.html',
                navigateFallbackDenylist: [/^\/api\//],
                runtimeCaching: [
                    {
                        // Uploaded extra/news images are not in the build.
                        urlPattern: ({ sameOrigin, url }) => sameOrigin && /^\/(extra_images|multimedia)\//.test(url.pathname),
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'readvolley-media',
                            expiration: { maxEntries: 200 },
                        },
                    },
                ],
            },
            manifest: {
                name: 'Volleyball Rules',
                short_name: 'ReadVolley',
                description: 'Voleyball rules and casebook for Beach and Indoor',
                theme_color: '#e2001a',
                background_color: '#f5f5f4',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
})
