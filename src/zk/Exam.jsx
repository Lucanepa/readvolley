import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eraser, Flag, Shuffle, ClipboardCheck, Search, BarChart2, ChevronDown, Trophy } from 'lucide-react'
import { Card, Button, FOCUS_RING, cn } from '../ui/volleyui'
import { pickExam, shuffle, isCorrect, gradeOf, EXAM_SIZE, tr } from './quiz'
import { useQuestions, LoadState, QuestionText, Diagram, AnswerHint, Answer } from './parts'

const TIER_TEXT = { excellent: 'text-emerald-700', good: 'text-emerald-700', sufficient: 'text-amber-600', fail: 'text-red-600' }

/** Exam simulation: 25 questions, free navigation, scored at the end, then reviewed. */
export default function Exam({ lang, level }) {
    const { status, questions } = useQuestions(lang, level)
    return (
        <LoadState status={status} lang={lang}>
            <ExamRun key={`${lang}-${level}`} lang={lang} questions={questions} />
        </LoadState>
    )
}

function ExamRun({ lang, questions }) {
    const [test, setTest] = useState(null)       // picked questions, or null before start
    const [answers, setAnswers] = useState({})   // index -> selected keys
    const [orders, setOrders] = useState({})     // index -> shuffled keys
    const [index, setIndex] = useState(0)
    const [phase, setPhase] = useState('idle')   // idle | taking | results | review

    const start = () => {
        const picked = pickExam(questions)
        setTest(picked); setAnswers({}); setIndex(0); setPhase('taking')
        // Answer order is fixed per question for the whole test.
        setOrders(Object.fromEntries(picked.map((pq, i) => [i, shuffle(Object.keys(pq.answers))])))
        window.scrollTo({ top: 0 })
    }

    if (phase === 'idle' || !test) {
        return (
            <Card className="space-y-3 py-8 text-center">
                <ClipboardCheck size={36} className="mx-auto text-stone-400" aria-hidden="true" />
                <p className="text-sm text-stone-600">{tr(lang, 'clickNewTest').replace(/<\/?strong>/g, '')}</p>
                <Button icon={Shuffle} onClick={start}>{tr(lang, 'newTest')}</Button>
            </Card>
        )
    }

    const correctCount = test.filter((q, i) => isCorrect(q, answers[i] || [])).length
    const score = Math.round((correctCount / EXAM_SIZE) * 100)

    if (phase === 'results') {
        return <Results lang={lang} score={score} count={correctCount} onReview={() => { setPhase('review'); setIndex(0) }} onNew={start} />
    }

    const review = phase === 'review'
    const q = test[index]
    const keys = orders[index] || Object.keys(q.answers)
    const picked = answers[index] || []
    const toggle = (key) => setAnswers(a => {
        const cur = a[index] || []
        const next = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key]
        const out = { ...a }
        if (next.length) out[index] = next; else delete out[index]
        return out
    })

    const stateOf = (key) => {
        const sel = picked.includes(key)
        if (!review) return sel ? 'selected' : 'idle'
        const right = q.correct.includes(key)
        if (sel && right) return 'correct'
        if (sel) return 'incorrect'
        return right ? 'missed' : 'plain'
    }

    const go = (i) => { setIndex(i); window.scrollTo({ top: 0 }) }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap justify-end gap-2">
                <Button size="sm" variant="secondary" icon={Shuffle} onClick={start}>{tr(lang, 'newTest')}</Button>
                {review
                    ? <Button size="sm" variant="secondary" icon={BarChart2} onClick={() => setPhase('results')}>{tr(lang, 'results')}</Button>
                    : <Button size="sm" variant="secondary" icon={Flag} onClick={() => setPhase('results')}>{tr(lang, 'finish')}</Button>}
            </div>
            <div className="grid gap-3 lg:grid-cols-[14rem_1fr]">
                <Card className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{tr(lang, 'questions')}</p>
                    <div className="grid grid-cols-5 gap-1.5">
                        {test.map((tq, i) => {
                            const tone = review
                                ? (isCorrect(tq, answers[i] || []) ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-red-400 bg-red-50 text-red-800')
                                : (answers[i] ? 'border-stone-400 bg-stone-100 text-stone-900' : 'border-stone-200 bg-white text-stone-600')
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => go(i)}
                                    aria-current={i === index ? 'step' : undefined}
                                    className={cn('h-9 rounded-lg border text-sm font-semibold', tone, i === index && 'ring-2 ring-stone-900', FOCUS_RING)}
                                >
                                    {i + 1}
                                </button>
                            )
                        })}
                    </div>
                </Card>
                <Card className="space-y-3">
                    <p className="text-xs font-semibold text-stone-500">{tr(lang, 'question')} {index + 1} / {test.length}</p>
                    <QuestionText>{q.question}</QuestionText>
                    <Diagram src={q.image_url} />
                    <AnswerHint lang={lang} />
                    <div className="space-y-2">
                        {keys.map(key => (
                            <Answer
                                key={`${index}-${key}`}
                                text={q.answers[key]}
                                state={stateOf(key)}
                                lang={lang}
                                onClick={review ? undefined : () => toggle(key)}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                        <Button variant="secondary" aria-label="Previous question" disabled={index === 0} onClick={() => go(index - 1)} icon={ChevronLeft} />
                        {!review && <Button variant="ghost" size="sm" icon={Eraser} onClick={() => setAnswers(a => { const o = { ...a }; delete o[index]; return o })}>{tr(lang, 'clear')}</Button>}
                        <Button variant="secondary" aria-label="Next question" disabled={index === test.length - 1} onClick={() => go(index + 1)} icon={ChevronRight} />
                    </div>
                </Card>
            </div>
        </div>
    )
}

function Results({ lang, score, count, onReview, onNew }) {
    const [open, setOpen] = useState(false)
    const { tier, label } = gradeOf(score)
    const rows = useMemo(() => [
        ['excellent', '≥ 90%', 'sehr_gut'], ['good', '≥ 80%', 'gut'], ['sufficient', '≥ 66%', 'genuegend'], ['fail', '< 66%', 'ungenuegend'],
    ], [])
    return (
        <Card className="space-y-3 py-6 text-center">
            <Trophy size={36} className={cn('mx-auto', TIER_TEXT[tier])} aria-hidden="true" />
            <h2 className="text-sm font-semibold text-stone-500">{tr(lang, 'testResults')}</h2>
            <div className="text-5xl font-bold text-stone-900">{score}%</div>
            <div className="text-xs uppercase tracking-wide text-stone-500">{tr(lang, 'score')}</div>
            <div className="text-sm text-stone-600">{count} / {EXAM_SIZE}</div>
            <div className={cn('text-lg font-bold', TIER_TEXT[tier])}>{tr(lang, label)}</div>
            <div className="text-sm text-stone-500">{tr(lang, `${label}_desc`)}</div>
            <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className={cn('mx-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-stone-600', FOCUS_RING)}>
                <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} aria-hidden="true" />
                {tr(lang, 'gradeDetails')}
            </button>
            {open && (
                <div className="space-y-1.5 text-left">
                    {rows.map(([t, pct, key]) => (
                        <div key={t} className={cn('rounded-lg border px-3 py-2 text-sm', t === tier ? 'border-stone-400 bg-stone-100' : 'border-stone-200')}>
                            <span className="mr-2 font-bold">{pct}</span>
                            <span className="mr-2 font-semibold">{tr(lang, key)}</span>
                            <span className="text-stone-500">{tr(lang, `${key}_desc`)}</span>
                        </div>
                    ))}
                    <p className="pt-1 text-xs text-stone-500">{tr(lang, 'gradeWarning')}</p>
                </div>
            )}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
                <Button variant="secondary" icon={Search} onClick={onReview}>{tr(lang, 'checkAnswers')}</Button>
                <Button icon={Shuffle} onClick={onNew}>{tr(lang, 'newTest')}</Button>
            </div>
        </Card>
    )
}
