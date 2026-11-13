import React, { useEffect, useState } from 'react'
import { Check, X, AlertCircle, Link as LinkIcon } from 'lucide-react'
import { Card, Chip, Banner, Skeleton, cn, FOCUS_RING } from '../ui/volleyui'
import { loadQuestions, filterByLevel, formatQuestionText, highlightParts, tr } from './quiz'

/** Loads the question file for a language and applies the level filter. */
export function useQuestions(lang, level) {
    const [state, setState] = useState({ status: 'loading', questions: [] })
    useEffect(() => {
        let cancelled = false
        setState({ status: 'loading', questions: [] })
        loadQuestions(lang)
            .then(all => { if (!cancelled) setState({ status: 'ready', questions: filterByLevel(all, level) }) })
            .catch(() => { if (!cancelled) setState({ status: 'error', questions: [] }) })
        return () => { cancelled = true }
    }, [lang, level])
    return state
}

export function LoadState({ status, lang, children }) {
    if (status === 'loading') return <Card><Skeleton className="h-40 w-full" /></Card>
    if (status === 'error') return <Banner tone="error" icon={AlertCircle}>{tr(lang, 'errorLoading')}</Banner>
    return children
}

export function Marked({ text, term }) {
    return highlightParts(text, term).map((p, i) => (
        p.hit ? <mark key={i} className="rounded bg-amber-200 px-0.5 text-stone-900">{p.text}</mark> : <React.Fragment key={i}>{p.text}</React.Fragment>
    ))
}

export function QuestionText({ children, term }) {
    return <p className="whitespace-pre-line text-base font-medium leading-relaxed text-stone-900"><Marked text={formatQuestionText(children)} term={term} /></p>
}

export function Diagram({ src }) {
    if (!src) return null
    return (
        <div className="my-3 flex justify-center rounded-xl border border-stone-200 bg-white p-2">
            <img src={src} alt="" loading="lazy" className="max-h-80 w-auto max-w-full object-contain" />
        </div>
    )
}

export function AnswerHint({ lang }) {
    return <p className="mt-3 text-xs italic text-stone-500">{tr(lang, 'answerHint')}</p>
}

export function LinkedBadge({ lang, order, total }) {
    return (
        <Chip tone="indigo" className="gap-1">
            <LinkIcon size={11} aria-hidden="true" /> {order}/{total}
        </Chip>
    )
}

const STATE_CLASS = {
    idle: 'border-stone-200 bg-white hover:bg-stone-50',
    selected: 'border-red-400 bg-red-50',
    correct: 'border-emerald-400 bg-emerald-50',
    incorrect: 'border-red-400 bg-red-50',
    missed: 'border-amber-400 bg-amber-50',
    plain: 'border-stone-200 bg-white',
}

/**
 * One answer. state: idle | selected | correct | incorrect | missed | plain.
 * Without onClick it is a static row (review, browse).
 */
export function Answer({ text, state = 'idle', onClick, lang, highlight }) {
    const body = (
        <>
            <span className="min-w-0 flex-1 text-left text-sm leading-snug text-stone-800">{highlight ?? text}</span>
            {state === 'missed' && <span className="shrink-0 text-xs font-semibold text-amber-700">{tr(lang, 'missedAnswer')}</span>}
            {state === 'correct' && <Check size={16} className="shrink-0 text-emerald-600" aria-hidden="true" />}
            {state === 'incorrect' && <X size={16} className="shrink-0 text-red-600" aria-hidden="true" />}
            {state === 'missed' && <AlertCircle size={16} className="shrink-0 text-amber-600" aria-hidden="true" />}
        </>
    )
    const cls = cn('flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors', STATE_CLASS[state])
    if (!onClick) return <div className={cls}>{body}</div>
    return (
        <button type="button" role="checkbox" aria-checked={state === 'selected'} onClick={onClick} className={cn(cls, 'cursor-pointer', FOCUS_RING)}>
            {body}
        </button>
    )
}
