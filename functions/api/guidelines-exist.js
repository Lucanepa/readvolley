export async function onRequestGet(context) {
    const url = new URL(context.request.url)
    const articleId = url.searchParams.get('articleId')
    const ruleIdsParam = url.searchParams.get('ruleIds')

    if (!articleId) {
        return Response.json({ error: 'articleId is required' }, { status: 400 })
    }

    // Check article association
    const { results: artData } = await context.env.DB.prepare(
        'SELECT id FROM guidelines WHERE article_id = ? LIMIT 1'
    ).bind(articleId).all()

    if (artData.length > 0) return Response.json(true)

    // Check rule associations
    const ruleIds = ruleIdsParam ? ruleIdsParam.split(',').filter(Boolean) : []
    if (ruleIds.length > 0) {
        const ph = ruleIds.map(() => '?').join(',')
        const { results: ruleData } = await context.env.DB.prepare(
            `SELECT id FROM guidelines WHERE rule_id IN (${ph}) LIMIT 1`
        ).bind(...ruleIds).all()

        if (ruleData.length > 0) return Response.json(true)
    }

    return Response.json(false)
}
