import React, { useState, useEffect } from 'react'
import { BookA, SearchX } from 'lucide-react'
import { api } from './services/api'
import { Card, SearchInput, Skeleton, EmptyState, Notice } from './ui/volleyui'

// Groups the (already sorted) list under its first letter, for the A–Z heads.
const groupByLetter = (list) => {
    const groups = []
    for (const def of list) {
        const letter = (def.term.trim()[0] || '#').toUpperCase()
        const last = groups[groups.length - 1]
        if (last && last.letter === letter) last.items.push(def)
        else groups.push({ letter, items: [def] })
    }
    return groups
}

function DefinitionsView({ environment }) {
    const [definitions, setDefinitions] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadDefinitions()
    }, [environment])

    const loadDefinitions = async () => {
        setLoading(true)
        setLoadError(null)
        try {
            const data = await api.getDefinitions(environment)
            const sorted = [...data].sort((a, b) => a.term.localeCompare(b.term))
            setDefinitions(sorted)
        } catch (e) {
            console.error(e)
            setLoadError(e)
        } finally {
            setLoading(false)
        }
    }

    const filteredDefinitions = definitions.filter(d =>
        d.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.definition.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const groups = groupByLetter(filteredDefinitions)
    const searching = searchTerm.trim() !== ''

    return (
        <div>
            <SearchInput
                aria-label="Search definitions"
                placeholder="Search terms and definitions"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                wrapperClassName="mb-2"
            />
            <p className="mb-3 px-1 text-[11px] tabular-nums text-stone-400" aria-live="polite">
                {loading
                    ? ' '
                    : searching
                        ? `${filteredDefinitions.length} of ${definitions.length} terms`
                        : `${definitions.length} terms`}
            </p>

            {loading ? (
                <Card pad="flush" role="status" aria-busy="true" aria-label="Loading definitions">
                    <div className="divide-y divide-stone-100">
                        {Array.from({ length: 7 }, (_, i) => (
                            <div key={i} className="space-y-2 px-4 py-3.5 sm:px-5">
                                <Skeleton className="h-3.5 w-1/4" />
                                <Skeleton className="h-3 w-5/6" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        ))}
                    </div>
                </Card>
            ) : loadError ? (
                <Notice tone="error">The definitions could not be loaded – please check your connection and reload the page.</Notice>
            ) : filteredDefinitions.length === 0 ? (
                <Card pad="flush">
                    {searching ? (
                        <EmptyState icon={SearchX} title="No matching definitions found.">
                            Try a shorter or different word.
                        </EmptyState>
                    ) : (
                        <EmptyState icon={BookA}>No definitions published for this discipline yet.</EmptyState>
                    )}
                </Card>
            ) : (
                <Card pad="flush" className="overflow-hidden">
                    {groups.map((group) => (
                        <section key={group.letter} className="border-t border-stone-100 first:border-t-0">
                            <h2 className="bg-stone-50/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 sm:px-5">
                                {group.letter}
                            </h2>
                            <dl className="divide-y divide-stone-100 border-t border-stone-100">
                                {group.items.map((def) => (
                                    <div key={def.id} className="px-4 py-3 sm:px-5">
                                        <dt className="text-sm font-semibold leading-snug text-stone-900">{def.term}</dt>
                                        <dd className="mt-1 max-w-prose text-sm leading-relaxed text-stone-600">{def.definition}</dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    ))}
                </Card>
            )}
        </div>
    )
}

export default DefinitionsView
