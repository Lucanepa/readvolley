import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

// Shown in the home screen footer; the Android versionName must match it.
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

// CAPACITOR=true builds the Android app's bundle (dist-capacitor). It holds
// only the code: the WebView's origin is https://localhost, so the API and the
// images and documents (Swiss Volley / FIVB material, not ours to ship inside
// the APK) come from the site. No .env file is read, so F-Droid's build from
// source matches ours byte for byte.
const capacitor = process.env.CAPACITOR === 'true'
const SITE = 'https://readvolley.openvolley.app'
if (capacitor) {
    process.env.VITE_NATIVE_APP = 'true'
    process.env.VITE_API_URL = SITE
    process.env.VITE_ASSET_URL = SITE
}

// https://vitejs.dev/config/
export default defineConfig({
    define: { __APP_VERSION__: JSON.stringify(version) },
    ...(capacitor && {
        envDir: 'android/no-env',
        publicDir: false,
        build: { outDir: 'dist-capacitor', emptyOutDir: true },
    }),
    server: {
        proxy: {
            '/api': 'http://localhost:8788'
        }
    },
    plugins: [
        react(),
        tailwindcss(),
        // Cloudflare's hotlink protection answers 403 to image requests whose
        // Referer is another site, and the app's pages are https://localhost.
        // An empty Referer is allowed, so the app sends none.
        capacitor && {
            name: 'no-referrer',
            transformIndexHtml: (html) => html.replace('<head>', '<head>\n  <meta name="referrer" content="no-referrer" />'),
        },
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: capacitor ? [] : ['favicon.ico', 'apple-touch-icon.png'],
            workbox: {
                // Precache the app shell and every static asset — diagrams,
                // hand signals, hub documents — so the PWA works fully
                // offline after the first visit. The rules data itself is
                // cached by services/api.js.
                // In the app the code is already local: precaching it would
                // keep serving the previous version after an update, so the
                // app's worker only keeps the site's images (below).
                globPatterns: capacitor ? [] : ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff2,pdf,webmanifest}'],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                cleanupOutdatedCaches: true,
                navigateFallback: capacitor ? null : 'index.html',
                navigateFallbackDenylist: [/^\/api\//],
                runtimeCaching: [
                    // The app loads images from the site; keep the ones seen
                    // so they still show offline. Fetched in CORS mode (the
                    // site allows any origin) so the cached copy is a real
                    // response, and without a Referer (hotlink protection,
                    // see above). The handler is copied into sw.js as source,
                    // so it uses nothing from this file.
                    ...(capacitor ? [{
                        urlPattern: ({ url }) => url.origin === 'https://readvolley.openvolley.app' && /^\/(diagrams_images|gestures_images|extra_images|multimedia)\//.test(url.pathname),
                        handler: async ({ request }) => {
                            const cache = await caches.open('readvolley-site-images')
                            const hit = await cache.match(request.url)
                            if (hit) return hit
                            const res = await fetch(request.url, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer' })
                            if (res.ok) await cache.put(request.url, res.clone())
                            return res
                        },
                    }] : []),
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
                id: '/',
                name: 'ReadVolley',
                short_name: 'ReadVolley',
                description: 'Volleyball rules, casebook and referee guidelines for indoor and beach',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                theme_color: '#e2001a',
                background_color: '#f5f5f4',
                icons: [
                    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
                    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
                    // The logo sits well inside the safe zone on its own dark square.
                    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ]
            }
        })
    ],
})
