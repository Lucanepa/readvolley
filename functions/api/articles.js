export async function onRequestGet(context) {
    const url = new URL(context.request.url)
    const chapterId = url.searchParams.get('chapterId')

    if (!chapterId) {
        return Response.json({ error: 'chapterId is required' }, { status: 400 })
    }

    const { results } = await context.env.DB.prepare(
        'SELECT * FROM articles WHERE chapter_id = ? ORDER BY CAST(article_n AS INTEGER) ASC, article_n ASC'
    ).bind(chapterId).all()

    return Response.json(results)
}
