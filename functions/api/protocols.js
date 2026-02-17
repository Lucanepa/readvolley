export async function onRequestGet(context) {
    const url = new URL(context.request.url)
    const rulesType = url.searchParams.get('rulesType')

    if (!rulesType) {
        return Response.json({ error: 'rulesType is required' }, { status: 400 })
    }

    const { results: gameProtocol } = await context.env.DB.prepare(
        'SELECT * FROM game_protocol WHERE rules_type = ? ORDER BY sort_order ASC'
    ).bind(rulesType).all()

    const { results: otherProtocols } = await context.env.DB.prepare(
        'SELECT * FROM other_protocols'
    ).all()

    return Response.json({ gameProtocol, otherProtocols })
}
