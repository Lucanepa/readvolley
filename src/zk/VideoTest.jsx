import React, { useEffect, useState } from 'react'
import { CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react'
import { Card, Button, ProgressBar, Banner, Skeleton, cn, FOCUS_RING } from '../ui/volleyui'
import { VIDEO_STRINGS } from './strings'
import { tr } from './quiz'
import { assetUrl } from '../services/platform'

const DATA_URL = assetUrl('/zk_prep/video_test_922.json')

/** Rule 9.2.2 video test: 31 clips, Legal Play or Fault. Videos are in the media bucket. */
export default function VideoTest({ lang }) {
    const [data, setData] = useState(null)
    const [failed, setFailed] = useState(false)
    useEffect(() => {
        fetch(DATA_URL).then(r => { if (!r.ok) throw new Error(); return r.json() }).then(setData).catch(() => setFailed(true))
    }, [])
    if (failed) return <Banner tone="error">{tr(lang, 'errorLoading')}</Banner>
    if (!data) return <Card><Skeleton className="h-40 w-full" /></Card>
    return <Run lang={lang} data={data} />
}

function Run({ lang, data }) {
    const p = (k) => VIDEO_STRINGS[lang]?.[k] ?? VIDEO_STRINGS.en[k]
    const contentLang = lang === 'fr' ? 'fr' : 'en'   // the clips' texts exist in FR and EN only
    const total = data.items.length
    const [index, setIndex] = useState(0)
    const [selected, setSelected] = useState(null)
    const [checked, setChecked] = useState(false)
    const [results, setResults] = useState({})
    const [reviewing, setReviewing] = useState(false)
    const [done, setDone] = useState(false)

    useEffect(() => { window.scrollTo({ top: 0 }) }, [index, done])

    const item = data.items[index]
    const restart = () => { setResults({}); setReviewing(false); setDone(false); setIndex(0); setSelected(null); setChecked(false) }
    const show = (i) => { setIndex(i); setSelected(null); setChecked(false); setDone(false) }

    if (done) {
        const right = data.items.filter(i => results[i.n]).length
        const missed = data.items.filter(i => results[i.n] === false)
        return (
            <Card className="space-y-3 py-6 text-center">
                <h2 className="text-lg font-semibold text-stone-900">{p('done')}</h2>
                <div className="text-4xl font-bold text-stone-900">{right} / {total}</div>
                <div className="text-sm text-stone-500">{tr(lang, 'score')}: {Math.round(right / total * 100)}%</div>
                {missed.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-stone-700">{p('missed')}</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {missed.map(m => (
                                <Button key={m.n} variant="secondary" size="sm" aria-label={`${p('review')} ${m.n}`} onClick={() => { setReviewing(true); show(data.items.indexOf(m)) }}>{m.n}</Button>
                            ))}
                        </div>
                    </div>
                )}
                <Button icon={RefreshCw} onClick={restart}>{p('restart')}</Button>
            </Card>
        )
    }

    const ok = checked && selected === item.correct
    const base = `${data.videoBase}${item.video.replace(/\.mp4$/, '')}`
    const check = () => { setChecked(true); setResults(r => ({ ...r, [item.n]: selected === item.correct })) }
    const next = () => { if (!reviewing && index + 1 < total) show(index + 1); else setDone(true) }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-stone-500">{index + 1} / {total}</span>
                <ProgressBar className="flex-1" value={index} max={total} />
            </div>
            <Card className="space-y-3">
                <p className="text-xs font-semibold text-stone-500">{p('clip')} {item.n}</p>
                {item.action && <p className="text-sm text-stone-700">{item.action[contentLang]}</p>}
                <video key={base} src={`${base}.mp4`} poster={`${base}.jpg`} controls playsInline preload="metadata" className="w-full rounded-xl bg-black" />
                <QuestionPrompt text={data.prompt[contentLang]} />
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(data.answers).map(([key, text]) => {
                        const state = checked
                            ? (key === item.correct ? 'border-emerald-400 bg-emerald-50' : key === selected ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-white')
                            : (key === selected ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-white hover:bg-stone-50')
                        return (
                            <button key={key} type="button" disabled={checked} onClick={() => setSelected(key)} aria-pressed={key === selected}
                                className={cn('rounded-xl border px-3 py-3 text-sm font-semibold text-stone-800 transition-colors', state, FOCUS_RING)}>
                                {text}
                            </button>
                        )
                    })}
                </div>
                {checked && (
                    <div role="status" className={cn('space-y-2 rounded-xl px-3 py-2 text-sm', ok ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-900')}>
                        <div className="font-semibold">{ok ? tr(lang, 'correct') : `${tr(lang, 'incorrectSingle')} ${data.answers[item.correct]}`}</div>
                        <div className="whitespace-pre-line">{item.ruling[contentLang]}</div>
                        {contentLang === 'en' && lang !== 'fr' && p('translated') && <div className="text-xs italic opacity-70">{p('translated')}</div>}
                    </div>
                )}
                {checked
                    ? <Button variant="positive" icon={ArrowRight} block onClick={next}>{!reviewing && index + 1 < total ? tr(lang, 'next') : tr(lang, 'results')}</Button>
                    : <Button icon={CheckCircle2} block disabled={!selected} onClick={check}>{tr(lang, 'checkAnswer')}</Button>}
            </Card>
            <p className="text-xs text-stone-500">{p('source')}</p>
        </div>
    )
}

const QuestionPrompt = ({ text }) => <p className="text-base font-medium text-stone-900">{text}</p>
