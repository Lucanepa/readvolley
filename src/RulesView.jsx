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
    const [casebookData, setCasebookData] = useState({}) // Mapping: ruleId -> [caseNumbers]

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

        // Fetch rules if not already fetched
        let currentRules = rules[articleId]
        if (!currentRules) {
            currentRules = await api.getRules(articleId)
            setRules(prev => ({ ...prev, [articleId]: currentRules }))
        }

        // Fetch casebook data for these rules if any
        if (currentRules && currentRules.length > 0) {
            try {
                const data = await api.getCasebookData(currentRules.map(r => r.id))
                setCasebookData(prev => ({ ...prev, ...data }))
            } catch (e) {
                console.error("Error checking casebook existence:", e)
            }
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 text-text-muted gap-4">
            <div className={`w-12 h-12 border-4 ${accentBorder} border-t-transparent rounded-full animate-spin`} />
            <p className="font-bold tracking-widest uppercase text-sm">Synchronizing Rulebook...</p>
        </div>
    )

    return (
        <div className="space-y-24 animate-fade-in pb-32">
            <div className="text-center max-w-2xl mx-auto mb-20">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 text-xs font-black tracking-[0.2em] uppercase ${accentColor}`}
                >
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight" style={{ marginBottom: '20px' }}><span className={accentColor}>Rules of the Game</span></h1>
            </div>

            <div className="flex flex-col max-w-6xl mx-auto w-full" style={{ gap: '20px' }}>
                {chapters.map((chapter, index) => (
                    <div key={chapter.id} className="glass rounded-[32px] overflow-hidden border 
                    border-white/5 shadow-2xl transition-all duration-500 hover:border-white/10 w-full"
                        style={{
                            marginTop: index === 0 ? '10px' : '0',
                            marginBottom: index === chapters.length - 1 ? '10px' : '0'
                        }}>
                        <button
                            onClick={() => toggleChapter(chapter.id)}
                            className="w-full flex items-center justify-between p-8 hover:bg-white/5 transition-all text-left group"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center font-black text-[10px] border border-white/5 group-hover:border-white/10 transition-all ${accentColor}`}>
                                    {chapter.order || chapter.id.match(/\d+/)}
                                </div>
                                <div>
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
                                    <div className="flex flex-col" style={{ gap: '20px', padding: '15px' }}>
                                        {articles[chapter.id]?.map((article, index) => (
                                            <div key={article.id} className="rounded-2xl overflow-hidden bg-white/5 border border-white/5"
                                                style={{
                                                    marginTop: index === 0 ? '10px' : '0',
                                                    marginBottom: index === articles[chapter.id].length - 1 ? '10px' : '0'
                                                }}>
                                                <button
                                                    onClick={() => toggleArticle(article.id)}
                                                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-white/5 border border-white/5 text-[10px] font-black ${accentColor}`}>
                                                            {article.article_n}
                                                        </div>
                                                        <span className="font-bold text-lg tracking-tight">{article.title}</span>
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
                                                            <div className="flex flex-col" style={{ gap: '20px', padding: '15px' }}>
                                                                {rules[article.id]?.map((rule, index) => (
                                                                    <div key={rule.id} className="group relative"
                                                                        style={{
                                                                            marginTop: index === 0 ? '10px' : '0',
                                                                            marginBottom: index === rules[article.id].length - 1 ? '10px' : '0'
                                                                        }}>
                                                                        <div className="flex gap-10 items-baseline">
                                                                            {/* Rule Number Column */}
                                                                            <div className={`shrink-0 w-16 text-xl font-black tracking-tight ${accentColor} opacity-50 group-hover:opacity-100 transition-opacity leading-tight text-left`}>
                                                                                {rule.rule_n}
                                                                            </div>

                                                                            {/* Content Column */}
                                                                            <div className="flex-1">
                                                                                {/* Title Row - Only rendered if title or casebook exists */}
                                                                                {((index === 0 || rule.title !== rules[article.id][index - 1]?.title) || casebookData[rule.id]) && (
                                                                                    <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 mb-4">
                                                                                        <div className="flex-1 flex items-baseline gap-3">
                                                                                            {(index === 0 || rule.title !== rules[article.id][index - 1]?.title) && (
                                                                                                <h4 className="font-black text-xl tracking-tight text-white/90 leading-tight">
                                                                                                    {rule.title}
                                                                                                </h4>
                                                                                            )}

                                                                                            {casebookData[rule.id] && (
                                                                                                <button
                                                                                                    onClick={() => setSelectedRuleForCase(rule)}
                                                                                                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all text-[10px] font-black tracking-wider text-orange-500 uppercase ml-2 shadow-lg align-middle"
                                                                                                >
                                                                                                    <AlertCircle size={12} />
                                                                                                    {casebookData[rule.id].length > 1 ? 'Cases' : 'Case'} {casebookData[rule.id].join(', ')}
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {!rule.is_placeholder && rule.text !== rule.title && (
                                                                                    <p className="text-xl text-text-secondary leading-tight font-medium text-justify">
                                                                                        {rule.text}
                                                                                    </p>
                                                                                )}
                                                                            </div>
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
        </div >
    )
}

export default RulesView
