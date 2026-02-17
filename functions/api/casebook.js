export async function onRequestGet(context) {
    const url = new URL(context.request.url)
    const ruleIdsParam = url.searchParams.get('ruleIds')

    if (!ruleIdsParam) {
        return Response.json({ error: 'ruleIds is required' }, { status: 400 })
    }

    const ruleIds = ruleIdsParam.split(',').filter(Boolean)
    if (ruleIds.length === 0) return Response.json([])

    // 1. Get casebook IDs from junction table
    const ph1 = ruleIds.map(() => '?').join(',')
    const { results: junctionData } = await context.env.DB.prepare(
        `SELECT casebook_id FROM casebook_rules WHERE rule_id IN (${ph1})`
    ).bind(...ruleIds).all()

    if (!junctionData.length) return Response.json([])

    const casebookIds = [...new Set(junctionData.map(j => j.casebook_id))]

    // 2. Get full casebook records
    const ph2 = casebookIds.map(() => '?').join(',')
    const { results: cases } = await context.env.DB.prepare(
        `SELECT * FROM casebook WHERE id IN (${ph2})`
    ).bind(...casebookIds).all()

    return Response.json(cases)
}
