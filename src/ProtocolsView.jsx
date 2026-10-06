import React, { useState, useEffect } from 'react'
import { Clock, ClipboardList, RotateCw, Zap } from 'lucide-react'
import { api } from './services/api'
import {
    Button, Card, CardHeading, Chip, EmptyState, FilterPill, Notice, SegmentedControl, Skeleton, SkeletonRows,
} from './ui/volleyui'

const TYPES = [
    { value: 'game', label: 'Game', icon: Clock },
    { value: 'other', label: 'Others', icon: Zap },
]

// Time | description | referees | teams, from lg. Below lg each step stacks.
// A column no step fills (beach has no referee / team notes) is left out.
const GAME_COLS = {
    4: 'lg:grid lg:grid-cols-[6.5rem_minmax(0,3fr)_minmax(0,4fr)_minmax(0,4fr)] lg:gap-4',
    3: 'lg:grid lg:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-4',
    2: 'lg:grid lg:grid-cols-[6.5rem_minmax(0,1fr)] lg:gap-4',
}
const MICRO_LABEL = 'text-[11px] font-semibold uppercase tracking-wide text-stone-400'

function ProtocolsView({ environment }) {
    const [type, setType] = useState('game') // 'game' | 'other'
    const [subFilter, setSubFilter] = useState('All')
    const [protocols, setProtocols] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        setSubFilter('All')
        loadProtocols()
    }, [environment, type])

    const loadProtocols = async () => {
        setLoading(true)
        setError(false)
        try {
            const data = await api.getProtocols(environment)
            setProtocols(type === 'game' ? data.gameProtocol : data.otherProtocols)
        } catch (e) {
            console.error(e)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    const renderText = (text) => {
        if (!text) return null
        return text.toString().replace(/\\n/g, '\n').split('\n').map((line, i) => {
            const trimmed = line.trim()
            if (!trimmed) return <div key={i} className="h-2" />

            // Check for title:
            // 1. Whole line is uppercase (standard title)
            // 2. Text before first parenthesis is uppercase (e.g. "HEADER (subtitle)")
            const preParen = trimmed.split('(')[0]
            const hasEnoughCaps = (str) => (str.match(/[A-Z]/g) || []).length > 4
            const isAllUpper = (str) => str === str.toUpperCase()

            const isTitle = (isAllUpper(trimmed) && hasEnoughCaps(trimmed)) ||
                (trimmed.includes('(') && isAllUpper(preParen) && hasEnoughCaps(preParen))

            // Check for list: matches "1.", "1 .", "a)", "- ", "• ", "▪ "
            const isList = /^(\s*[-•▪]|\d+\s*[.)]|[a-z]\s*[.)])/.test(trimmed)

            return (
                <div
                    key={i}
                    className={[
                        isTitle ? 'font-semibold text-stone-900' : '',
                        isList ? 'mb-1 pl-6 -indent-4' : '',
                    ].join(' ').trim() || undefined}
                >
                    {line}
                </div>
            )
        })
    }

    const filters = ['All', ...new Set(protocols.map(p => p.protocol_filter).filter(Boolean))]
    const visibleOthers = protocols.filter(p => subFilter === 'All' || p.protocol_filter === subFilter)

    const renderBody = () => {
        if (loading) return (
            <Card role="status" aria-busy="true" stack={false}>
                <span className="sr-only">Loading protocols…</span>
                <Skeleton className="mb-2 h-4 w-36" />
                <SkeletonRows rows={5} pill={false} />
            </Card>
        )

        if (error) return (
            <Card stack={false}>
                <div className="flex flex-col items-start gap-3">
                    <Notice>The protocols could not be loaded – please check your connection and try again.</Notice>
                    <Button variant="secondary" icon={RotateCw} className="h-11 sm:h-9" onClick={loadProtocols}>Try again</Button>
                </div>
            </Card>
        )

        if (protocols.length === 0) return (
            <Card stack={false}>
                <EmptyState icon={ClipboardList}>No protocols recorded for this category yet.</EmptyState>
            </Card>
        )

        if (type === 'game') {
            const showReferees = protocols.some(p => p.referees)
            const showTeams = protocols.some(p => p.teams)
            const cols = GAME_COLS[2 + Number(showReferees) + Number(showTeams)]
            return (
                <Card stack={false}>
                    <CardHeading
                        title="Game protocol"
                        actions={(
                            <span className="text-xs tabular-nums text-stone-500">
                                {protocols.length} {protocols.length === 1 ? 'step' : 'steps'}
                            </span>
                        )}
                    />
                    <div className={`hidden border-b border-stone-200 pb-2 text-[11px] font-bold uppercase tracking-wide text-stone-500 ${cols}`}>
                        <div>Time to start</div>
                        <div>Description</div>
                        {showReferees && <div>Referees</div>}
                        {showTeams && <div>Teams</div>}
                    </div>
                    <ol className="divide-y divide-stone-100">
                        {protocols.map((protocol) => (
                            <li key={protocol.id} className={`space-y-2 py-3 lg:space-y-0 ${cols}`}>
                                <div className="text-sm font-semibold tabular-nums text-stone-900">
                                    {protocol.time_to_start || protocol.time || '–'}
                                </div>
                                <div className="text-sm leading-relaxed text-stone-800">
                                    {renderText(protocol.description || protocol.title || '–')}
                                </div>
                                {(showReferees || showTeams) && (
                                    <div className={`grid gap-2 lg:contents ${showReferees && showTeams ? 'sm:grid-cols-2 sm:gap-4' : ''}`}>
                                        {showReferees && (
                                            <div className="min-w-0">
                                                <p className={`${MICRO_LABEL} mb-0.5 lg:hidden`}>Referees</p>
                                                <div className="text-sm leading-relaxed text-stone-600">
                                                    {renderText(protocol.referees || '–')}
                                                </div>
                                            </div>
                                        )}
                                        {showTeams && (
                                            <div className="min-w-0">
                                                <p className={`${MICRO_LABEL} mb-0.5 lg:hidden`}>Teams</p>
                                                <div className="text-sm leading-relaxed text-stone-600">
                                                    {renderText(protocol.teams || '–')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ol>
                </Card>
            )
        }

        return (
            <div className="space-y-3">
                {visibleOthers.map((protocol) => (
                    <Card as="article" key={protocol.id} stack={false}>
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                            <h3 className="flex min-w-0 items-start gap-1.5 break-words text-sm font-semibold text-stone-800">
                                <ClipboardList size={15} className="mt-0.5 shrink-0 text-stone-400" aria-hidden="true" />
                                <span className="min-w-0">{protocol.title}</span>
                            </h3>
                            <Chip>{protocol.protocol_filter || 'Protocol'}</Chip>
                        </div>
                        <div className="break-words text-sm leading-relaxed text-stone-700">
                            {renderText(protocol.content || protocol.protocolText)}
                        </div>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <SegmentedControl
                ariaLabel="Protocol type"
                options={TYPES}
                value={type}
                onChange={(next) => { if (next !== type) { setLoading(true); setType(next) } }}
                className="sm:max-w-xs"
            />

            {type === 'other' && !loading && !error && protocols.length > 0 && (
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter protocols">
                    {filters.map(filter => (
                        <FilterPill
                            key={filter}
                            active={subFilter === filter}
                            onClick={() => setSubFilter(filter)}
                            className="h-11 sm:h-9"
                        >
                            {filter}
                        </FilterPill>
                    ))}
                </div>
            )}

            {renderBody()}
        </div>
    )
}

export default ProtocolsView
