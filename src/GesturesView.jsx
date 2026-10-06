import React, { useState, useEffect } from 'react'
import { Hand, ImageOff, Maximize2, RotateCw } from 'lucide-react'
import { api } from './services/api'
import {
    Button, Card, CardHeading, EmptyState, FOCUS_RING, Modal, Notice, Skeleton, cn,
} from './ui/volleyui'

// Shows the picture, or a quiet placeholder when the file cannot be loaded
// (otherwise the browser draws the alt text over the tile).
function ContentImage({ src, alt, className, lazy = true }) {
    const [failed, setFailed] = useState(false)
    if (failed || !src) return (
        <span className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-1.5 text-stone-400">
            <ImageOff size={22} strokeWidth={1.75} aria-hidden="true" />
            <span className="text-xs">Image unavailable</span>
        </span>
    )
    return (
        <img
            src={src}
            alt={alt}
            loading={lazy ? 'lazy' : undefined}
            decoding="async"
            onError={() => setFailed(true)}
            className={className}
        />
    )
}

const REFEREE_ROLES = [
    { key: 'first_r', role: 1, text: '1st referee responsibility', special: false },
    { key: 'first_r_special', role: 1, text: '1st referee in particular situations', special: true },
    { key: 'second_r', role: 2, text: '2nd referee responsibility', special: false },
    { key: 'second_r_special', role: 2, text: '2nd referee in particular situations', special: true },
]

function GesturesView({ environment }) {
    const [gestures, setGestures] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [selectedGesture, setSelectedGesture] = useState(null)

    useEffect(() => {
        loadGestures()
    }, [environment])

    const loadGestures = async () => {
        setLoading(true)
        setError(false)
        try {
            const data = await api.getGestures(environment)
            setGestures(data)
        } catch (e) {
            console.error(e)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    const renderText = (text) => {
        if (!text) return null
        return text.toString().replace(/\\n/g, '\n').split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>
                {line}
                {i !== arr.length - 1 && <br />}
            </React.Fragment>
        ))
    }

    if (loading) return (
        <Card role="status" aria-busy="true">
            <span className="sr-only">Loading hand signals…</span>
            <Skeleton className="mb-4 h-4 w-40" />
            <div className="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                    <div key={i}>
                        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                        <Skeleton className="mt-2.5 h-3 w-14" />
                        <Skeleton className="mt-1.5 h-4 w-2/3" />
                        <Skeleton className="mt-2 h-3 w-full" />
                        <Skeleton className="mt-1.5 h-3 w-4/5" />
                    </div>
                ))}
            </div>
        </Card>
    )

    if (error) return (
        <Card>
            <div className="flex flex-col items-start gap-3">
                <Notice>The hand signals could not be loaded – please check your connection and try again.</Notice>
                <Button variant="secondary" icon={RotateCw} className="h-11 sm:h-9" onClick={loadGestures}>Try again</Button>
            </div>
        </Card>
    )

    if (gestures.length === 0) return (
        <Card>
            <EmptyState icon={Hand}>No hand signals available for this discipline yet.</EmptyState>
        </Card>
    )

    return (
        <>
            <Card>
                <CardHeading
                    title="Referee hand signals"
                    actions={(
                        <span className="text-xs tabular-nums text-stone-500">
                            {gestures.length} {gestures.length === 1 ? 'signal' : 'signals'}
                        </span>
                    )}
                />
                <ul className="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                    {gestures.map((gesture) => {
                        const roles = REFEREE_ROLES.filter(r => gesture[r.key])
                        return (
                            <li key={gesture.id} className="flex min-w-0 flex-col">
                                <button
                                    type="button"
                                    onClick={() => setSelectedGesture(gesture)}
                                    aria-label={`Enlarge signal ${gesture.gesture_n}`}
                                    className={cn('group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl border border-stone-200 bg-white p-3 transition-colors hover:border-stone-300', FOCUS_RING)}
                                >
                                    <ContentImage
                                        src={gesture.url}
                                        alt={gesture.title}
                                        className="h-full w-full object-contain"
                                    />
                                    <span
                                        aria-hidden="true"
                                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-400 transition-colors group-hover:text-stone-700"
                                    >
                                        <Maximize2 size={14} />
                                    </span>
                                </button>

                                <div className="mt-2 flex min-w-0 flex-1 flex-col px-0.5">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide tabular-nums text-stone-400">
                                        Signal {gesture.gesture_n}
                                    </p>
                                    <h3 className="mt-0.5 break-words text-sm font-semibold leading-snug text-stone-800">
                                        {renderText(gesture.title)}
                                    </h3>
                                    {gesture.text && (
                                        <p className="mt-1.5 break-words text-sm leading-relaxed text-stone-600">
                                            {renderText(gesture.text)}
                                        </p>
                                    )}

                                    {roles.length > 0 && (
                                        <div className="mt-auto pt-3">
                                            <ul className="space-y-1.5 border-t border-stone-100 pt-2.5">
                                                {roles.map(r => (
                                                    <li key={r.key} className="flex items-center gap-2">
                                                        <span
                                                            aria-hidden="true"
                                                            className={cn(
                                                                'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-[1.5px] border-stone-800 text-[11px] font-bold tabular-nums',
                                                                r.special ? 'bg-white text-stone-800' : 'bg-stone-800 text-white',
                                                            )}
                                                        >
                                                            {r.role}
                                                        </span>
                                                        <span className={cn('break-words text-xs leading-snug', r.special ? 'text-stone-500' : 'text-stone-700')}>
                                                            {r.text}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </Card>

            <Modal
                open={!!selectedGesture}
                onClose={() => setSelectedGesture(null)}
                layout="sections"
                size="xl"
                className="max-w-4xl"
                closeLabel="Close"
                title={selectedGesture ? renderText(selectedGesture.title) : undefined}
                description={selectedGesture ? `Signal ${selectedGesture.gesture_n}` : undefined}
            >
                {selectedGesture && (
                    <>
                        <div className="rounded-xl border border-stone-200 bg-white p-2">
                            <ContentImage
                                lazy={false}
                                src={selectedGesture.url}
                                alt={selectedGesture.title}
                                className="mx-auto max-h-[60vh] w-full object-contain"
                            />
                        </div>
                        {selectedGesture.text && (
                            <p className="text-sm leading-relaxed text-stone-700">
                                {renderText(selectedGesture.text)}
                            </p>
                        )}
                        {selectedGesture.notes && (
                            <p className="text-xs italic leading-relaxed text-stone-500">
                                {selectedGesture.notes}
                            </p>
                        )}
                    </>
                )}
            </Modal>
        </>
    )
}

export default GesturesView
