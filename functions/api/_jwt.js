// JWT sign/verify using Web Crypto API (HMAC-SHA256)
// No external libraries needed — runs natively in Cloudflare Workers

const ALGORITHM = { name: 'HMAC', hash: 'SHA-256' }
const ENCODER = new TextEncoder()

function base64url(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(str) {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - str.length % 4) % 4)
    return Uint8Array.from(atob(padded), c => c.charCodeAt(0))
}

async function getKey(secret) {
    return crypto.subtle.importKey(
        'raw', ENCODER.encode(secret), ALGORITHM, false, ['sign', 'verify']
    )
}

export async function signJwt(payload, secret, expiresIn = '7d') {
    const header = { alg: 'HS256', typ: 'JWT' }

    // Parse expiry
    const match = expiresIn.match(/^(\d+)([dhm])$/)
    const multipliers = { d: 86400, h: 3600, m: 60 }
    const expSeconds = match ? parseInt(match[1]) * multipliers[match[2]] : 86400

    const now = Math.floor(Date.now() / 1000)
    const fullPayload = { ...payload, iat: now, exp: now + expSeconds }

    const headerB64 = base64url(ENCODER.encode(JSON.stringify(header)))
    const payloadB64 = base64url(ENCODER.encode(JSON.stringify(fullPayload)))
    const data = `${headerB64}.${payloadB64}`

    const key = await getKey(secret)
    const sig = await crypto.subtle.sign('HMAC', key, ENCODER.encode(data))

    return `${data}.${base64url(sig)}`
}

export async function verifyJwt(token, secret) {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('Invalid token')

    const [headerB64, payloadB64, sigB64] = parts
    const data = `${headerB64}.${payloadB64}`

    const key = await getKey(secret)
    const sig = base64urlDecode(sigB64)
    const valid = await crypto.subtle.verify('HMAC', key, sig, ENCODER.encode(data))

    if (!valid) throw new Error('Invalid signature')

    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)))

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired')
    }

    return payload
}
