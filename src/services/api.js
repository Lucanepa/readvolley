const API_BASE = import.meta.env.VITE_API_URL || ''

function getAuthHeaders() {
    const token = localStorage.getItem('admin_token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
}

async function fetchJson(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers,
        },
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error || res.statusText)
    }
    return res.json()
}

// The whole reference dataset (rules, casebook, guidelines, diagrams, …) is
// one ~1.2 MB download from /api/search. It is fetched once, kept in the Cache
// API so the app works offline, and every read below is answered from it. A
// cached copy is served immediately and refreshed from the network behind it.
const DATASET_URL = '/api/search'
const DATASET_CACHE = 'readvolley-data-v1'

let dataset = null
let datasetPromise = null

async function readCachedDataset() {
    try {
        if (typeof caches === 'undefined') return null
        const cache = await caches.open(DATASET_CACHE)
        const res = await cache.match(DATASET_URL)
        return res ? await res.json() : null
    } catch {
        return null
    }
}

async function fetchDataset() {
    const res = await fetch(`${API_BASE}${DATASET_URL}`, { cache: 'no-store' })
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error || res.statusText)
    }
    const copy = res.clone()
    const data = await res.json()
    try {
        if (typeof caches !== 'undefined') {
            const cache = await caches.open(DATASET_CACHE)
            await cache.put(DATASET_URL, copy)
        }
    } catch {
        // Storage can be unavailable (private mode, quota); stay online-only.
    }
    dataset = data
    return data
}

function loadDataset() {
    if (dataset) return Promise.resolve(dataset)
    if (!datasetPromise) {
        datasetPromise = (async () => {
            const cached = await readCachedDataset()
            if (cached) {
                dataset = cached
                if (typeof navigator === 'undefined' || navigator.onLine !== false) {
                    fetchDataset().catch(() => {})
                }
                return cached
            }
            return fetchDataset()
        })().catch(err => {
            datasetPromise = null
            throw err
        })
    }
    return datasetPromise
}

// After an admin edit, wait for the fresh copy so the next read shows it.
async function refreshDataset() {
    try {
        await fetchDataset()
    } catch (err) {
        console.error('api: could not refresh the dataset after an edit', err)
    }
}

const same = (a, b) => a != null && b != null && String(a) === String(b)

// SQLite ordering: NULL sorts first, numbers numerically, text bytewise.
const compare = (a, b) => {
    if (a == null) return b == null ? 0 : -1
    if (b == null) return 1
    if (typeof a === 'number' && typeof b === 'number') return a - b
    const x = String(a)
    const y = String(b)
    return x < y ? -1 : x > y ? 1 : 0
}

const sortBy = (rows, ...keys) => [...rows].sort((a, b) => {
    for (const key of keys) {
        const diff = compare(key(a), key(b))
        if (diff) return diff
    }
    return 0
})

// CAST(x AS INTEGER): the leading integer, or 0 when there is none.
const castInt = (value) => {
    const match = /^\s*[+-]?\d+/.exec(String(value ?? ''))
    return match ? parseInt(match[0], 10) : 0
}

// "9.2.10" -> keys for 9, 2 and 10, so dotted numbers sort numerically.
const numberParts = (value) => [0, 1, 2].map(i => (row) => castInt(String(value(row) ?? '').split('.')[i]))

function guidelinesFor(data, articleId, ruleIds) {
    const ruleSet = new Set(ruleIds.map(String))
    const bySection = numberParts(g => g.section)
    const byArticle = sortBy(data.guidelines.filter(g => same(g.article_id, articleId)), ...bySection)
    const seen = new Set(byArticle.map(g => g.id))
    const byRule = sortBy(data.guidelines.filter(g => g.rule_id != null && ruleSet.has(String(g.rule_id)) && !seen.has(g.id)), g => g.rule_id, ...bySection)
    return [...byArticle, ...byRule]
}

const safeToken = (s) => (s || 'unknown').toString().trim().replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '')

export const api = {
    /** Starts the one-off dataset download (or cache read) at app start. */
    preload() {
        return loadDataset()
    },

    async getChapters(rulesType) {
        const data = await loadDataset()
        return sortBy(data.chapters.filter(c => same(c.rules_type, rulesType)), c => c.sort_order)
            .map(chapter => {
                const numbers = data.articles.filter(a => same(a.chapter_id, chapter.id)).map(a => a.article_n)
                return { ...chapter, article_numbers: numbers.length ? numbers.join(',') : null }
            })
    },

    async getArticles(chapterId) {
        const data = await loadDataset()
        return sortBy(data.articles.filter(a => same(a.chapter_id, chapterId)), a => castInt(a.article_n), a => a.article_n)
    },

    async getRules(articleId) {
        const data = await loadDataset()
        return sortBy(data.rules.filter(r => same(r.article_id, articleId)), r => r.sort_index_rule)
    },

    async getCasebookForRules(ruleIds) {
        if (!ruleIds?.length) return []
        const data = await loadDataset()
        const ruleSet = new Set(ruleIds.map(String))
        const caseIds = new Set(data.casebookRules.filter(j => ruleSet.has(String(j.rule_id))).map(j => String(j.casebook_id)))
        return sortBy(data.cases.filter(c => caseIds.has(String(c.id))), ...numberParts(c => c.case_number))
    },

    async getCasebookData(ruleIds) {
        if (!ruleIds || ruleIds.length === 0) return {}
        const data = await loadDataset()
        const ruleSet = new Set(ruleIds.map(String))
        const caseNumber = new Map(data.cases.map(c => [String(c.id), c.case_number]))
        const ruleToCases = {}
        data.casebookRules.forEach(({ rule_id: ruleId, casebook_id: casebookId }) => {
            if (!ruleId || !ruleSet.has(String(ruleId))) return
            const caseNum = caseNumber.get(String(casebookId))?.toString()
            if (!caseNum) return
            if (!ruleToCases[ruleId]) ruleToCases[ruleId] = []
            if (!ruleToCases[ruleId].includes(caseNum)) ruleToCases[ruleId].push(caseNum)
        })
        return ruleToCases
    },

    async getGuidelinesForArticle(articleId, ruleIds = []) {
        const data = await loadDataset()
        return guidelinesFor(data, articleId, ruleIds)
    },

    async getGuidelinesExistence(articleId, ruleIds = []) {
        const data = await loadDataset()
        return guidelinesFor(data, articleId, ruleIds).length > 0
    },

    async getDefinitions(rulesType) {
        const data = await loadDataset()
        return data.definitions.filter(d => same(d.rules_type, rulesType))
    },

    async getDiagrams(rulesType) {
        const data = await loadDataset()
        return sortBy(data.diagrams.filter(d => same(d.rules_type, rulesType)), d => d.diagram_order).map(diagram => ({
            ...diagram,
            url: `/diagrams_images/diagram_${safeToken(diagram.diagram_n)}_${safeToken(diagram.rules_type)}.png`
        }))
    },

    async getGestures(rulesType) {
        const data = await loadDataset()
        return sortBy(data.gestures.filter(g => same(g.rules_type, rulesType)), g => g.gesture_order).map(gesture => ({
            ...gesture,
            url: `/gestures_images/gesture_${safeToken(gesture.gesture_n)}_${safeToken(gesture.rules_type)}.png`
        }))
    },

    async getProtocols(rulesType) {
        const data = await loadDataset()
        return {
            gameProtocol: sortBy(data.gameProtocols.filter(p => same(p.rules_type, rulesType)), p => p.sort_order),
            otherProtocols: data.otherProtocols,
        }
    },

    async getAllSearchData() {
        return loadDataset()
    },

    async updateExtra(id, updates) {
        const result = await fetchJson(`/api/extras/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        })
        await refreshDataset()
        return result
    },

    async deleteExtra(id) {
        await fetchJson(`/api/extras/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        })
        await refreshDataset()
        return true
    },

    async getExtras(rulesType) {
        const data = await loadDataset()
        return sortBy(data.extras.filter(e => same(e.rules_type, rulesType)), e => e.created_at).reverse()
    },

    async addExtra(extraData) {
        const result = await fetchJson('/api/extras', {
            method: 'POST',
            body: JSON.stringify(extraData),
        })
        await refreshDataset()
        return result
    },
}
