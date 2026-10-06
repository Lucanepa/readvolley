import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, BookOpen, Loader2, FileQuestion, PlayCircle } from 'lucide-react'
import { api } from './services/api'
import { accordionMotion } from './styles/motion'
import { Card, Skeleton, EmptyState, Notice, FOCUS_RING, FOCUS_RING_INSET, cn } from './ui/volleyui'

const articleNumber = (n) => {
    const parsed = parseInt(n, 10)
    return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed
}

const sortArticles = (list) => [...list].sort((a, b) => articleNumber(a.article_n) - articleNumber(b.article_n))

// "8,9,10,...,14" -> "8-14", non-contiguous sets stay explicit: "1-3, 7"
const formatArticleRange = (numbers) => {
    const nums = [...new Set(numbers.map(articleNumber))].filter(n => n !== Number.MAX_SAFE_INTEGER).sort((a, b) => a - b)
    if (!nums.length) return null

    const groups = []
    let start = nums[0]
    let prev = nums[0]
    for (const n of nums.slice(1)) {
        if (n !== prev + 1) {
            groups.push([start, prev])
            start = n
        }
        prev = n
    }
    groups.push([start, prev])

    return groups.map(([from, to]) => (from === to ? `${from}` : `${from}\u2013${to}`)).join(', ')
}

// Chapter number. Inverted (slate-900) while its chapter is open — selection,
// not brand red.
function NumberBadge({ active, children }) {
    return (
        <span className={cn(
            'flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg px-1.5 text-xs font-semibold tabular-nums transition-colors',
            active ? 'bg-slate-900 text-white' : 'bg-stone-100 text-stone-600',
        )}>
            {children}
        </span>
    )
}

// Stands in for the chevron while a section is fetching, so a click is
// acknowledged even when the content takes a moment to arrive.
function ToggleIndicator({ pending, open, sideways = false }) {
    if (pending) return <Loader2 size={18} className="shrink-0 animate-spin text-stone-400" aria-label="Loading" />
    const Icon = sideways ? ChevronRight : ChevronDown
    return (
        <Icon
            size={18}
            aria-hidden
            className={cn('shrink-0 text-stone-400 transition-transform', open && (sideways ? 'rotate-90' : 'rotate-180'))}
        />
    )
}

function GuidelinesToggle({ open, pending, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-expanded={open}
            aria-busy={pending || undefined}
            className={cn(
                'inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors sm:w-auto',
                open
                    ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                    : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50',
                FOCUS_RING,
            )}
        >
            {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <BookOpen size={16} aria-hidden />}
            Referee guidelines and instructions
            <ChevronDown size={16} aria-hidden className={cn('transition-transform', open && 'rotate-180')} />
        </button>
    )
}

function InlineLoading({ children }) {
    return (
        <div className="flex items-center gap-2 py-3 text-xs text-stone-500" role="status">
            <Loader2 size={14} className="animate-spin text-stone-400" aria-hidden />
            {children}
        </div>
    )
}

// Same shape as the chapter list, so nothing jumps when the data lands.
function ChaptersSkeleton() {
    return (
        <Card pad="flush" role="status" aria-busy="true" aria-label="Loading rules">
            <div className="divide-y divide-stone-100">
                {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="flex min-h-14 items-center gap-3 px-4 py-3 sm:px-5">
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3.5 w-1/2" />
                            <Skeleton className="h-3 w-1/5" />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}

function RulesView({ environment }) {
    const [chapters, setChapters] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedChapter, setExpandedChapter] = useState(null)
    const [expandedArticle, setExpandedArticle] = useState(null)
    const [articles, setArticles] = useState({})
    const [rules, setRules] = useState({})
    const [casebookData, setCasebookData] = useState({}) // Mapping: ruleId -> [caseNumbers]
    const [expandedRuleCases, setExpandedRuleCases] = useState(null) // ID of rule whose cases are expanded
    const [fullCases, setFullCases] = useState({}) // Mapping: ruleId -> [caseDetails]
    const [articleHasGuidelines, setArticleHasGuidelines] = useState({}) // articleId -> boolean
    const [articleGuidelines, setArticleGuidelines] = useState({}) // articleId -> [guidelineDetails]
    const [expandedArticleGuidelines, setExpandedArticleGuidelines] = useState(null) // ID of article whose guidelines are expanded
    const [pendingId, setPendingId] = useState(null) // row waiting for its content before it opens
    const openRequest = useRef(null) // guards against a slow fetch opening a row the user has moved on from

    const [loadError, setLoadError] = useState(null)

    useEffect(() => {
        loadChapters()
    }, [environment])

    const loadChapters = async () => {
        setLoading(true)
        setLoadError(null)
        try {
            const data = await api.getChapters(environment)
            setChapters(data)
        } catch (e) {
            console.error(e)
            setLoadError(e)
        } finally {
            setLoading(false)
        }
    }

    // Sections open only once their content is in hand. Opening first and
    // fetching after animates an empty panel open a few pixels, then jumps
    // again when the data lands — one click, two separate movements.
    const toggleChapter = async (chapterId) => {
        if (expandedChapter === chapterId) {
            setExpandedChapter(null)
            return
        }
        if (articles[chapterId]) {
            setExpandedChapter(chapterId)
            return
        }

        openRequest.current = chapterId
        setPendingId(chapterId)
        try {
            const data = await api.getArticles(chapterId)
            setArticles(prev => ({ ...prev, [chapterId]: sortArticles(data) }))
        } catch (e) {
            console.error(e)
        }
        if (openRequest.current !== chapterId) return
        setPendingId(null)
        setExpandedChapter(chapterId)
    }

    const toggleArticle = async (articleId) => {
        if (expandedArticle === articleId) {
            setExpandedArticle(null)
            return
        }
        // Everything the open article renders is fetched before it opens.
        let currentRules = rules[articleId]
        const cached = currentRules && articleHasGuidelines[articleId] !== undefined
        if (cached) {
            setExpandedArticle(articleId)
            return
        }

        openRequest.current = articleId
        setPendingId(articleId)
        if (!currentRules) {
            try {
                currentRules = await api.getRules(articleId)
                setRules(prev => ({ ...prev, [articleId]: currentRules }))
            } catch (e) {
                console.error(e)
                currentRules = []
            }
            if (openRequest.current !== articleId) return
        }
        // The case badges and the guidelines button both add height, so they are
        // resolved before opening too — otherwise the article settles and then
        // jumps a few hundred pixels a moment later. They only depend on the
        // rule ids, so they run together rather than one after the other.
        if (currentRules && currentRules.length > 0) {
            const ruleIds = currentRules.map(r => r.id)
            const needsGuidelines = articleHasGuidelines[articleId] === undefined

            const [cases, exists] = await Promise.all([
                api.getCasebookData(ruleIds).catch(e => {
                    console.error("Error checking casebook existence:", e)
                    return null
                }),
                needsGuidelines
                    ? api.getGuidelinesExistence(articleId, ruleIds).catch(e => {
                        console.error("RulesView: Error checking guidelines existence:", e)
                        return null
                    })
                    : Promise.resolve(null),
            ])

            if (openRequest.current !== null && openRequest.current !== articleId) return
            if (cases) setCasebookData(prev => ({ ...prev, ...cases }))
            if (exists !== null) setArticleHasGuidelines(prev => ({ ...prev, [articleId]: exists }))
        }

        setPendingId(null)
        setExpandedArticle(articleId)
    }

    const toggleCaseAccordion = async (ruleId) => {
        if (expandedRuleCases === ruleId) {
            setExpandedRuleCases(null)
            return
        }
        if (fullCases[ruleId]) {
            setExpandedRuleCases(ruleId)
            return
        }

        openRequest.current = ruleId
        setPendingId(ruleId)
        try {
            const data = await api.getCasebookForRules([ruleId])
            setFullCases(prev => ({ ...prev, [ruleId]: data }))
        } catch (e) {
            console.error("Error loading case details:", e)
        }
        if (openRequest.current !== ruleId) return
        setPendingId(null)
        setExpandedRuleCases(ruleId)
    }

    const toggleArticleGuidelines = async (articleId) => {
        if (expandedArticleGuidelines === articleId) {
            setExpandedArticleGuidelines(null)
            return
        }
        if (articleGuidelines[articleId]) {
            setExpandedArticleGuidelines(articleId)
            return
        }

        const key = `guidelines:${articleId}`
        openRequest.current = key
        setPendingId(key)
        try {
            const ruleIds = rules[articleId]?.map(r => r.id) || []
            const data = await api.getGuidelinesForArticle(articleId, ruleIds)
            setArticleGuidelines(prev => ({ ...prev, [articleId]: data }))
        } catch (e) {
            console.error("RulesView: Error loading guidelines:", e)
        }
        if (openRequest.current !== key) return
        setPendingId(null)
        setExpandedArticleGuidelines(articleId)
    }

    if (loading) return <ChaptersSkeleton />

    if (loadError) return (
        <Notice tone="error">The rules could not be loaded – please check your connection and reload the page.</Notice>
    )

    if (!chapters.length) return (
        <Card pad="flush">
            <EmptyState icon={FileQuestion}>No rules published for this discipline yet.</EmptyState>
        </Card>
    )

    return (
        <Card pad="flush" className="overflow-hidden">
            <div className="divide-y divide-stone-100">
                {chapters.map((chapter) => {
                    const isExp = expandedChapter === chapter.id
                    const chapterArticleNumbers = chapter.article_numbers
                        ? chapter.article_numbers.split(',')
                        : (articles[chapter.id]?.map(a => a.article_n) || [])
                    const ruleRange = formatArticleRange(chapterArticleNumbers)
                    const ruleLabel = ruleRange && /[–,]/.test(ruleRange) ? 'Rules' : 'Rule'
                    return (
                        <section key={chapter.id}>
                            <button
                                type="button"
                                onClick={() => toggleChapter(chapter.id)}
                                aria-expanded={isExp}
                                aria-busy={pendingId === chapter.id || undefined}
                                className={cn(
                                    'flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50 sm:px-5',
                                    FOCUS_RING_INSET,
                                )}
                            >
                                <NumberBadge active={isExp}>{chapter.order || chapter.id.match(/\d+/)}</NumberBadge>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold leading-snug text-stone-900 sm:text-[15px]">{chapter.title}</span>
                                    {ruleRange && (
                                        <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wide tabular-nums text-stone-400">
                                            {ruleLabel} {ruleRange}
                                        </span>
                                    )}
                                </span>
                                <ToggleIndicator pending={pendingId === chapter.id} open={isExp} />
                            </button>

                            <AnimatePresence initial={false}>
                                {isExp && (
                                    <motion.div {...accordionMotion} className="overflow-hidden">
                                        <div className="border-t border-stone-100 bg-stone-50/60 px-2 py-1.5 sm:px-3">
                                            <div className="divide-y divide-stone-200/70">
                                                {articles[chapter.id]?.map((article) => {
                                                    const articleOpen = expandedArticle === article.id
                                                    return (
                                                        <div key={article.id} className="py-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleArticle(article.id)}
                                                                aria-expanded={articleOpen}
                                                                aria-busy={pendingId === article.id || undefined}
                                                                className={cn(
                                                                    'flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-stone-100',
                                                                    FOCUS_RING,
                                                                )}
                                                            >
                                                                <span className="w-7 shrink-0 text-right text-xs font-semibold tabular-nums text-stone-400">
                                                                    {article.article_n}
                                                                </span>
                                                                <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-stone-800">{article.title}</span>
                                                                <ToggleIndicator pending={pendingId === article.id} open={articleOpen} sideways />
                                                            </button>

                                                            <AnimatePresence initial={false}>
                                                                {articleOpen && (
                                                                    <motion.div {...accordionMotion} className="overflow-hidden">
                                                                        <div className="pb-2 pt-1">
                                                                            <div className="rounded-xl border border-stone-200 bg-white p-3 sm:p-5">
                                                                                {/* Referee guidelines toggle */}
                                                                                {articleHasGuidelines[article.id] && (
                                                                                    <div className="mb-5">
                                                                                        <GuidelinesToggle
                                                                                            open={expandedArticleGuidelines === article.id}
                                                                                            pending={pendingId === `guidelines:${article.id}`}
                                                                                            onClick={() => toggleArticleGuidelines(article.id)}
                                                                                        />

                                                                                        <AnimatePresence initial={false}>
                                                                                            {expandedArticleGuidelines === article.id && (
                                                                                                <motion.div {...accordionMotion} className="overflow-hidden">
                                                                                                    <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50/60 px-3 sm:px-4">
                                                                                                        {!articleGuidelines[article.id] ? (
                                                                                                            <InlineLoading>Loading guidelines…</InlineLoading>
                                                                                                        ) : (
                                                                                                            <div className="divide-y divide-stone-200">
                                                                                                                {articleGuidelines[article.id].map((gl) => (
                                                                                                                    <div key={gl.id} className="py-3">
                                                                                                                        {gl.title && (
                                                                                                                            <h5 className="mb-1 text-sm font-semibold text-stone-900">{gl.title}</h5>
                                                                                                                        )}
                                                                                                                        <p className="max-w-prose text-sm leading-relaxed text-stone-700">{gl.text}</p>
                                                                                                                        {gl.notes && (
                                                                                                                            <p className="mt-2 max-w-prose border-l-2 border-stone-300 pl-3 text-xs italic leading-relaxed text-stone-500">
                                                                                                                                {gl.notes}
                                                                                                                            </p>
                                                                                                                        )}
                                                                                                                    </div>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </motion.div>
                                                                                            )}
                                                                                        </AnimatePresence>
                                                                                    </div>
                                                                                )}

                                                                                <div className="space-y-4">
                                                                                    {rules[article.id]?.map((rule, rIndex) => {
                                                                                        const showTitle = rIndex === 0 || rule.title !== rules[article.id][rIndex - 1]?.title
                                                                                        const casesOpen = expandedRuleCases === rule.id
                                                                                        return (
                                                                                            <div key={rule.id} className="flex items-baseline gap-3 sm:gap-4">
                                                                                                {/* Rule number column */}
                                                                                                <div className="w-10 shrink-0 text-xs font-semibold tabular-nums text-stone-400 sm:w-12">
                                                                                                    {rule.rule_n}
                                                                                                </div>

                                                                                                {/* Content column */}
                                                                                                <div className="min-w-0 flex-1">
                                                                                                    {/* Title row */}
                                                                                                    {(showTitle || casebookData[rule.id]) && (
                                                                                                        <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                                                                                                            {showTitle && (
                                                                                                                <h4 className="text-sm font-semibold leading-snug text-stone-900">{rule.title}</h4>
                                                                                                            )}

                                                                                                            {casebookData[rule.id] && (
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    onClick={() => toggleCaseAccordion(rule.id)}
                                                                                                                    aria-expanded={casesOpen}
                                                                                                                    aria-busy={pendingId === rule.id || undefined}
                                                                                                                    className={cn(
                                                                                                                        'inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-semibold tabular-nums transition-colors',
                                                                                                                        casesOpen
                                                                                                                            ? 'border-slate-900 bg-slate-900 text-white'
                                                                                                                            : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100',
                                                                                                                        FOCUS_RING,
                                                                                                                    )}
                                                                                                                >
                                                                                                                    {casebookData[rule.id].length > 1 ? 'Cases' : 'Case'} {casebookData[rule.id].join(', ')}
                                                                                                                    {pendingId === rule.id
                                                                                                                        ? <Loader2 size={12} className="animate-spin" aria-label="Loading" />
                                                                                                                        : <ChevronDown size={12} className={cn('transition-transform', casesOpen && 'rotate-180')} aria-hidden />}
                                                                                                                </button>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {!rule.is_placeholder && rule.text !== rule.title && (
                                                                                                        <p className="max-w-prose text-sm leading-relaxed text-stone-700">{rule.text}</p>
                                                                                                    )}

                                                                                                    {/* Inline casebook accordion */}
                                                                                                    <AnimatePresence initial={false}>
                                                                                                        {casesOpen && (
                                                                                                            <motion.div {...accordionMotion} className="overflow-hidden">
                                                                                                                <div className="space-y-3 pb-1 pt-3">
                                                                                                                    {!fullCases[rule.id] ? (
                                                                                                                        <InlineLoading>Loading cases…</InlineLoading>
                                                                                                                    ) : fullCases[rule.id].length === 0 ? (
                                                                                                                        <p className="text-sm text-stone-400">No detailed scenarios available for this rule.</p>
                                                                                                                    ) : (
                                                                                                                        fullCases[rule.id].map((entry) => (
                                                                                                                            <div key={entry.id} className="max-w-prose rounded-lg border border-stone-200 bg-stone-50/60 p-3 sm:p-4">
                                                                                                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                                                                                                    <span className="text-[11px] font-semibold uppercase tracking-wide tabular-nums text-stone-500">
                                                                                                                                        Scenario {entry.case_number}
                                                                                                                                    </span>
                                                                                                                                    {entry.video_link && (
                                                                                                                                        <a
                                                                                                                                            href={entry.video_link}
                                                                                                                                            target="_blank"
                                                                                                                                            rel="noopener noreferrer"
                                                                                                                                            className={cn('inline-flex items-center gap-1 rounded text-xs font-medium text-red-600 transition-colors hover:text-red-700 hover:underline', FOCUS_RING)}
                                                                                                                                        >
                                                                                                                                            <PlayCircle size={13} aria-hidden />
                                                                                                                                            Watch video
                                                                                                                                        </a>
                                                                                                                                    )}
                                                                                                                                </div>
                                                                                                                                <p className="text-sm italic leading-relaxed text-stone-800">
                                                                                                                                    “{entry.case_text}”
                                                                                                                                </p>
                                                                                                                                <p className="mt-3 border-t border-stone-200 pt-3 text-sm leading-relaxed text-stone-700">
                                                                                                                                    {entry.case_ruling}
                                                                                                                                </p>
                                                                                                                            </div>
                                                                                                                        ))
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            </motion.div>
                                                                                                        )}
                                                                                                    </AnimatePresence>
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </section>
                    )
                })}
            </div>
        </Card>
    )
}

export default RulesView
