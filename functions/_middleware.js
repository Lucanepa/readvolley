import { verifyJwt } from './api/_jwt.js'

// /api/login is deliberately excluded from the public CORS policy below.
// Content endpoints stay open (`*`) because they serve public reference data,
// but a wildcard on the login route lets any page on the internet script
// password guessing through its visitors' browsers and read the result.
// Omitting the header entirely makes the preflight fail, so cross-origin
// attempts are blocked; the same-origin admin UI is unaffected.
function isCorsExempt(pathname) {
    return pathname === '/api/login'
}

export async function onRequest(context) {
    const url = new URL(context.request.url)

    // CORS preflight
    if (context.request.method === 'OPTIONS') {
        if (isCorsExempt(url.pathname)) {
            return new Response(null, { status: 204 })
        }
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400',
            },
        })
    }

    const isProtected = url.pathname.startsWith('/api/extras') &&
        ['POST', 'PUT', 'DELETE'].includes(context.request.method)

    if (isProtected) {
        const authHeader = context.request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const token = authHeader.slice(7)
        try {
            const payload = await verifyJwt(token, context.env.JWT_SECRET)
            context.data.user = payload
        } catch {
            return Response.json({ error: 'Invalid or expired token' }, { status: 401 })
        }
    }

    const response = await context.next()

    // Add CORS headers to all responses except the login route (see above)
    const newHeaders = new Headers(response.headers)
    if (!isCorsExempt(url.pathname)) {
        newHeaders.set('Access-Control-Allow-Origin', '*')
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
    })
}
