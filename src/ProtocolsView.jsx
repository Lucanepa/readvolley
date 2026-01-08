import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ShieldCheck, ClipboardList, Info } from 'lucide-react'
import { api } from './services/api'

function ProtocolsView({ environment }) {
    const [data, setData] = useState({ gameProtocol: [], otherProtocols: [] })
    const [loading, setLoading] = useState(true)
    const [activeSubTab, setActiveSubTab] = useState('game')

    useEffect(() => {
        loadProtocols()
    }, [environment])

    const loadProtocols = async () => {
        setLoading(true)
        try {
            const protocols = await api.getProtocols(environment)
            setData(protocols)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex items-center justify-center p-20 text-text-muted">Loading protocols...</div>

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Protocols</h1>
                <p className="text-text-secondary">Official procedures for referees and teams.</p>
            </div>

            <div className="flex bg-white/5 p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveSubTab('game')}
                    className={`px-6 py-2 rounded-xl font-semibold transition-all ${activeSubTab === 'game' ? 'bg-white/10 text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                >
                    Game Protocol
                </button>
                <button
                    onClick={() => setActiveSubTab('other')}
                    className={`px-6 py-2 rounded-xl font-semibold transition-all ${activeSubTab === 'other' ? 'bg-white/10 text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                >
                    Other Protocols
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeSubTab === 'game' ? (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-4"
                    >
                        {data.gameProtocol.map((p) => (
                            <div key={p.id} className="glass p-6 rounded-2xl border border-border-subtle">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-widest">
                                                {p.time_to_start}
                                            </div>
                                            <h3 className="text-xl font-bold">{p.protocoltype}</h3>
                                        </div>
                                        <p className="text-text-secondary leading-relaxed">{p.description}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div className="bg-white/5 p-4 rounded-xl space-y-2">
                                                <h4 className="text-xs font-bold uppercase text-text-muted flex items-center gap-2">
                                                    <ClipboardList className="w-3 h-3" /> Referee Action
                                                </h4>
                                                <p className="text-sm font-medium">{p.referee || 'N/A'}</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl space-y-2">
                                                <h4 className="text-xs font-bold uppercase text-text-muted flex items-center gap-2">
                                                    <ShieldCheck className="w-3 h-3" /> Team Action
                                                </h4>
                                                <p className="text-sm font-medium">{p.teams || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="other"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-4"
                    >
                        {data.otherProtocols.map((p) => (
                            <div key={p.id} className="glass p-6 rounded-2xl border border-border-subtle space-y-4">
                                <h3 className="text-xl font-bold">{p.title}</h3>
                                <div className="space-y-4">
                                    {/* Handle JSON content if it's an array of objects or just text */}
                                    {typeof p.content === 'string' ? (
                                        <p className="text-text-secondary">{p.content}</p>
                                    ) : Array.isArray(p.content) ? (
                                        p.content.map((item, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                                <p className="text-text-secondary text-sm">{item.text || item}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <pre className="text-xs bg-black/20 p-4 rounded-xl overflow-x-auto text-text-muted">
                                            {JSON.stringify(p.content, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ProtocolsView
