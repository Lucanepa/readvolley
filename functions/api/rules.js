export async function onRequestGet(context) {
    const url = new URL(context.request.url)
    const articleId = url.searchParams.get('articleId')

    if (!articleId) {
        return Response.json({ error: 'articleId is required' }, { status: 400 })
    }

    const { results } = await context.env.DB.prepare(
        'SELECT * FROM rules WHERE article_id = ? ORDER BY sort_index_rule ASC'
    ).bind(articleId).all()

    return Response.json(results)
}
