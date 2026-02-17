export async function onRequestGet(context) {
    const url = new URL(context.request.url)
    const rulesType = url.searchParams.get('rulesType')

    if (!rulesType) {
        return Response.json({ error: 'rulesType is required' }, { status: 400 })
    }

    const { results } = await context.env.DB.prepare(
        'SELECT * FROM diagrams WHERE rules_type = ? ORDER BY diagram_order ASC'
    ).bind(rulesType).all()

    return Response.json(results)
}
