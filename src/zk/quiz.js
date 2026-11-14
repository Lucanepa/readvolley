// Logic of the ZK prep quiz, ported from the standalone quiz (sv_test shared.js
// and its three mode pages). Question text is verbatim from the Swiss Volley
// e-learning platform and is never altered here; only layout is touched
// (formatQuestionText adds a paragraph break before numbered scenarios).
import { ZK_LANGS, UI_STRINGS } from './strings'
import { assetUrl } from '../services/platform'

// In the Android app (code only, origin https://localhost) these files come from the site.
const BASE = assetUrl('/zk_prep/')

// --- Preferences (best effort: storage may be blocked) ---

const store = {
    get(key) { try { return localStorage.getItem(key) } catch { return null } },
    set(key, value) { try { localStorage.setItem(key, value) } catch { /* ignore */ } },
}

export function getLang() {
    const stored = store.get('zkLang')
    if (ZK_LANGS.includes(stored)) return stored
    const langs = (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language])) || []
    for (const l of langs) {
        const code = String(l || '').split('-')[0].toLowerCase()
        if (ZK_LANGS.includes(code)) return code
    }
    return 'en'
}
export const setLang = (lang) => store.set('zkLang', lang)

export const getLevel = () => (store.get('zkLevel') === 'regional' ? 'regional' : 'national')
export const setLevel = (level) => store.set('zkLevel', level)

export const tr = (lang, key) => UI_STRINGS[lang]?.[key] || UI_STRINGS.en[key] || key

// --- Level filter ---

const NATIONAL_ONLY_ABBREVS = ['NLA', 'NLB', 'LNA', 'LNB', 'LFP', 'GFL', 'JFL', 'LAS']
const NATIONAL_ONLY_KEYWORDS = [
    'escoresheet', 'e-scoresheet', 'escore',
    'ballholer', 'raccattapalle', 'raccoglipalle', 'ramasseur', 'ball boy', 'ball-boy', 'ball retriever',
    'speaker',
    'paletta', 'palette', 'plaquette', 'paddle',
]
const NATIONAL_ONLY_SUBSTRINGS = ['wechseltafel', 'scoorsheet']
const NATIONAL_ONLY_PATTERNS = [
    ...NATIONAL_ONLY_ABBREVS.map(a => new RegExp(`\\b${a}\\b`)),
    ...NATIONAL_ONLY_KEYWORDS.map(k => new RegExp(`\\b${k}`, 'i')),
    ...NATIONAL_ONLY_SUBSTRINGS.map(k => new RegExp(k, 'i')),
]
// Union of matches over all four languages, so the regional pool is identical in every language.
const NATIONAL_ONLY_NUMBERS = new Set([
    1, 13, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
    89, 92, 93, 115, 129, 166, 176, 186, 187, 188, 189, 193, 247,
])

function isNationalOnly(q) {
    if (NATIONAL_ONLY_NUMBERS.has(q.question_number)) return true
    const text = `${q.question} ${Object.values(q.answers).join(' ')}`
    return NATIONAL_ONLY_PATTERNS.some(re => re.test(text))
}

export function filterByLevel(questions, level) {
    if (level === 'national') return questions
    const excluded = new Set()
    questions.forEach(q => {
        if (isNationalOnly(q)) {
            excluded.add(q.question_number)
            if (q.linked_to) excluded.add(q.linked_to)
        }
    })
    return questions.filter(q => !excluded.has(q.question_number) && !(q.linked_to && excluded.has(q.linked_to)))
}

// --- Data ---

const cache = {}

export async function loadQuestions(lang) {
    if (!cache[lang]) {
        cache[lang] = fetch(`${BASE}questions_${lang}.json`).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.json()
        }).catch(err => { delete cache[lang]; throw err })
    }
    const data = await cache[lang]
    return data.map(q => (q.image_url ? { ...q, image_url: `${BASE}${q.image_url}` } : q))
}

// --- Linked questions ---

function buildLinkGroups(questions) {
    const groups = new Map()
    questions.forEach(q => {
        if (q.linked_to) {
            if (!groups.has(q.linked_to)) groups.set(q.linked_to, [])
            groups.get(q.linked_to).push(q)
        }
    })
    groups.forEach(g => g.sort((a, b) => a.link_order - b.link_order))
    return groups
}

const isLinkedTarget = (q, all) => all.some(o => o.linked_to === q.question_number)

/** Card mode: a linked group is one item that walks through its parts. */
export function itemsForCards(questions) {
    const groups = buildLinkGroups(questions)
    const items = []
    questions.forEach(q => {
        if (q.linked_to) {
            if (q.link_order === 1) items.push({ parts: groups.get(q.linked_to) })
        } else if (!isLinkedTarget(q, questions)) {
            items.push({ parts: [q] })
        }
    })
    return items
}

/** Exam/browse: groups of one or more questions, parts in link order. */
export function unitsOf(questions) {
    const groups = buildLinkGroups(questions)
    const done = new Set()
    const units = []
    questions.forEach(q => {
        if (done.has(q.question_number)) return
        if (q.linked_to) {
            const parts = groups.get(q.linked_to)
            parts.forEach(p => done.add(p.question_number))
            units.push(parts)
        } else if (!isLinkedTarget(q, questions)) {
            units.push([q])
        }
    })
    return units
}

// --- Randomness ---

function randoms(n) {
    const out = new Uint32Array(n)
    try { crypto.getRandomValues(out) } catch {
        for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 0x100000000)
    }
    return out
}

export function shuffle(array) {
    const a = array.slice()
    const r = randoms(a.length)
    for (let i = a.length - 1; i > 0; i--) {
        const j = r[i] % (i + 1);
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

/** Efraimidis-Spirakis: heavier items tend to come first, nothing is excluded. */
function weightedShuffle(items, weightOf) {
    const r = randoms(items.length)
    return items
        .map((item, i) => {
            const w = weightOf(item)
            return { item, key: Math.pow((r[i] + 1) / 4294967297, 1 / (w > 0 ? w : 1e-6)) }
        })
        .sort((a, b) => b.key - a.key)
        .map(e => e.item)
}

// --- Exam selection with soft recency ---

const RECENT_KEY = 'recentExamQuestions'
const RECENT_MEMORY = 4
const RECENT_MIN_WEIGHT = 0.3
export const EXAM_SIZE = 25

function getRecentExams() {
    try {
        const stored = JSON.parse(store.get(RECENT_KEY))
        return Array.isArray(stored) ? stored.filter(Array.isArray) : []
    } catch { return [] }
}

function rememberExam(numbers) {
    const exams = getRecentExams()
    exams.unshift(numbers)
    store.set(RECENT_KEY, JSON.stringify(exams.slice(0, RECENT_MEMORY)))
}

const recencyWeight = (age) => (age === undefined ? 1 : RECENT_MIN_WEIGHT + (1 - RECENT_MIN_WEIGHT) * (age - 1) / RECENT_MEMORY)

/** 25 questions; a linked group is taken whole or not at all. */
export function pickExam(questions) {
    const ages = new Map()
    getRecentExams().forEach((nums, i) => nums.forEach(n => { if (!ages.has(n)) ages.set(n, i + 1) }))
    const unitWeight = (unit) => {
        let age
        unit.forEach(q => {
            const a = ages.get(q.question_number)
            if (a !== undefined) age = age === undefined ? a : Math.min(age, a)
        })
        return recencyWeight(age)
    }
    const picked = []
    for (const unit of weightedShuffle(unitsOf(questions), unitWeight)) {
        if (picked.length + unit.length > EXAM_SIZE) continue
        picked.push(...unit)
        if (picked.length === EXAM_SIZE) break
    }
    rememberExam(picked.map(q => q.question_number))
    return picked
}

// --- Grading ---

export function isCorrect(question, selected) {
    return selected.length === question.correct.length && selected.every(a => question.correct.includes(a))
}

export function gradeOf(score) {
    if (score >= 90) return { tier: 'excellent', label: 'sehr_gut' }
    if (score >= 80) return { tier: 'good', label: 'gut' }
    if (score >= 66) return { tier: 'sufficient', label: 'genuegend' }
    return { tier: 'fail', label: 'ungenuegend' }
}

// --- Text helpers ---

export function triagonalRef(q) {
    if (!q || !q.triagonal_quiz) return ''
    return ` (T ${String(q.triagonal_quiz).replace('-', '–')} · Q${q.triagonal_pos})`
}

export const formatQuestionText = (text) => (text ? text.replace(/\?\s+(\d+\.\s)/g, '?\n\n$1') : text)

/** Lowercase, typographic apostrophes folded, diacritics stripped; same length as the input. */
export function normalizeForSearch(text) {
    let out = ''
    const str = String(text)
    for (let i = 0; i < str.length; i++) {
        const ch = str.charAt(i)
        if (ch === '’' || ch === '‘' || ch === '´' || ch === '`') { out += "'"; continue }
        const low = ch.normalize('NFD').charAt(0).toLowerCase()
        out += low.length === 1 ? low : ch
    }
    return out
}

/** Split text into [{ text, hit }] around matches of term (diacritic-insensitive). */
export function highlightParts(text, term) {
    text = String(text)
    const nt = normalizeForSearch(term || '')
    if (!nt) return [{ text, hit: false }]
    const nx = normalizeForSearch(text)
    const parts = []
    let pos = 0
    let idx
    while ((idx = nx.indexOf(nt, pos)) !== -1) {
        if (idx > pos) parts.push({ text: text.slice(pos, idx), hit: false })
        parts.push({ text: text.slice(idx, idx + nt.length), hit: true })
        pos = idx + nt.length
    }
    if (pos < text.length) parts.push({ text: text.slice(pos), hit: false })
    return parts
}
