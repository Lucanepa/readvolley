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

const safeToken = (s) => (s || 'unknown').toString().trim().replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '')

export const api = {
    async getChapters(rulesType) {
        return fetchJson(`/api/chapters?rulesType=${encodeURIComponent(rulesType)}`)
    },

    async getArticles(chapterId) {
        return fetchJson(`/api/articles?chapterId=${encodeURIComponent(chapterId)}`)
    },

    async getRules(articleId) {
        return fetchJson(`/api/rules?articleId=${encodeURIComponent(articleId)}`)
    },

    async getCasebookForRules(ruleIds) {
        if (!ruleIds?.length) return []
        return fetchJson(`/api/casebook?ruleIds=${ruleIds.join(',')}`)
    },

    async getCasebookData(ruleIds) {
        if (!ruleIds || ruleIds.length === 0) return {}
        return fetchJson(`/api/casebook-data?ruleIds=${ruleIds.join(',')}`)
    },

    async getGuidelinesForArticle(articleId, ruleIds = []) {
        return fetchJson(`/api/guidelines?articleId=${encodeURIComponent(articleId)}&ruleIds=${ruleIds.join(',')}`)
    },

    async getGuidelinesExistence(articleId, ruleIds = []) {
        return fetchJson(`/api/guidelines-exist?articleId=${encodeURIComponent(articleId)}&ruleIds=${ruleIds.join(',')}`)
    },

    async getDefinitions(rulesType) {
        return fetchJson(`/api/definitions?rulesType=${encodeURIComponent(rulesType)}`)
    },

    async getDiagrams(rulesType) {
        const data = await fetchJson(`/api/diagrams?rulesType=${encodeURIComponent(rulesType)}`)
        return data.map(diagram => ({
            ...diagram,
            url: `/diagrams_images/diagram_${safeToken(diagram.diagram_n)}_${safeToken(diagram.rules_type)}.png`
        }))
    },

    async getGestures(rulesType) {
        const data = await fetchJson(`/api/gestures?rulesType=${encodeURIComponent(rulesType)}`)
        return data.map(gesture => ({
            ...gesture,
            url: `/gestures_images/gesture_${safeToken(gesture.gesture_n)}_${safeToken(gesture.rules_type)}.png`
        }))
    },

    async getProtocols(rulesType) {
        return fetchJson(`/api/protocols?rulesType=${encodeURIComponent(rulesType)}`)
    },

    async getAllSearchData() {
        return fetchJson('/api/search')
    },

    async updateExtra(id, updates) {
        return fetchJson(`/api/extras/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        })
    },

    async deleteExtra(id) {
        await fetchJson(`/api/extras/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        })
        return true
    },

    async getExtras(rulesType) {
        return fetchJson(`/api/extras?rulesType=${encodeURIComponent(rulesType)}`)
    },

    async addExtra(extraData) {
        return fetchJson('/api/extras', {
            method: 'POST',
            body: JSON.stringify(extraData),
        })
    },
}
