import React, { useMemo, useRef, useState, useEffect } from 'react'
import { CheckCircle2, ArrowRight, Trophy, RefreshCw } from 'lucide-react'
import { Card, Button, ProgressBar } from '../ui/volleyui'
import { itemsForCards, shuffle, isCorrect, triagonalRef, tr } from './quiz'
import { useQuestions, LoadState, QuestionText, Diagram, AnswerHint, Answer, LinkedBadge } from './parts'

/** Flashcards: one shuffled session, check each answer straight away. */
export default function Cards({ lang, level }) {
    const { status, questions } = useQuestions(lang, level)
    return (
        <LoadState status={status} lang={lang}>
            <Session key={`${lang}-${level}`} lang={lang} items={useMemo(() => itemsForCards(questions), [questions])} />
        </LoadState>
    )
}

function Session({ lang, items }) {
    const [order, setOrder] = useState(() => shuffle(items))
    const [index, setIndex] = useState(0)
    const [part, setPart] = useState(0)
    const [picked, setPicked] = useState([])
    const [checked, setChecked] = useState(false)
    const topRef = useRef(null)

    const item = order[index]
    const question = item?.parts[part]
    // Answer order is random per display so the letter is no visual cue.
    const keys = useMemo(() => (question ? shuffle(Object.keys(question.answers)) : []), [question])

    useEffect(() => {
        const el = topRef.current
        if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' })
    }, [index, part])

    const restart = () => { setOrder(shuffle(items)); setIndex(0); setPart(0); setPicked([]); setChecked(false) }

    if (!item) {
        return (
            <Card className="space-y-3 py-8 text-center">
                <Trophy size={36} className="mx-auto text-amber-500" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-stone-900">{tr(lang, 'allCompleted')}</h2>
                <p className="text-sm text-stone-500">{tr(lang, 'allCompletedSub')}</p>
                <Button icon={RefreshCw} onClick={restart}>{tr(lang, 'startNewSession')}</Button>
            </Card>
        )
    }

    const ok = checked && isCorrect(question, picked)
    const nextPart = item.parts[part + 1]
    const toggle = (key) => setPicked(p => (p.includes(key) ? p.filter(k => k !== key) : [...p, key]))
    const next = () => {
        setPicked([]); setChecked(false)
        // A group advances only after a correct answer; a wrong one leaves the group.
        if (ok && nextPart) { setPart(part + 1); return }
        setPart(0); setIndex(index + 1)
    }

    const stateOf = (key) => {
        const isSel = picked.includes(key)
        const isRight = question.correct.includes(key)
        if (!checked) return isSel ? 'selected' : 'idle'
        if (isSel && isRight) return 'correct'
        if (isSel) return 'incorrect'
        return isRight ? 'missed' : 'plain'
    }

    return (
        <div ref={topRef} className="space-y-3">
            <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-stone-500">{index + 1} / {order.length}</span>
                <ProgressBar className="flex-1" value={index} max={order.length} />
            </div>
            <Card className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-500">
                    <span>{tr(lang, 'question')} {question.question_number}{triagonalRef(question)}</span>
                    {item.parts.length > 1 && <LinkedBadge lang={lang} order={part + 1} total={item.parts.length} />}
                </div>
                <QuestionText>{question.question}</QuestionText>
                <Diagram src={question.image_url} />
                <AnswerHint lang={lang} />
                <div className="space-y-2">
                    {keys.map(key => (
                        <Answer
                            key={`${question.question_number}-${key}`}
                            text={question.answers[key]}
                            state={stateOf(key)}
                            lang={lang}
                            onClick={checked ? undefined : () => toggle(key)}
                        />
                    ))}
                </div>
                {checked && (
                    <div className={`whitespace-pre-line rounded-xl px-3 py-2 text-sm font-medium ${ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`} role="status">
                        {ok
                            ? tr(lang, 'correct')
                            : [tr(lang, question.correct.length > 1 ? 'incorrectMulti' : 'incorrectSingle'),
                                ...question.correct.map(k => `• ${question.answers[k]}`)].join('\n')}
                    </div>
                )}
                {/* Nothing selected is allowed: "none of the answers" can be right. */}
                {checked
                    ? <Button variant="positive" icon={ArrowRight} block onClick={next}>{ok && nextPart ? tr(lang, 'nextLinked') : tr(lang, 'next')}</Button>
                    : <Button icon={CheckCircle2} block onClick={() => setChecked(true)}>{tr(lang, 'checkAnswer')}</Button>}
            </Card>
        </div>
    )
}
