// Fetches a Volleymanager referee calendar on the browser's behalf.
// Volleymanager's iCal endpoint sends no CORS header, so the resource hub
// cannot read it directly. Only Volleymanager iCal URLs are accepted, so this
// cannot be used as a general-purpose open proxy.
const ALLOWED_HOST = 'volleymanager.volleyball.ch'
const ALLOWED_PATH = /^\/[a-z]+\/iCal\/referee\/[A-Za-z0-9]+\/?$/

export async function onRequestGet(context) {
    const target = new URL(context.request.url).searchParams.get('url')

    let url
    try {
        url = new URL(target)
    } catch {
        return Response.json({ error: 'url is required' }, { status: 400 })
    }

    if (url.protocol !== 'https:' || url.hostname !== ALLOWED_HOST || !ALLOWED_PATH.test(url.pathname)) {
        return Response.json({ error: 'Only Volleymanager referee calendar URLs are allowed' }, { status: 400 })
    }

    const upstream = await fetch(url.toString(), { redirect: 'follow' })
    if (!upstream.ok) {
        return Response.json({ error: `Volleymanager responded with ${upstream.status}` }, { status: 502 })
    }

    return new Response(await upstream.text(), {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Cache-Control': 'private, no-store',
        },
    })
}
