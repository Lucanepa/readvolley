import React, { useState } from 'react'
import { Layers, ClipboardCheck, Search, PlaySquare, ChevronRight, ArrowLeft } from 'lucide-react'
import { Card, RowList, SegmentedControl, Button, Banner, FOCUS_RING, cn } from './ui/volleyui'
import { ZK_LANGS } from './zk/strings'
import { getLang, setLang, getLevel, setLevel, tr } from './zk/quiz'
import Cards from './zk/Cards'
import Exam from './zk/Exam'
import Browse from './zk/Browse'
import VideoTest from './zk/VideoTest'

// SSK ZK Prep: practice for the referee Zentralkurs exam. Question and answer
// text is a verbatim copy of the Swiss Volley e-learning platform and must not
// be edited (public/zk_prep/questions_*.json).

const MODES = [
    { id: 'cards', title: 'cardGame', desc: 'cardGameDesc', icon: Layers, View: Cards },
    { id: 'exam', title: 'testMode', desc: 'testModeDesc', icon: ClipboardCheck, View: Exam },
    { id: 'browse', title: 'checkQuestions', desc: 'checkQuestionsDesc', icon: Search, View: Browse },
    { id: 'video', title: 'videoTest', desc: 'videoTestDesc', icon: PlaySquare, View: VideoTest },
]

function ZkPrepView() {
    const [lang, setLangState] = useState(getLang)
    const [level, setLevelState] = useState(getLevel)
    const [modeId, setModeId] = useState(null)
    const mode = MODES.find(m => m.id === modeId)

    const changeLang = (v) => { setLang(v); setLangState(v) }
    const changeLevel = (v) => { setLevel(v); setLevelState(v) }

    const settings = (
        <Card className="space-y-3">
            <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{tr(lang, 'language')}</p>
                <SegmentedControl
                    ariaLabel={tr(lang, 'language')}
                    value={lang}
                    onChange={changeLang}
                    options={ZK_LANGS.map(l => ({ value: l, label: l.toUpperCase() }))}
                />
            </div>
            <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{tr(lang, 'level')}</p>
                <SegmentedControl
                    ariaLabel={tr(lang, 'level')}
                    value={level}
                    onChange={changeLevel}
                    options={[{ value: 'national', label: tr(lang, 'national') }, { value: 'regional', label: tr(lang, 'regional') }]}
                />
            </div>
        </Card>
    )

    if (mode) {
        const { View } = mode
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => setModeId(null)}>{tr(lang, 'home')}</Button>
                    <h2 className="text-sm font-semibold text-stone-700">{tr(lang, mode.title)}</h2>
                </div>
                {settings}
                <View lang={lang} level={level} />
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-stone-600">{tr(lang, 'subtitle')}</p>
            {settings}
            <Card pad="list">
                <RowList>
                    {MODES.map(({ id, title, desc, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setModeId(id)}
                            className={cn('group flex w-full items-start gap-3 rounded-md px-1 py-3 text-left transition-colors hover:bg-stone-50', FOCUS_RING)}
                        >
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
                                <Icon size={18} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-stone-900">{tr(lang, title)}</span>
                                <span className="mt-0.5 block text-xs text-stone-500">{tr(lang, desc)}</span>
                            </span>
                            <ChevronRight size={16} className="mt-2.5 shrink-0 text-stone-400 group-hover:text-stone-600" aria-hidden="true" />
                        </button>
                    ))}
                </RowList>
            </Card>
            <Banner tone="info">
                <strong>{tr(lang, 'disclaimerTitle')}.</strong> {tr(lang, 'disclaimerBody')}
            </Banner>
        </div>
    )
}

export default ZkPrepView
