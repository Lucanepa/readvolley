import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, BookOpen, AlertCircle, Hash } from 'lucide-react'
import { api } from './services/api'
import { theme } from './styles/theme'

function RulesView({ environment }) {
    const [chapters, setChapters] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedChapter, setExpandedChapter] = useState(null)
    const [expandedArticle, setExpandedArticle] = useState(null)
    const [articles, setArticles] = useState({})
    const [rules, setRules] = useState({})
    const [casebookData, setCasebookData] = useState({}) // Mapping: ruleId -> [caseNumbers]
    const [expandedRuleCases, setExpandedRuleCases] = useState(null) // ID of rule whose cases are expanded
    const [fullCases, setFullCases] = useState({}) // Mapping: ruleId -> [caseDetails]
    const [articleHasGuidelines, setArticleHasGuidelines] = useState({}) // articleId -> boolean
    const [articleGuidelines, setArticleGuidelines] = useState({}) // articleId -> [guidelineDetails]
    const [expandedArticleGuidelines, setExpandedArticleGuidelines] = useState(null) // ID of article whose guidelines are expanded

    const isBeach = environment === 'beach'
    const color = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary
    const accentBg = isBeach ? theme.colors.beach.primary : theme.colors.indoor.primary
    const accentBorder = isBeach ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'

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

            // Check guidelines existence
            if (articleHasGuidelines[articleId] === undefined) {
                try {
                    const ruleIds = currentRules.map(r => r.id)
                    console.log("RulesView: Checking guidelines for article:", articleId, "rules:", ruleIds)
                    const exists = await api.getGuidelinesExistence(articleId, ruleIds)
                    setArticleHasGuidelines(prev => ({ ...prev, [articleId]: exists }))
                } catch (e) {
                    console.error("RulesView: Error checking guidelines existence:", e)
                }
            }
        }
    }

    const toggleCaseAccordion = async (ruleId) => {
        if (expandedRuleCases === ruleId) {
            setExpandedRuleCases(null)
            return
        }
        setExpandedRuleCases(ruleId)
        if (!fullCases[ruleId]) {
            try {
                const data = await api.getCasebookForRules([ruleId])
                setFullCases(prev => ({ ...prev, [ruleId]: data }))
            } catch (e) {
                console.error("Error loading case details:", e)
            }
        }
    }

    const toggleArticleGuidelines = async (articleId) => {
        console.log("RulesView: Toggling guidelines for article:", articleId)
        if (expandedArticleGuidelines === articleId) {
            setExpandedArticleGuidelines(null)
            return
        }
        setExpandedArticleGuidelines(articleId)
        if (!articleGuidelines[articleId]) {
            try {
                const ruleIds = rules[articleId]?.map(r => r.id) || []
                console.log("RulesView: Fetching full guidelines for article:", articleId, "rules:", ruleIds)
                const data = await api.getGuidelinesForArticle(articleId, ruleIds)
                setArticleGuidelines(prev => ({ ...prev, [articleId]: data }))
            } catch (e) {
                console.error("RulesView: Error loading guidelines:", e)
            }
        }
    }

    if (loading) return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            color: theme.colors.text.muted,
            gap: '1.5rem'
        }}>
            <div style={{
                width: '3rem',
                height: '3rem',
                border: `0.25rem solid ${accentBorder}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Synchronizing Rulebook...</p>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', paddingBottom: '1rem', width: '100%' }}>
            <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.025em', fontFamily: 'Outfit, sans-serif' }}>
                 Rules of the <span style={{ color: color }}>Game</span>
                </h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: theme.styles.container.maxWidth, margin: '0 auto', width: '100%', gap: '0.5rem' }}>
                {chapters.map((chapter, index) => {
                    const isExp = expandedChapter === chapter.id
                    return (
                        <div key={chapter.id} style={{
                            ...theme.styles.glass,
                            borderRadius: '2rem',
                            overflow: 'hidden',
                            border: '0.0625rem solid rgba(255,255,255,0.05)',
                            boxShadow: '0 1.5rem 3rem -0.75rem rgba(0, 0, 0, 0.5)',
                            transition: 'all 0.5s ease',
                            width: '100%',
                            marginTop: index === 0 ? '0.625rem' : '0',
                            marginBottom: index === chapters.length - 1 ? '0.625rem' : '0'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                        >
                            <button
                                onClick={() => toggleChapter(chapter.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    transition: 'all 0.2s',
                                    textAlign: 'left',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{
                                        width: '1.75rem',
                                        height: '1.75rem',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '900',
                                        fontSize: '0.65rem',
                                        border: '0.0625rem solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s',
                                        color: color
                                    }}>
                                        {chapter.order || chapter.id.match(/\d+/)}
                                    </div>
                                    <span style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-0.025em' }}>{chapter.title}</span>
                                </div>
                                <div style={{
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    transition: 'transform 0.3s',
                                    transform: isExp ? 'rotate(180deg)' : 'none'
                                }}>
                                    <ChevronDown size={24} style={{ color: theme.colors.text.muted }} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isExp && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden', borderTop: '0.0625rem solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.2)' }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem' }}>
                                            {articles[chapter.id]?.map((article, aIndex) => (
                                                <div key={article.id} style={{
                                                    borderRadius: '1.25rem',
                                                    overflow: 'hidden',
                                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                                    border: '0.0625rem solid rgba(255,255,255,0.05)',
                                                    marginTop: aIndex === 0 ? '0.625rem' : '0',
                                                    marginBottom: aIndex === articles[chapter.id].length - 1 ? '0.625rem' : '0'
                                                }}>
                                                    <button
                                                        onClick={() => toggleArticle(article.id)}
                                                        style={{
                                                            width: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '1.25rem 1.75rem',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                            <div style={{
                                                                width: '1.75rem',
                                                                height: '1.75rem',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                                border: '0.0625rem solid rgba(255,255,255,0.05)',
                                                                fontSize: '0.65rem',
                                                                fontWeight: '900',
                                                                color: color
                                                            }}>
                                                                {article.article_n}
                                                            </div>
                                                            <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>{article.title}</span>
                                                        </div>
                                                        <ChevronRight size={20} style={{
                                                            color: theme.colors.text.muted,
                                                            transition: 'transform 0.3s',
                                                            transform: expandedArticle === article.id ? 'rotate(90deg)' : 'none'
                                                        }} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {expandedArticle === article.id && (
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: 'auto' }}
                                                                exit={{ height: 0 }}
                                                                style={{ overflow: 'hidden', borderTop: '0.0625rem solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.4)' }}
                                                            >
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                                                                    {/* Referee Guidelines Button */}
                                                                    {articleHasGuidelines[article.id] && (
                                                                        <div style={{ padding: '0.5rem 0' }}>
                                                                            <button
                                                                                onClick={() => toggleArticleGuidelines(article.id)}
                                                                                style={{
                                                                                    width: '100%',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    gap: '0.75rem',
                                                                                    padding: '1rem',
                                                                                    borderRadius: '1rem',
                                                                                    border: '0.0625rem solid',
                                                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                                    fontSize: '0.9rem',
                                                                                    fontWeight: '800',
                                                                                    letterSpacing: '0.05em',
                                                                                    textTransform: 'uppercase',
                                                                                    cursor: 'pointer',
                                                                                    backgroundColor: expandedArticleGuidelines === article.id ? color : 'rgba(255,255,255,0.05)',
                                                                                    borderColor: expandedArticleGuidelines === article.id ? color : 'rgba(255,255,255,0.1)',
                                                                                    color: expandedArticleGuidelines === article.id ? '#000000' : '#ffffff',
                                                                                    boxShadow: expandedArticleGuidelines === article.id ? `0 0.5rem 1.5rem -0.25rem ${color}66` : 'none'
                                                                                }}
                                                                            >
                                                                                <BookOpen size={18} />
                                                                                Referee Guidelines and Instructions
                                                                                <ChevronDown size={18} style={{ transition: 'transform 0.4s', transform: expandedArticleGuidelines === article.id ? 'rotate(180deg)' : 'none' }} />
                                                                            </button>

                                                                            <AnimatePresence>
                                                                                {expandedArticleGuidelines === article.id && (
                                                                                    <motion.div
                                                                                        initial={{ height: 0, opacity: 0 }}
                                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                                        exit={{ height: 0, opacity: 0 }}
                                                                                        style={{ overflow: 'hidden' }}
                                                                                    >
                                                                                        <div style={{
                                                                                            marginTop: '1.5rem',
                                                                                            marginBottom: '1rem',
                                                                                            display: 'flex',
                                                                                            flexDirection: 'column',
                                                                                            gap: '1.25rem',
                                                                                            padding: '1.5rem',
                                                                                            borderRadius: '1.5rem',
                                                                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                                                                            border: '0.0625rem solid rgba(255,255,255,0.05)'
                                                                                        }}>
                                                                                            {!articleGuidelines[article.id] ? (
                                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
                                                                                                    <div style={{
                                                                                                        width: '1.25rem',
                                                                                                        height: '1.25rem',
                                                                                                        border: `0.125rem solid ${accentBorder}`,
                                                                                                        borderTopColor: color,
                                                                                                        borderRadius: '50%',
                                                                                                        animation: 'spin 1s linear infinite'
                                                                                                    }} />
                                                                                                    <span style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.colors.text.muted }}>Loading guidelines...</span>
                                                                                                </div>
                                                                                            ) : (
                                                                                                articleGuidelines[article.id].map((gl) => (
                                                                                                    <div key={gl.id} style={{
                                                                                                        display: 'flex',
                                                                                                        flexDirection: 'column',
                                                                                                        gap: '0.75rem',
                                                                                                        paddingBottom: '1.25rem',
                                                                                                        borderBottom: '0.0625rem solid rgba(255,255,255,0.05)',
                                                                                                        lastChild: { borderBottom: 'none' }
                                                                                                    }}>
                                                                                                        {gl.title && (
                                                                                                            <h5 style={{ fontSize: '1.1rem', fontWeight: '900', color: color, margin: 0 }}>{gl.title}</h5>
                                                                                                        )}
                                                                                                        <p style={{ fontSize: '1.05rem', color: '#ffffff', lineHeight: '1.5', fontWeight: '600', margin: 0, textAlign: 'justify' }}>
                                                                                                            {gl.text}
                                                                                                        </p>
                                                                                                        {gl.notes && (
                                                                                                            <div style={{
                                                                                                                padding: '0.75rem 1rem',
                                                                                                                borderRadius: '0.75rem',
                                                                                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                                                                                borderLeft: `0.125rem solid ${color}`,
                                                                                                                marginTop: '0.25rem'
                                                                                                            }}>
                                                                                                                <p style={{ fontSize: '0.9rem', color: theme.colors.text.secondary, fontWeight: '500', fontStyle: 'italic', margin: 0 }}>
                                                                                                                    {gl.notes}
                                                                                                                </p>
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                ))
                                                                                            )}
                                                                                        </div>
                                                                                    </motion.div>
                                                                                )}
                                                                            </AnimatePresence>
                                                                        </div>
                                                                    )}

                                                                    {rules[article.id]?.map((rule, rIndex) => (
                                                                        <div key={rule.id} style={{
                                                                            position: 'relative',
                                                                            marginTop: rIndex === 0 ? '0.5rem' : '0',
                                                                            marginBottom: rIndex === rules[article.id].length - 1 ? '0.5rem' : '0'
                                                                        }}>
                                                                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'baseline' }}>
                                                                                {/* Rule Number Column */}
                                                                                <div style={{
                                                                                    flexShrink: 0,
                                                                                    width: '3.5rem',
                                                                                    fontSize: '1.1rem',
                                                                                    fontWeight: '900',
                                                                                    letterSpacing: '-0.025em',
                                                                                    color: color,
                                                                                    opacity: 0.5,
                                                                                    lineHeight: '1.2',
                                                                                    textAlign: 'left'
                                                                                }}>
                                                                                    {rule.rule_n}
                                                                                </div>

                                                                                {/* Content Column */}
                                                                                <div style={{ flex: 1 }}>
                                                                                    {/* Title Row */}
                                                                                    {((rIndex === 0 || rule.title !== rules[article.id][rIndex - 1]?.title) || casebookData[rule.id]) && (
                                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '0.75rem' }}>
                                                                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                                                                {(rIndex === 0 || rule.title !== rules[article.id][rIndex - 1]?.title) && (
                                                                                                    <h4 style={{ fontWeight: '900', fontSize: '1.15rem', opacity: 0.9, lineHeight: '1.2', margin: 0, letterSpacing: '-0.01em' }}>
                                                                                                        {rule.title}
                                                                                                    </h4>
                                                                                                )}

                                                                                                {casebookData[rule.id] && (
                                                                                                    <button
                                                                                                        onClick={() => toggleCaseAccordion(rule.id)}
                                                                                                        style={{
                                                                                                            display: 'flex',
                                                                                                            alignItems: 'center',
                                                                                                            gap: '0.4rem',
                                                                                                            padding: '0.25rem 0.6rem',
                                                                                                            borderRadius: '0.5rem',
                                                                                                            border: '0.0625rem solid',
                                                                                                            transition: 'all 0.2s',
                                                                                                            fontSize: '0.6rem',
                                                                                                            fontWeight: '900',
                                                                                                            letterSpacing: '0.05em',
                                                                                                            textTransform: 'uppercase',
                                                                                                            cursor: 'pointer',
                                                                                                            backgroundColor: expandedRuleCases === rule.id ? '#f97316' : 'rgba(249,115,22,0.1)',
                                                                                                            borderColor: expandedRuleCases === rule.id ? '#f97316' : 'rgba(249,115,22,0.2)',
                                                                                                            color: expandedRuleCases === rule.id ? '#ffffff' : '#f97316'
                                                                                                        }}
                                                                                                    >
                                                                                                        <AlertCircle size={10} />
                                                                                                        {casebookData[rule.id].length > 1 ? 'Cases' : 'Case'} {casebookData[rule.id].join(', ')}
                                                                                                        <ChevronDown size={10} style={{ transition: 'transform 0.3s', transform: expandedRuleCases === rule.id ? 'rotate(180deg)' : 'none' }} />
                                                                                                    </button>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    {!rule.is_placeholder && rule.text !== rule.title && (
                                                                                        <p style={{ fontSize: '1.15rem', color: theme.colors.text.secondary, lineHeight: '1.4', fontWeight: '500', textAlign: 'justify', margin: 0 }}>
                                                                                            {rule.text}
                                                                                        </p>
                                                                                    )}

                                                                                    {/* Inline Casebook Accordion */}
                                                                                    <AnimatePresence>
                                                                                        {expandedRuleCases === rule.id && (
                                                                                            <motion.div
                                                                                                initial={{ height: 0, opacity: 0 }}
                                                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                                                exit={{ height: 0, opacity: 0 }}
                                                                                                style={{ overflow: 'hidden' }}
                                                                                            >
                                                                                                <div style={{ marginTop: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '1rem' }}>
                                                                                                    {!fullCases[rule.id] ? (
                                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
                                                                                                            <div style={{
                                                                                                                width: '1.25rem',
                                                                                                                height: '1.25rem',
                                                                                                                border: '0.125rem solid rgba(249,115,22,0.3)',
                                                                                                                borderTopColor: '#f97316',
                                                                                                                borderRadius: '50%',
                                                                                                                animation: 'spin 1s linear infinite'
                                                                                                            }} />
                                                                                                            <span style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(249,115,22,0.7)' }}>Consulting official records...</span>
                                                                                                        </div>
                                                                                                    ) : fullCases[rule.id].length === 0 ? (
                                                                                                        <p style={{ fontSize: '0.875rem', color: theme.colors.text.muted, fontStyle: 'italic', padding: '2rem 1rem' }}>No detailed scenarios available for this rule.</p>
                                                                                                    ) : (
                                                                                                        fullCases[rule.id].map((entry) => (
                                                                                                            <div key={entry.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
                                                                                                                    <span style={{
                                                                                                                        fontSize: '0.6rem',
                                                                                                                        fontWeight: '900',
                                                                                                                        textTransform: 'uppercase',
                                                                                                                        letterSpacing: '0.15em',
                                                                                                                        color: '#f97316',
                                                                                                                        backgroundColor: 'rgba(249,115,22,0.1)',
                                                                                                                        padding: '0.4rem 0.6rem',
                                                                                                                        borderRadius: '0.5rem',
                                                                                                                        border: '0.0625rem solid rgba(249,115,22,0.2)'
                                                                                                                    }}>
                                                                                                                        Scenario {entry.case_number}
                                                                                                                    </span>
                                                                                                                    {entry.video_link && (
                                                                                                                        <a
                                                                                                                            href={entry.video_link}
                                                                                                                            target="_blank"
                                                                                                                            rel="noopener noreferrer"
                                                                                                                            style={{
                                                                                                                                fontSize: '0.7rem',
                                                                                                                                fontWeight: '700',
                                                                                                                                color: '#60a5fa',
                                                                                                                                textDecoration: 'none',
                                                                                                                                padding: '0.3rem 0.6rem',
                                                                                                                                backgroundColor: 'rgba(96, 165, 250, 0.05)',
                                                                                                                                borderRadius: '0.4rem',
                                                                                                                                display: 'flex',
                                                                                                                                alignItems: 'center',
                                                                                                                                gap: '0.3rem'
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            Video Proof <ChevronRight size={10} />
                                                                                                                        </a>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                                <div style={{
                                                                                                                    padding: '1rem',
                                                                                                                    borderRadius: '1.5rem',
                                                                                                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                                                                                                    border: '0.0625rem solid rgba(255, 255, 255, 0.05)',
                                                                                                                    display: 'flex',
                                                                                                                    flexDirection: 'column',
                                                                                                                    gap: '0.75rem',
                                                                                                                    boxShadow: '0 1rem 2.5rem -0.5rem rgba(0, 0, 0, 0.5)',
                                                                                                                    backdropFilter: 'blur(0.5rem)',
                                                                                                                    margin: '0'
                                                                                                                }}>
                                                                                                                    <p style={{
                                                                                                                        fontSize: '1rem', color: '#ffffff', lineHeight: '1.5', fontWeight: '700',
                                                                                                                        fontStyle: 'italic', letterSpacing: '-0.01em', margin: 0, textAlign: 'justify'
                                                                                                                    }}>
                                                                                                                        "{entry.case_text}"
                                                                                                                    </p>
                                                                                                                    <div style={{ paddingTop: '0.75rem', borderTop: '0.0625rem solid rgba(255, 255, 255, 0.1)' }}>
                                                                                                                        <p style={{ fontSize: '0.95rem', color: theme.colors.text.secondary, lineHeight: '1.5', fontWeight: '600', margin: 0, textAlign: 'justify' }}>
                                                                                                                            {entry.case_ruling}
                                                                                                                        </p>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        ))
                                                                                                    )}
                                                                                                </div>
                                                                                            </motion.div>
                                                                                        )}
                                                                                    </AnimatePresence>
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
                    )
                })}
            </div>
        </div>
    )
}

export default RulesView
