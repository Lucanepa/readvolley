import React, { useState, useEffect, useMemo, useRef, useDeferredValue, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Book, AlertCircle, Info, ShieldCheck, Image as ImageIcon, List, ChevronDown, SlidersHorizontal, Loader2, RotateCw } from 'lucide-react'
import { api } from './services/api'
import { accordionMotion, tabPanelMotion } from './styles/motion'
import {
    SearchInput, IconButton, Button, SegmentedControl, FilterPill, RowList, Row, SectionHeader,
    Chip, EmptyState, SkeletonRows, FormError, FOCUS_RING, cn,
} from './ui/volleyui'

// A broad term matches a few hundred entries. Rendering them all on every
// keystroke cost ~90ms a frame, and nobody scrolls past the first screenful —
// so the list grows as it is scrolled instead.
const PAGE_SIZE = 40

const CATEGORIES = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'rulebook', label: 'Rulebook', icon: Book },
    { id: 'casebook', label: 'Casebook', icon: AlertCircle },
    { id: 'guidelines', label: 'Guidelines', icon: Info },
    { id: 'protocol', label: 'Protocol', icon: ShieldCheck },
    { id: 'diagrams', label: 'Diagrams', icon: ImageIcon },
    { id: 'gestures', label: 'Signals', icon: List }
]

const DISCIPLINES = [
    { value: 'all', label: 'Both' },
    { value: 'indoor', label: 'Indoor' },
    { value: 'beach', label: 'Beach' },
]

const ENV_LABEL = { indoor: 'Indoor', beach: 'Beach' }

function SearchView({ onClose, initialEnvironment }) {
    const [allData, setAllData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    // Filtering the ~1.2 MB index and rendering the matches costs more than a
    // frame, and doing it on every keystroke made typing stutter (worst frame
    // 156ms). Deferring lets React keep the input responsive and drop
    // intermediate renders it no longer needs.
    const deferredTerm = useDeferredValue(searchTerm)

    // Filters
    const [envFilter, setEnvFilter] = useState(initialEnvironment || 'all') // 'all' | 'indoor' | 'beach'
    const [category, setCategory] = useState('all')
    const [filtersOpen, setFiltersOpen] = useState(false)

    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

    const filtersRef = useRef(null)
    const filtersToggleRef = useRef(null)

    const activeCategory = CATEGORIES.find(c => c.id === category) || CATEGORIES[0]

    useEffect(() => {
        loadData()
    }, [])

    // The overlay covers the page; keep the page underneath from scrolling
    // along when the results list hits its end.
    useEffect(() => {
        const previous = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = previous }
    }, [])

    // Collapse the filter panel on any tap/click outside of it so the results
    // list keeps the full screen height on small devices.
    useEffect(() => {
        if (!filtersOpen) return

        const handlePointerDown = (e) => {
            if (filtersRef.current && filtersRef.current.contains(e.target)) return
            if (filtersToggleRef.current && filtersToggleRef.current.contains(e.target)) return
            setFiltersOpen(false)
        }

        document.addEventListener('pointerdown', handlePointerDown)
        return () => document.removeEventListener('pointerdown', handlePointerDown)
    }, [filtersOpen])

    // Escape peels one layer at a time: the open filter panel first, then the
    // typed query, then the search overlay itself.
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key !== 'Escape') return
            e.preventDefault()
            if (filtersOpen) setFiltersOpen(false)
            else if (searchTerm) setSearchTerm('')
            else onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [filtersOpen, searchTerm, onClose])

    const loadData = async () => {
        setLoading(true)
        setLoadError(false)
        try {
            const data = await api.getAllSearchData()
            setAllData(data)
        } catch (e) {
            console.error("Failed to load search data:", e)
            setLoadError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setVisibleCount(PAGE_SIZE)
    }, [deferredTerm, category, envFilter])

    const filteredResults = useMemo(() => {
        if (!allData || !deferredTerm.trim()) return []

        const searchLower = deferredTerm.toLowerCase()
        const results = []
        // Opened from the home screen, the search spans both disciplines.
        const inEnv = (value) => envFilter === 'all' || value === envFilter

        // 1. Rules (Rulebook)
        if (category === 'all' || category === 'rulebook') {
            allData.rules.forEach(rule => {
                if (inEnv(rule.rules_type)) {
                    const titleMatch = rule.title?.toLowerCase().includes(searchLower)
                    const textMatch = rule.text?.toLowerCase().includes(searchLower)
                    const nMatch = rule.rule_n?.toLowerCase().includes(searchLower)

                    if (titleMatch || textMatch || nMatch) {
                        results.push({
                            type: 'rulebook',
                            id: `rule-${rule.id}`,
                            title: `Rule ${rule.rule_n}: ${rule.title}`,
                            content: rule.text,
                            raw: rule,
                            env: rule.rules_type
                        })
                    }
                }
            })
        }

        // 2. Casebook
        if (category === 'all' || category === 'casebook') {
            // Find rules for current environment
            const envRules = new Set(allData.rules.filter(r => inEnv(r.rules_type)).map(r => r.id))
            // Find case IDs linked to these rules
            const envCaseIds = new Set(allData.casebookRules.filter(cr => envRules.has(cr.rule_id)).map(cr => cr.casebook_id))
            const ruleEnv = new Map(allData.rules.map(r => [r.id, r.rules_type]))
            const caseEnv = new Map(allData.casebookRules.map(cr => [cr.casebook_id, ruleEnv.get(cr.rule_id)]))

            allData.cases.forEach(c => {
                if (envCaseIds.has(c.id)) {
                    const textMatch = c.case_text?.toLowerCase().includes(searchLower)
                    const rulingMatch = c.case_ruling?.toLowerCase().includes(searchLower)
                    const nMatch = c.case_number?.toString().includes(searchLower)

                    if (textMatch || rulingMatch || nMatch) {
                        results.push({
                            type: 'casebook',
                            id: `case-${c.id}`,
                            title: `Case ${c.case_number}`,
                            content: c.case_text,
                            subContent: c.case_ruling,
                            raw: c,
                            env: caseEnv.get(c.id)
                        })
                    }
                }
            })
        }

        // 3. Guidelines
        if (category === 'all' || category === 'guidelines') {
            // Check definitions (legacy guidelines)
            allData.definitions.forEach(def => {
                if (inEnv(def.rules_type)) {
                    const termMatch = def.term?.toLowerCase().includes(searchLower)
                    const defMatch = def.definition?.toLowerCase().includes(searchLower)

                    if (termMatch || defMatch) {
                        results.push({
                            type: 'guidelines',
                            id: `def-${def.id}`,
                            title: def.term,
                            content: def.definition,
                            raw: def,
                            env: def.rules_type
                        })
                    }
                }
            })

            // Check new guidelines table
            allData.guidelines.forEach(gl => {
                if (inEnv(gl.rules_type)) {
                    const titleMatch = gl.title?.toLowerCase().includes(searchLower)
                    const textMatch = gl.text?.toLowerCase().includes(searchLower)
                    const notesMatch = gl.notes?.toLowerCase().includes(searchLower)

                    if (titleMatch || textMatch || notesMatch) {
                        results.push({
                            type: 'guidelines',
                            id: `gl-${gl.id}`,
                            title: gl.title || 'Guideline',
                            content: gl.text,
                            subContent: gl.notes,
                            raw: gl,
                            env: gl.rules_type
                        })
                    }
                }
            })
        }

        // 4. Protocols
        if (category === 'all' || category === 'protocol') {
            allData.gameProtocols.forEach(p => {
                if (inEnv(p.rules_type)) {
                    const titleMatch = p.title?.toLowerCase().includes(searchLower)
                    const textMatch = p.protocolText?.toLowerCase().includes(searchLower)

                    if (titleMatch || textMatch) {
                        results.push({
                            type: 'protocol',
                            id: `gp-${p.id}`,
                            title: p.title,
                            content: p.protocolText,
                            raw: p,
                            env: p.rules_type
                        })
                    }
                }
            })
            allData.otherProtocols.forEach(p => {
                // Not tied to a discipline — protocol_filter holds the protocol's name.
                const titleMatch = p.title?.toLowerCase().includes(searchLower)
                const textMatch = p.protocolText?.toLowerCase().includes(searchLower)

                if (titleMatch || textMatch) {
                    results.push({
                        type: 'protocol',
                        id: `op-${p.id}`,
                        title: p.title,
                        content: p.protocolText,
                        raw: p,
                        env: null
                    })
                }
            })
        }

        // 5. Diagrams
        if (category === 'all' || category === 'diagrams') {
            allData.diagrams.forEach(d => {
                if (inEnv(d.rules_type)) {
                    const titleMatch = d.diagram_name?.toLowerCase().includes(searchLower)
                    const nMatch = d.diagram_n?.toLowerCase().includes(searchLower)

                    if (titleMatch || nMatch) {
                        results.push({
                            type: 'diagrams',
                            id: `diag-${d.id}`,
                            title: `Diagram ${d.diagram_n}: ${d.diagram_name}`,
                            content: '',
                            raw: d,
                            env: d.rules_type
                        })
                    }
                }
            })
        }

        // 6. Gestures (Hand Signals)
        if (category === 'all' || category === 'gestures') {
            allData.gestures.forEach(g => {
                if (inEnv(g.rules_type)) {
                    const titleMatch = g.gesture_name?.toLowerCase().includes(searchLower)
                    const nMatch = g.gesture_n?.toLowerCase().includes(searchLower)

                    if (titleMatch || nMatch) {
                        results.push({
                            type: 'gestures',
                            id: `gest-${g.id}`,
                            title: `Signal ${g.gesture_n}: ${g.gesture_name}`,
                            content: '',
                            raw: g,
                            env: g.rules_type
                        })
                    }
                }
            })
        }

        return results
    }, [allData, deferredTerm, envFilter, category])

    // Per-type totals for the section heads (the list itself is paged).
    const typeCounts = useMemo(() => {
        const counts = {}
        filteredResults.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1 })
        return counts
    }, [filteredResults])

    // Results arrive already ordered by type, so grouping the visible page
    // is one pass over consecutive runs.
    const sections = useMemo(() => {
        const out = []
        filteredResults.slice(0, visibleCount).forEach(r => {
            const last = out[out.length - 1]
            if (last && last.type === r.type) last.items.push(r)
            else out.push({ type: r.type, items: [r] })
        })
        return out
    }, [filteredResults, visibleCount])

    const showEnv = envFilter === 'all'
    const filterSummary = `${envFilter === 'all' ? 'Indoor and beach' : ENV_LABEL[envFilter]} · ${activeCategory.label}`

    return (
        <div className="flex h-full flex-col bg-gradient-to-b from-stone-50 to-stone-100">
            {/* Top bar: search field, close, filters */}
            <div className="shrink-0 border-b border-stone-200 bg-white pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
                <div className="mx-auto max-w-3xl px-4 pb-3">
                    <div className="flex items-center gap-2">
                        <SearchInput
                            autoFocus
                            aria-label="Search everything"
                            placeholder="Search everything…"
                            enterKeyHint="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            wrapperClassName="min-w-0 flex-1"
                            // Chrome's own clear glyph is blue; draw a stone one instead.
                            className="[&::-webkit-search-cancel-button]:appearance-none"
                            trailing={searchTerm ? (
                                <button
                                    type="button"
                                    aria-label="Clear search"
                                    title="Clear search"
                                    onClick={(e) => {
                                        setSearchTerm('')
                                        e.currentTarget.closest('.relative')?.querySelector('input')?.focus()
                                    }}
                                    className={cn('-mr-2 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-stone-100', FOCUS_RING)}
                                >
                                    <X size={16} aria-hidden />
                                </button>
                            ) : null}
                        />
                        <IconButton variant="close" icon={X} label="Close search" onClick={onClose} className="shrink-0" />
                    </div>

                    {/* Filters — collapsed by default, so the results keep the screen height */}
                    <button
                        ref={filtersToggleRef}
                        type="button"
                        aria-expanded={filtersOpen}
                        aria-controls="search-filters"
                        onClick={() => setFiltersOpen(open => !open)}
                        className={cn(
                            'mt-2 inline-flex h-11 max-w-full items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors sm:h-9',
                            filtersOpen ? 'border-stone-300 bg-stone-100 text-stone-800' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100',
                            FOCUS_RING
                        )}
                    >
                        <SlidersHorizontal size={13} aria-hidden className="shrink-0 text-stone-400" />
                        <span className="truncate">{filterSummary}</span>
                        <ChevronDown size={13} aria-hidden className={cn('shrink-0 text-stone-400 transition-transform', filtersOpen && 'rotate-180')} />
                    </button>

                    <AnimatePresence initial={false}>
                        {filtersOpen && (
                            <motion.div
                                key="filters"
                                id="search-filters"
                                ref={filtersRef}
                                {...accordionMotion}
                                className="overflow-hidden"
                            >
                                <div className="space-y-3 pt-3">
                                    <div>
                                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Discipline</p>
                                        <SegmentedControl
                                            ariaLabel="Discipline"
                                            options={DISCIPLINES}
                                            value={envFilter}
                                            onChange={setEnvFilter}
                                            className="sm:max-w-xs"
                                        />
                                    </div>
                                    <div>
                                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Content</p>
                                        <div role="group" aria-label="Content type" className="scroll-strip -mx-4 flex gap-1.5 overflow-x-auto px-4">
                                            {CATEGORIES.map(cat => (
                                                <FilterPill
                                                    key={cat.id}
                                                    active={category === cat.id}
                                                    icon={cat.icon}
                                                    onClick={() => { setCategory(cat.id); setFiltersOpen(false) }}
                                                    className="h-11 sm:h-9"
                                                >
                                                    {cat.label}
                                                </FilterPill>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Results area */}
            <div
                onScroll={(e) => {
                    const el = e.currentTarget
                    if (el.scrollTop + el.clientHeight < el.scrollHeight - 600) return
                    setVisibleCount(c => (c < filteredResults.length ? c + PAGE_SIZE : c))
                }}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
                <div className="mx-auto max-w-3xl px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom,0px))]">
                    {loading ? (
                        <div>
                            <p role="status" className="mb-2 flex items-center gap-1.5 text-xs text-stone-500">
                                <Loader2 size={14} className="animate-spin" aria-hidden />
                                Loading the search index…
                            </p>
                            <SkeletonRows rows={6} pill={false} />
                        </div>
                    ) : loadError ? (
                        <div className="space-y-3 py-6">
                            <FormError size="md">The search index could not be loaded – please check your connection and try again.</FormError>
                            <Button variant="secondary" icon={RotateCw} onClick={loadData}>Try again</Button>
                        </div>
                    ) : deferredTerm.trim() === '' ? (
                        <EmptyState icon={Search} title="Start typing to search">
                            Rules, cases, guidelines, protocols, diagrams and signals.
                        </EmptyState>
                    ) : filteredResults.length === 0 ? (
                        <EmptyState icon={Search} title={`No matches for “${deferredTerm.trim()}”`}>
                            Try other words or adjust the filters.
                        </EmptyState>
                    ) : (
                        <motion.div
                            key={`${deferredTerm}|${category}|${envFilter}`}
                            {...tabPanelMotion}
                            className="space-y-6"
                        >
                            <p className="text-xs text-stone-500 tabular-nums">
                                {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
                            </p>
                            {sections.map(section => {
                                const cat = CATEGORIES.find(c => c.id === section.type)
                                const Icon = cat?.icon
                                return (
                                    <section key={section.type}>
                                        <SectionHeader
                                            icon={Icon ? <Icon size={13} aria-hidden /> : null}
                                            title={cat?.label ?? section.type}
                                            count={typeCounts[section.type]}
                                        />
                                        <RowList>
                                            {section.items.map(res => (
                                                <SearchResultRow key={res.id} result={res} term={deferredTerm} showEnv={showEnv} />
                                            ))}
                                        </RowList>
                                    </section>
                                )
                            })}
                            {visibleCount < filteredResults.length && (
                                <p className="py-2 text-center text-xs text-stone-500 tabular-nums">
                                    Showing {visibleCount} of {filteredResults.length} – keep scrolling for more
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}

function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Wraps every case-insensitive occurrence of `term` in a <mark>. */
function Highlight({ text, term }) {
    if (!text) return null
    if (!term) return text
    const parts = String(text).split(new RegExp(`(${escapeRegExp(term)})`, 'gi'))
    return parts.map((part, i) => (i % 2 === 1
        ? <mark key={i} className="rounded-sm bg-amber-100 text-stone-900">{part}</mark>
        : part))
}

const SUB_LABEL = { casebook: 'Ruling' }

// Memoised: paging in the next 40 rows must not re-render the ones already shown.
const SearchResultRow = memo(function SearchResultRow({ result, term, showEnv }) {
    return (
        <Row
            stripe={false}
            title={
                <p className="text-sm font-semibold leading-snug break-words text-stone-900 sm:text-[15px]">
                    <Highlight text={result.title} term={term} />
                </p>
            }
            chips={showEnv && result.env ? <Chip>{ENV_LABEL[result.env] ?? result.env}</Chip> : null}
        >
            {result.content && (
                <p className="mt-1 text-sm leading-relaxed break-words text-stone-600">
                    <Highlight text={result.content} term={term} />
                </p>
            )}
            {result.subContent && (
                <div className="mt-2 border-l-2 border-stone-300 pl-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">{SUB_LABEL[result.type] ?? 'Notes'}</p>
                    <p className="mt-0.5 text-sm leading-relaxed break-words text-stone-800">
                        <Highlight text={result.subContent} term={term} />
                    </p>
                </div>
            )}
        </Row>
    )
})

export default SearchView
