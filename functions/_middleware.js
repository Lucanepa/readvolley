import { verifyJwt } from './api/_jwt.js'

export async function onRequest(context) {
    // CORS preflight
    if (context.request.method === 'OPTIONS') {
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

    const url = new URL(context.request.url)
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

    // Add CORS headers to all responses
    const newHeaders = new Headers(response.headers)
    newHeaders.set('Access-Control-Allow-Origin', '*')

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
    })
}
