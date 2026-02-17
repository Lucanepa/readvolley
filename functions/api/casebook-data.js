export async function onRequestGet(context) {
    const url = new URL(context.request.url)
    const ruleIdsParam = url.searchParams.get('ruleIds')

    if (!ruleIdsParam) {
        return Response.json({ error: 'ruleIds is required' }, { status: 400 })
    }

    const ruleIds = ruleIdsParam.split(',').filter(Boolean)
    if (ruleIds.length === 0) return Response.json({})

    // 1. Get mapping from junction table
    const ph1 = ruleIds.map(() => '?').join(',')
    const { results: junctionData } = await context.env.DB.prepare(
        `SELECT rule_id, casebook_id FROM casebook_rules WHERE rule_id IN (${ph1})`
    ).bind(...ruleIds).all()

    if (!junctionData.length) return Response.json({})

    // 2. Get casebook details
    const casebookIds = [...new Set(junctionData.map(j => j.casebook_id))]
    const ph2 = casebookIds.map(() => '?').join(',')
    const { results: casebookDetails } = await context.env.DB.prepare(
        `SELECT id, case_number FROM casebook WHERE id IN (${ph2})`
    ).bind(...casebookIds).all()

    // 3. Map rule IDs to their associated case numbers
    const idToCaseNum = {}
    casebookDetails.forEach(c => {
        idToCaseNum[c.id] = c.case_number
    })

    const ruleToCases = {}
    junctionData.forEach(item => {
        const ruleId = item.rule_id
        const caseNum = idToCaseNum[item.casebook_id]?.toString()

        if (ruleId && caseNum) {
            if (!ruleToCases[ruleId]) {
                ruleToCases[ruleId] = []
            }
            if (!ruleToCases[ruleId].includes(caseNum)) {
                ruleToCases[ruleId].push(caseNum)
            }
        }
    })

    return Response.json(ruleToCases)
}
