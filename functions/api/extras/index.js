function parseTags(rows) {
    return rows.map(row => {
        if (row.tags && typeof row.tags === 'string') {
            try { row.tags = JSON.parse(row.tags) }
            catch { row.tags = [] }
        }
        return row
    })
}

export async function onRequestGet(context) {
    const url = new URL(context.request.url)
    const rulesType = url.searchParams.get('rulesType')

    if (!rulesType) {
        return Response.json({ error: 'rulesType is required' }, { status: 400 })
    }

    const { results } = await context.env.DB.prepare(
        'SELECT * FROM extras WHERE rules_type = ? ORDER BY created_at DESC'
    ).bind(rulesType).all()

    return Response.json(parseTags(results))
}

export async function onRequestPost(context) {
    // Auth is checked by middleware
    const body = await context.request.json()
    const { title, content, image_path, link_url, type, rules_type, season, tags, ssk_name } = body

    if (!title || !rules_type) {
        return Response.json({ error: 'title and rules_type are required' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const tagsJson = JSON.stringify(tags || [])

    const { results } = await context.env.DB.prepare(
        `INSERT INTO extras (id, title, content, image_path, link_url, type, rules_type, season, tags, ssk_name, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
         RETURNING *`
    ).bind(id, title, content || null, image_path || null, link_url || null, type || 'post', rules_type, season || null, tagsJson, ssk_name || null).all()

    const result = results[0]
    if (result.tags && typeof result.tags === 'string') {
        try { result.tags = JSON.parse(result.tags) } catch { result.tags = [] }
    }

    return Response.json([result], { status: 201 })
}
