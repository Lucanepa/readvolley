import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, BookOpen, AlertCircle } from 'lucide-react'
import { api } from './services/api'
import CasebookModal from './components/CasebookModal'

function RulesView({ environment }) {
    const [chapters, setChapters] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedChapter, setExpandedChapter] = useState(null)
    const [expandedArticle, setExpandedArticle] = useState(null)
    const [articles, setArticles] = useState({}) // chapterId -> [articles]
    const [rules, setRules] = useState({}) // articleId -> [rules]

    const [selectedRuleForCase, setSelectedRuleForCase] = useState(null)

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

    if (loading) return <div className="flex items-center justify-center p-20 text-text-muted">Loading rules...</div>

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Official Rules</h1>
                <p className="text-text-secondary">Explore the {environment} volleyball rulebook.</p>
            </div>

            <div className="space-y-2">
                {chapters.map((chapter) => (
                    <div key={chapter.id} className="glass rounded-2xl overflow-hidden border border-border-subtle">
                        <button
                            onClick={() => toggleChapter(chapter.id)}
                            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-mono text-text-muted">Chapter {chapter.order || chapter.id.match(/\d+/)}</span>
                                <span className="font-semibold text-lg">{chapter.title}</span>
                            </div>
                            {expandedChapter === chapter.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>

                        <AnimatePresence>
                            {expandedChapter === chapter.id && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden border-t border-border-subtle bg-white/[0.02]"
                                >
                                    <div className="p-2 space-y-1">
                                        {articles[chapter.id]?.map((article) => (
                                            <div key={article.id} className="rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => toggleArticle(article.id)}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <BookOpen className="w-4 h-4 text-text-muted" />
                                                        <span className="font-medium">Article {article.article_n}: {article.title}</span>
                                                    </div>
                                                    {expandedArticle === article.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </button>

                                                <AnimatePresence>
                                                    {expandedArticle === article.id && (
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: 'auto' }}
                                                            exit={{ height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-4 pl-11 space-y-6">
                                                                {rules[article.id]?.map((rule) => (
                                                                    <div key={rule.id} className="group">
                                                                        <div className="flex items-start justify-between gap-4">
                                                                            <div className="space-y-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-mono py-0.5 px-2 bg-white/10 rounded text-text-secondary">
                                                                                        {rule.rule_n}
                                                                                    </span>
                                                                                    <span className="font-bold text-sm tracking-wide uppercase text-white/90">
                                                                                        {rule.title}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-text-secondary leading-relaxed">
                                                                                    {rule.text}
                                                                                </p>
                                                                            </div>

                                                                            <button
                                                                                onClick={() => setSelectedRuleForCase(rule)}
                                                                                className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all text-xs font-semibold opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                                            >
                                                                                <AlertCircle className="w-3 h-3" />
                                                                                Casebook
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
