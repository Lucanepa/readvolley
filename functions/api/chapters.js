export async function onRequestGet(context) {
    const url = new URL(context.request.url)
    const rulesType = url.searchParams.get('rulesType')

    if (!rulesType) {
        return Response.json({ error: 'rulesType is required' }, { status: 400 })
    }

    const { results } = await context.env.DB.prepare(
        `SELECT c.*, (
            SELECT group_concat(a.article_n)
            FROM articles a
            WHERE a.chapter_id = c.id
         ) AS article_numbers
         FROM chapters c
         WHERE c.rules_type = ?
         ORDER BY c.sort_order ASC`
    ).bind(rulesType).all()

    return Response.json(results)
}
