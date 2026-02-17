export async function onRequestGet(context) {
    const url = new URL(context.request.url)
    const articleId = url.searchParams.get('articleId')
    const ruleIdsParam = url.searchParams.get('ruleIds')

    if (!articleId) {
        return Response.json({ error: 'articleId is required' }, { status: 400 })
    }

    // 1. Get guidelines linked to the article
    const { results: artData } = await context.env.DB.prepare(
        'SELECT * FROM guidelines WHERE article_id = ?'
    ).bind(articleId).all()

    let results = artData || []

    // 2. Get guidelines linked to rules
    const ruleIds = ruleIdsParam ? ruleIdsParam.split(',').filter(Boolean) : []
    if (ruleIds.length > 0) {
        const ph = ruleIds.map(() => '?').join(',')
        const { results: ruleData } = await context.env.DB.prepare(
            `SELECT * FROM guidelines WHERE rule_id IN (${ph})`
        ).bind(...ruleIds).all()

        // Merge and deduplicate
        if (ruleData) {
            const existingIds = new Set(results.map(g => g.id))
            ruleData.forEach(g => {
                if (!existingIds.has(g.id)) {
                    results.push(g)
                }
            })
        }
    }

    return Response.json(results)
}
