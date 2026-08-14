import { signJwt } from './_jwt.js'

// Per-IP login throttling. Backed by the `login_attempts` table in schema.sql.
const MAX_FAILS = 8          // failures allowed inside one window
const WINDOW_SECONDS = 900   // 15 min — failures older than this decay away
const LOCKOUT_SECONDS = 900  // 15 min lockout once MAX_FAILS is reached

// Length-independent comparison, so response timing does not leak the password.
function safeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false
    const enc = new TextEncoder()
    const ab = enc.encode(a)
    const bb = enc.encode(b)
    // Fold the length difference into the accumulator and always walk the
    // longer input, so the loop never short-circuits on a mismatch.
    let diff = ab.length ^ bb.length
    const len = Math.max(ab.length, bb.length)
    for (let i = 0; i < len; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0)
    return diff === 0
}

export async function onRequestPost(context) {
    const db = context.env.DB
    const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown'
    const now = Math.floor(Date.now() / 1000)

    // Throttle check. If the table is missing (migration not yet applied) we
    // fail OPEN rather than lock the admin out of their own site — but the
    // constant-time compare below still applies.
    let row = null
    try {
        row = await db.prepare(
            'SELECT fails, window_start, locked_until FROM login_attempts WHERE ip = ?'
        ).bind(ip).first()
    } catch {
        row = null
    }

    if (row && row.locked_until > now) {
        const retryAfter = row.locked_until - now
        return Response.json(
            { error: 'Too many attempts. Try again later.' },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        )
    }

    let password = null
    try {
        ({ password } = await context.request.json())
    } catch {
        password = null
    }

    const expected = context.env.ADMIN_PASSWORD
    const ok = Boolean(expected) && safeEqual(password ?? '', expected)

    if (!ok) {
        // Count the failure. A window older than WINDOW_SECONDS resets the count,
        // so occasional typos never accumulate into a lockout.
        try {
            const inWindow = row && now - row.window_start < WINDOW_SECONDS
            const fails = inWindow ? row.fails + 1 : 1
            const windowStart = inWindow ? row.window_start : now
            const lockedUntil = fails >= MAX_FAILS ? now + LOCKOUT_SECONDS : 0
            await db.prepare(
                `INSERT INTO login_attempts (ip, fails, window_start, locked_until)
                 VALUES (?, ?, ?, ?)
                 ON CONFLICT(ip) DO UPDATE SET
                   fails = excluded.fails,
                   window_start = excluded.window_start,
                   locked_until = excluded.locked_until`
            ).bind(ip, fails, windowStart, lockedUntil).run()
        } catch {
            // Throttle table unavailable — do not block the login path.
        }
        return Response.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Success clears the counter for this IP.
    try {
        await db.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run()
    } catch {
        // Non-fatal.
    }

    const token = await signJwt({ role: 'admin' }, context.env.JWT_SECRET, '7d')
    return Response.json({ token })
}
