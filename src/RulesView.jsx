import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, BookOpen, AlertCircle, Hash } from 'lucide-react'
import { api } from './services/api'
import CasebookModal from './components/CasebookModal'

function RulesView({ environment }) {
    const [chapters, setChapters] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedChapter, setExpandedChapter] = useState(null)
    const [expandedArticle, setExpandedArticle] = useState(null)
    const [articles, setArticles] = useState({})
    const [rules, setRules] = useState({})

    const [selectedRuleForCase, setSelectedRuleForCase] = useState(null)

    const isBeach = environment === 'beach'
    const accentColor = isBeach ? 'text-beach-primary' : 'text-indoor-primary'
    const accentBg = isBeach ? 'bg-beach-primary' : 'bg-indoor-primary'
    const accentBorder = isBeach ? 'border-beach-primary/30' : 'border-indoor-primary/30'

    useEffect(() => {
        loadChapters()
    }, [environment])

    const loadChapters = async () => {
        setLoading(true)
        try {
            const data = await api.getChapters(environment)
            setChapters(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const toggleChapter = async (chapterId) => {
        if (expandedChapter === chapterId) {
            setExpandedChapter(null)
            return
        }
        setExpandedChapter(chapterId)
        if (!articles[chapterId]) {
            const data = await api.getArticles(chapterId)
            setArticles(prev => ({ ...prev, [chapterId]: data }))
        }
    }

    const toggleArticle = async (articleId) => {
        if (expandedArticle === articleId) {
            setExpandedArticle(null)
            return
        }
        setExpandedArticle(articleId)
        if (!rules[articleId]) {
            const data = await api.getRules(articleId)
            setRules(prev => ({ ...prev, [articleId]: data }))
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 text-text-muted gap-4">
            <div className={`w-12 h-12 border-4 ${accentBorder} border-t-transparent rounded-full animate-spin`} />
            <p className="font-bold tracking-widest uppercase text-sm">Synchronizing Rulebook...</p>
        </div>
    )

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 text-xs font-black tracking-[0.2em] uppercase ${accentColor}`}
                >
                    <BookOpen size={14} /> Official Rulebook
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Structured <span className={accentColor}>Rules</span></h1>
                <p className="text-xl text-text-secondary font-medium">
                    Navigate through the official {environment} volleyball hierarchy.
                    Data is synced directly from international standards.
                </p>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto w-full">
                {chapters.map((chapter) => (
                    <div key={chapter.id} className="glass rounded-[32px] overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 hover:border-white/10">
                        <button
                            onClick={() => toggleChapter(chapter.id)}
                            className="w-full flex items-center justify-between p-8 hover:bg-white/5 transition-all text-left group"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-xl border border-white/5 group-hover:border-white/10 transition-all ${accentColor}`}>
                                    {chapter.order || chapter.id.match(/\d+/)}
                                </div>
                                <div>
                                    <span className="text-xs font-black tracking-widest text-text-muted uppercase mb-1 block opacity-60">Chapter</span>
                                    <span className="font-black text-2xl tracking-tight">{chapter.title}</span>
                                </div>
                            </div>
                            <div className={`p-2 rounded-full transition-transform duration-300 ${expandedChapter === chapter.id ? 'rotate-180 mb-1' : ''}`}>
                                <ChevronDown className="w-6 h-6 text-text-muted" />
                            </div>
                        </button>

                        <AnimatePresence>
                            {expandedChapter === chapter.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-white/5 bg-black/20"
                                >
                                    <div className="p-4 space-y-3">
                                        {articles[chapter.id]?.map((article) => (
                                            <div key={article.id} className="rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                                                <button
                                                    onClick={() => toggleArticle(article.id)}
                                                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/5 ${accentColor}`}>
                                                            <Hash size={16} />
                                                        </div>
                                                        <span className="font-bold text-lg tracking-tight">Article {article.article_n}: {article.title}</span>
                                                    </div>
                                                    <ChevronRight className={`w-5 h-5 text-text-muted transition-transform duration-300 ${expandedArticle === article.id ? 'rotate-90' : ''}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {expandedArticle === article.id && (
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: 'auto' }}
                                                            exit={{ height: 0 }}
                                                            className="overflow-hidden border-t border-white/5 bg-black/40"
                                                        >
                                                            <div className="p-8 space-y-10">
                                                                {rules[article.id]?.map((rule) => (
                                                                    <div key={rule.id} className="group relative">
                                                                        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                                                            <div className="flex-1 space-y-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className={`text-sm font-black py-1 px-3 rounded-lg bg-white/5 border border-white/10 ${accentColor}`}>
                                                                                        {rule.rule_n}
                                                                                    </span>
                                                                                    <h4 className="font-black text-xl tracking-tight text-white/90 leading-none">
                                                                                        {rule.title}
                                                                                    </h4>
                                                                                </div>
                                                                                <p className="text-lg text-text-secondary leading-relaxed font-medium">
                                                                                    {rule.text}
                                                                                </p>
                                                                            </div>

                                                                            <button
                                                                                onClick={() => setSelectedRuleForCase(rule)}
                                                                                className={`shrink-0 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-bold tracking-tight text-sm shadow-lg group-hover:translate-y-[-2px]`}
                                                                            >
                                                                                <AlertCircle className={`w-5 h-5 ${accentColor}`} />
                                                                                View Casebook
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <CasebookModal
                rule={selectedRuleForCase}
                onClose={() => setSelectedRuleForCase(null)}
            />
        </div>
    )
}

export default RulesView
