import React, { useMemo, useState, useDeferredValue } from 'react'
import { Card, Chip, SearchInput } from '../ui/volleyui'
import { unitsOf, normalizeForSearch, highlightParts, triagonalRef, tr } from './quiz'
import { useQuestions, LoadState, QuestionText, Diagram, Answer, LinkedBadge, Marked } from './parts'

/** Every question with its correct answers marked, searchable. */
export default function Browse({ lang, level }) {
    const { status, questions } = useQuestions(lang, level)
    const [search, setSearch] = useState('')
    const term = useDeferredValue(search.trim())
    const units = useMemo(() => unitsOf(questions), [questions])

    const shown = useMemo(() => {
        const nt = normalizeForSearch(term)
        if (!nt) return units
        const hit = (q) => normalizeForSearch(q.question).includes(nt)
            || normalizeForSearch(Object.values(q.answers).join(' ')).includes(nt)
        // A hit in any part of a linked group shows the whole group.
        return units.filter(unit => unit.some(hit) || unit[0].question_number.toString().includes(nt))
    }, [units, term])

    return (
        <LoadState status={status} lang={lang}>
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder={tr(lang, 'search')} aria-label={tr(lang, 'search')} autoComplete="off" wrapperClassName="flex-1" />
                    <span className="shrink-0 text-xs font-semibold text-stone-500">{shown.reduce((n, u) => n + u.length, 0)} {tr(lang, 'questions')}</span>
                </div>
                {shown.length === 0 ? (
                    <Card className="py-8 text-center">
                        <p className="font-semibold text-stone-700">{tr(lang, 'noResults')}</p>
                        <p className="text-sm text-stone-500">{tr(lang, 'noResultsSub')}</p>
                    </Card>
                ) : shown.map(unit => (
                    <Card key={unit[0].question_number} className="space-y-4">
                        {unit.map((q, i) => (
                            <div key={q.question_number} className={i > 0 ? 'space-y-3 border-t border-stone-200 pt-4' : 'space-y-3'}>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Chip>#{q.question_number}</Chip>
                                    {q.triagonal_quiz && <Chip tone="sky">{triagonalRef(q).trim().slice(1, -1)}</Chip>}
                                    {unit.length > 1 && <LinkedBadge lang={lang} order={q.link_order} total={unit.length} />}
                                </div>
                                <QuestionText term={term}>{q.question}</QuestionText>
                                <Diagram src={q.image_url} />
                                <div className="space-y-2">
                                    {Object.entries(q.answers).map(([key, value]) => (
                                        <Answer key={key} text={value} highlight={<Marked text={value} term={term} />} state={q.correct.includes(key) ? 'correct' : 'plain'} lang={lang} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </Card>
                ))}
            </div>
        </LoadState>
    )
}
