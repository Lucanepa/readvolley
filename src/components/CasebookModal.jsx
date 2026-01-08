import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, MessageSquare, ShieldCheck } from 'lucide-react'
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
            // Supabase contains array like ["rules/Rule10_1_1_1_beach"]
            const data = await api.getCasebookForRules([`rules/${rule.id}`])
            setCases(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {rule && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative glass w-full max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10"
                    >
                        <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h3 className="text-xl font-bold">Casebook: Rule {rule.rule_n}</h3>
                                <p className="text-sm text-text-secondary">{rule.title}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {loading ? (
                                <div className="text-center py-20 text-text-secondary">Loading cases...</div>
                            ) : cases.length === 0 ? (
                                <div className="text-center py-20 text-text-secondary">No casebook entries found for this rule.</div>
                            ) : (
                                cases.map((entry, idx) => (
                                    <div key={entry.id} className="space-y-6 pb-8 border-b border-border-subtle last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">
                                                Case {entry.case_number}
                                            </span>
                                            {entry.video_link && (
                                                <a
                                                    href={entry.video_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    Watch Video <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-text-primary">
                                                <MessageSquare className="w-4 h-4 text-orange-500" />
                                                <h4 className="font-bold underline decoration-orange-500/30 underline-offset-4">Case Text</h4>
                                            </div>
                                            <p className="text-lg text-white/90 leading-relaxed font-medium pl-6 border-l-2 border-white/5">
                                                {entry.case_text}
                                            </p>
                                        </div>

                                        <div className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-2 text-text-primary">
                                                <ShieldInfo className="w-4 h-4 text-green-500" />
                                                <h4 className="font-bold">Ruling</h4>
                                            </div>
                                            <p className="text-text-secondary leading-relaxed italic">
                                                {entry.case_ruling}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default CasebookModal
