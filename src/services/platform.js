// The Android app (Capacitor, CAPACITOR=true in vite.config.js) bundles only
// the code. Images and documents are Swiss Volley / FIVB material, so they are
// not shipped inside the APK: they load from the site, and the service worker
// keeps a copy for offline use.
export const isNativeApp = import.meta.env.VITE_NATIVE_APP === 'true'

const ASSET_BASE = import.meta.env.VITE_ASSET_URL || ''

/** A file under public/ ("/diagrams_images/…"), from the site in the app. */
export const assetUrl = (path) => `${ASSET_BASE}${path}`

/**
 * Hands a generated file to the user. The browser downloads it; the Android
 * WebView ignores downloads, so the app saves it to its cache and opens the
 * share sheet (save to Files, send by mail, …).
 */
export async function saveFile(blob, filename) {
    if (!isNativeApp) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        return
    }
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([
        import('@capacitor/filesystem'),
        import('@capacitor/share'),
    ])
    const data = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(',')[1])
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
    })
    const { uri } = await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache })
    await Share.share({ title: filename, files: [uri] })
}
