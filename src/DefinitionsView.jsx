import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Info } from 'lucide-react'
import { api } from './services/api'

function DefinitionsView({ environment }) {
    const [definitions, setDefinitions] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDefinitions()
    }, [environment])

    const loadDefinitions = async () => {
        setLoading(true)
        try {
            const data = await api.getDefinitions(environment)
            setDefinitions(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const filtered = definitions.filter(d =>
        d.term.toLowerCase().includes(search.toLowerCase()) ||
        d.definition.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <div className="flex items-center justify-center p-20 text-text-muted">Loading definitions...</div>

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Definitions & Terms</h1>
                    <p className="text-text-secondary">Official terminology and their meanings.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search terms..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-white/20 transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filtered.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        className="glass p-6 rounded-2xl border border-border-subtle hover:bg-white/[0.03] transition-colors"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                                <Info className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">{item.term}</h3>
                                <p className="text-text-secondary leading-relaxed">{item.definition}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-20 text-text-muted">No terms found matching your search.</div>
                )}
            </div>
        </div>
    )
}

export default DefinitionsView
