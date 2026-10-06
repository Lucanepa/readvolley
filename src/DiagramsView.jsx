import React, { useState, useEffect } from 'react'
import { Image as ImageIcon, ImageOff, Maximize2, RotateCw } from 'lucide-react'
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

function TileSkeletons({ label, count = 6 }) {
    return (
        <Card role="status" aria-busy="true">
            <span className="sr-only">{label}</span>
            <Skeleton className="mb-4 h-4 w-40" />
            <div className="grid grid-cols-1 gap-x-3 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: count }, (_, i) => (
                    <div key={i}>
                        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                        <Skeleton className="mt-2.5 h-3 w-16" />
                        <Skeleton className="mt-1.5 h-4 w-2/3" />
                    </div>
                ))}
            </div>
        </Card>
    )
}

function DiagramsView({ environment }) {
    const [diagrams, setDiagrams] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [selectedDiagram, setSelectedDiagram] = useState(null)

    useEffect(() => {
        loadDiagrams()
    }, [environment])

    const loadDiagrams = async () => {
        setLoading(true)
        setError(false)
        try {
            const data = await api.getDiagrams(environment)
            setDiagrams(data)
        } catch (e) {
            console.error(e)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <TileSkeletons label="Loading diagrams…" />

    if (error) return (
        <Card>
            <div className="flex flex-col items-start gap-3">
                <Notice>The diagrams could not be loaded – please check your connection and try again.</Notice>
                <Button variant="secondary" icon={RotateCw} className="h-11 sm:h-9" onClick={loadDiagrams}>Try again</Button>
            </div>
        </Card>
    )

    if (diagrams.length === 0) return (
        <Card>
            <EmptyState icon={ImageIcon}>No diagrams available for this discipline yet.</EmptyState>
        </Card>
    )

    return (
        <>
            <Card>
                <CardHeading
                    title="Official diagrams"
                    actions={(
                        <span className="text-xs tabular-nums text-stone-500">
                            {diagrams.length} {diagrams.length === 1 ? 'diagram' : 'diagrams'}
                        </span>
                    )}
                />
                <ul className="grid grid-cols-1 gap-x-3 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    {diagrams.map((diagram) => (
                        <li key={diagram.id} className="min-w-0">
                            <button
                                type="button"
                                onClick={() => setSelectedDiagram(diagram)}
                                aria-label={`Enlarge diagram ${diagram.diagram_n}: ${diagram.diagram_name}`}
                                className={cn('group block w-full cursor-zoom-in rounded-xl text-left', FOCUS_RING)}
                            >
                                <span className="relative block aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-white p-3 transition-colors group-hover:border-stone-300">
                                    <ContentImage
                                        src={diagram.url}
                                        alt={diagram.diagram_name || diagram.name}
                                        className="h-full w-full object-contain"
                                    />
                                    <span
                                        aria-hidden="true"
                                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-400 transition-colors group-hover:text-stone-700"
                                    >
                                        <Maximize2 size={14} />
                                    </span>
                                </span>
                                <span className="mt-2 block px-0.5">
                                    <span className="block text-[11px] font-semibold uppercase tracking-wide tabular-nums text-stone-400">
                                        Diagram {diagram.diagram_n}
                                    </span>
                                    <span className="mt-0.5 block break-words text-sm font-semibold leading-snug text-stone-800">
                                        {diagram.diagram_name}
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </Card>

            <Modal
                open={!!selectedDiagram}
                onClose={() => setSelectedDiagram(null)}
                layout="sections"
                size="xl"
                className="max-w-4xl"
                closeLabel="Close"
                title={selectedDiagram?.diagram_name}
                description={selectedDiagram ? `Diagram ${selectedDiagram.diagram_n}` : undefined}
            >
                {selectedDiagram && (
                    <div className="rounded-xl border border-stone-200 bg-white p-2">
                        <ContentImage
                            lazy={false}
                            src={selectedDiagram.url}
                            alt={selectedDiagram.diagram_name || selectedDiagram.name}
                            className="mx-auto max-h-[70vh] w-full object-contain"
                        />
                    </div>
                )}
            </Modal>
        </>
    )
}

export default DiagramsView
