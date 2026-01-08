import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, MessageSquare, ShieldCheck, Bookmark } from 'lucide-react'
import { api } from '../services/api'

function CasebookModal({ rule, onClose }) {
    const [cases, setCases] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (rule) {
            loadCases()
        } else {
            setCases([])
        }
    }, [rule])

    const loadCases = async () => {
        setLoading(true)
        try {
            // rule.id is like "Rule10_1_1_1_beach"
            const data = await api.getCasebookForRules([`rules/${rule.id}`])
            setCases(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (!rule) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative glass w-full max-w-4xl max-h-[90vh] rounded-[40px] overflow-hidden flex flex-col shadow-2xl border border-white/10"
                >
                    {/* Modal Header */}
                    <div className="p-8 md:p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                                <Bookmark size={28} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black tracking-tight mb-1">Official Casebook</h3>
                                <p className="text-text-secondary font-medium text-lg italic opacity-80">
                                    Clarification for Rule {rule.rule_n}: {rule.title}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 glass hover:bg-white/10 rounded-2xl transition-all hover:rotate-90"
                            aria-label="Close"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto p-8 md:p-14 space-y-16">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                                <p className="font-bold tracking-widest uppercase text-xs text-text-muted">Fetching Scenarios...</p>
                            </div>
                        ) : cases.length === 0 ? (
                            <div className="text-center py-24 glass rounded-[32px] border border-dashed border-white/10">
                                <p className="text-text-muted font-bold tracking-widest uppercase">No specific cases recorded for this rule.</p>
                            </div>
                        ) : (
                            cases.map((entry, idx) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="space-y-10 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-black uppercase tracking-[0.2em] text-orange-500 bg-orange-500/10 px-5 py-2 rounded-xl border border-orange-500/20 shadow-lg">
                                                Scenario {entry.case_number}
                                            </span>
                                        </div>
                                        {entry.video_link && (
                                            <a
                                                href={entry.video_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-base font-bold text-blue-400 hover:text-blue-300 transition-all hover:gap-4 underline-offset-8 hover:underline"
                                            >
                                                Visual Proof <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>

                                    {/* Case Text Container */}
                                    <div className="relative p-10 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors duration-500">
                                        <div className="flex items-center gap-3 mb-6 text-text-primary">
                                            <MessageSquare className="w-6 h-6 text-orange-500" />
                                            <h4 className="font-black text-xl tracking-tight uppercase">The Situation</h4>
                                        </div>
                                        <p className="text-2xl text-white/90 leading-relaxed font-bold tracking-tight italic">
                                            "{entry.case_text}"
                                        </p>
                                    </div>

                                    {/* Ruling Container */}
                                    <div className="p-10 rounded-[32px] bg-orange-500/5 border border-orange-500/10 shadow-inner">
                                        <div className="flex items-center gap-3 mb-6 text-text-primary">
                                            <ShieldCheck className="w-6 h-6 text-green-500" />
                                            <h4 className="font-black text-xl tracking-tight uppercase">Official Ruling</h4>
                                        </div>
                                        <p className="text-xl text-text-secondary leading-relaxed font-semibold">
                                            {entry.case_ruling}
                                        </p>
                                    </div>

                                    {idx < cases.length - 1 && (
                                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-8 border-t border-white/5 text-center text-xs tracking-widest text-text-muted uppercase font-bold bg-white/[0.02]">
                        Ref. Code {rule.id} • Official Casebook Standard
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default CasebookModal
