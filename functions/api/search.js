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
    const db = context.env.DB

    const [
        { results: chapters },
        { results: articles },
        { results: rules },
        { results: cases },
        { results: definitions },
        { results: gameProtocols },
        { results: otherProtocols },
        { results: diagrams },
        { results: gestures },
        { results: casebookRules },
        { results: extras },
        { results: guidelines },
    ] = await Promise.all([
        db.prepare('SELECT * FROM chapters').all(),
        db.prepare('SELECT * FROM articles').all(),
        db.prepare('SELECT * FROM rules').all(),
        db.prepare('SELECT * FROM casebook').all(),
        db.prepare('SELECT * FROM definitions').all(),
        db.prepare('SELECT * FROM game_protocol').all(),
        db.prepare('SELECT * FROM other_protocols').all(),
        db.prepare('SELECT * FROM diagrams').all(),
        db.prepare('SELECT * FROM gestures').all(),
        db.prepare('SELECT * FROM casebook_rules').all(),
        db.prepare('SELECT * FROM extras').all(),
        db.prepare('SELECT * FROM guidelines').all(),
    ])

    return Response.json({
        chapters: chapters || [],
        articles: articles || [],
        rules: rules || [],
        cases: cases || [],
        definitions: definitions || [],
        gameProtocols: gameProtocols || [],
        otherProtocols: otherProtocols || [],
        diagrams: diagrams || [],
        gestures: gestures || [],
        casebookRules: casebookRules || [],
        extras: parseTags(extras || []),
        guidelines: guidelines || [],
    })
}
