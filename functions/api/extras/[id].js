export async function onRequestPut(context) {
    // Auth is checked by middleware
    const id = context.params.id
    const body = await context.request.json()

    // Build dynamic UPDATE from provided fields
    const allowedFields = ['title', 'content', 'image_path', 'link_url', 'type', 'rules_type', 'season', 'tags', 'ssk_name']
    const setClauses = []
    const values = []

    for (const field of allowedFields) {
        if (field in body) {
            setClauses.push(`"${field}" = ?`)
            if (field === 'tags') {
                values.push(JSON.stringify(body.tags || []))
            } else {
                values.push(body[field])
            }
        }
    }

    if (setClauses.length === 0) {
        return Response.json({ error: 'No fields to update' }, { status: 400 })
    }

    values.push(id) // for WHERE clause

    const { results } = await context.env.DB.prepare(
        `UPDATE extras SET ${setClauses.join(', ')} WHERE id = ? RETURNING *`
    ).bind(...values).all()

    if (!results.length) {
        return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const result = results[0]
    if (result.tags && typeof result.tags === 'string') {
        try { result.tags = JSON.parse(result.tags) } catch { result.tags = [] }
    }

    return Response.json([result])
}

export async function onRequestDelete(context) {
    // Auth is checked by middleware
    const id = context.params.id

    const { meta } = await context.env.DB.prepare(
        'DELETE FROM extras WHERE id = ?'
    ).bind(id).run()

    if (meta.changes === 0) {
        return Response.json({ error: 'Not found' }, { status: 404 })
    }

    return Response.json({ success: true })
}
