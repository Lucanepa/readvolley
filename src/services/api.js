import { supabase } from '../lib/supabase'

export const api = {
    async getChapters(rulesType) {
        const { data, error } = await supabase
            .from('chapters')
            .select('*')
            .eq('rules_type', rulesType)
            .order('sort_order', { ascending: true })

        if (error) throw error
        return data
    },

    async getArticles(chapterId) {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('chapter_id', chapterId)
            .order('article_n', { ascending: true })

        if (error) throw error
        return data
    },

    async getRules(articleId) {
        const { data, error } = await supabase
            .from('rules')
            .select('*')
            .eq('article_id', articleId)
            .order('sort_index_rule', { ascending: true })

        if (error) throw error
        return data
    },

    async getCasebookForRules(ruleIds) {
        // 1. Get casebook IDs from junction table
        const { data: junctionData, error: jError } = await supabase
            .from('casebook_rules')
            .select('casebook_id')
            .in('rule_id', ruleIds)

        if (jError) throw jError
        if (!junctionData?.length) return []

        const casebookIds = [...new Set(junctionData.map(j => j.casebook_id))]

        // 2. Get full casebook records
        const { data: cases, error: cError } = await supabase
            .from('casebook')
            .select('*')
            .in('id', casebookIds)

        if (cError) throw cError
        return cases || []
    },

    async getCasebookData(ruleIds) {
        if (!ruleIds || ruleIds.length === 0) return {}
        console.log("Fetching Junctions for IDs:", ruleIds)

        // 1. Get mapping from junction table
        const { data: junctionData, error: jError } = await supabase
            .from('casebook_rules')
            .select('rule_id, casebook_id')
            .in('rule_id', ruleIds)

        if (jError) throw jError

        if (!junctionData?.length) return {}

        // 2. Get casebook details for found IDs
        const casebookIds = [...new Set(junctionData.map(j => j.casebook_id))]
        const { data: casebookDetails, error: cError } = await supabase
            .from('casebook')
            .select('id, case_number')
            .in('id', casebookIds)

        if (cError) throw cError

        // 3. Map rule IDs to their associated case numbers
        const idToCaseNum = {}
        casebookDetails?.forEach(c => {
            idToCaseNum[c.id] = c.case_number
        })

        const ruleToCases = {}
        junctionData.forEach(item => {
            const ruleId = item.rule_id
            const caseNum = idToCaseNum[item.casebook_id]?.toString()

            if (ruleId && caseNum) {
                if (!ruleToCases[ruleId]) {
                    ruleToCases[ruleId] = []
                }
                if (!ruleToCases[ruleId].includes(caseNum)) {
                    ruleToCases[ruleId].push(caseNum)
                }
            }
        })
        return ruleToCases
    },

    async getGuidelinesForArticle(articleId, ruleIds = []) {
        console.log("Fetching Guidelines for Article:", articleId, "Rule IDs:", ruleIds)

        // 1. Get guidelines directly linked to the article
        const { data: artData, error: artError } = await supabase
            .from('guidelines')
            .select('*')
            .eq('article_id', articleId)

        if (artError) {
            console.error("Error fetching article guidelines:", articleId, artError)
            throw artError
        }

        let results = artData || []

        // 2. Get guidelines linked to any rule in that article
        if (ruleIds.length > 0) {
            const { data: ruleData, error: ruleError } = await supabase
                .from('guidelines')
                .select('*')
                .in('rule_id', ruleIds)

            if (ruleError) {
                console.error("Error fetching rule guidelines:", ruleIds, ruleError)
                throw ruleError
            }

            // Merge and deduplicate by ID
            if (ruleData) {
                const existingIds = new Set(results.map(g => g.id))
                ruleData.forEach(g => {
                    if (!existingIds.has(g.id)) {
                        results.push(g)
                    }
                })
            }
        }

        console.log("Guidelines found:", results.length)
        return results
    },

    async getGuidelinesExistence(articleId, ruleIds = []) {
        console.log("Checking existence for Article:", articleId, "Rules:", ruleIds)

        // Check article association
        const { data: artData, error: artError } = await supabase
            .from('guidelines')
            .select('id')
            .eq('article_id', articleId)
            .limit(1)

        if (artError) {
            console.error("Error checking article guideline existence:", artError)
            throw artError
        }
        if (artData?.length > 0) {
            console.log("Found guideline by article_id")
            return true
        }

        // Check rule associations
        if (ruleIds.length > 0) {
            const { data: ruleData, error: ruleError } = await supabase
                .from('guidelines')
                .select('id')
                .in('rule_id', ruleIds)
                .limit(1)

            if (ruleError) {
                console.error("Error checking rule guideline existence:", ruleError)
                throw ruleError
            }
            if (ruleData?.length > 0) {
                console.log("Found guideline by rule_id")
                return true
            }
        }

        console.log("No guidelines found for article/rules")
        return false
    },

    async getDefinitions(rulesType) {
        const { data, error } = await supabase
            .from('definitions')
            .select('*')
            .eq('rules_type', rulesType)

        if (error) throw error
        return data
    },

    async getDiagrams(rulesType) {
        const { data, error } = await supabase
            .from('diagrams')
            .select('*')
            .eq('rules_type', rulesType)
            .order('diagram_order', { ascending: true })

        if (error) throw error

        return data.map(diagram => {
            const safeToken = (s) => (s || 'unknown').toString().trim().replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '')
            const n = safeToken(diagram.diagram_n)
            const type = safeToken(diagram.rules_type)

            return {
                ...diagram,
                url: `/diagrams_images/diagram_${n}_${type}.png`
            }
        })
    },

    async getGestures(rulesType) {
        const { data, error } = await supabase
            .from('gestures')
            .select('*')
            .eq('rules_type', rulesType)
            .order('gesture_order', { ascending: true })

        if (error) throw error

        return data.map(gesture => {
            const safeToken = (s) => (s || 'unknown').toString().trim().replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '')
            const n = safeToken(gesture.gesture_n)
            const type = safeToken(gesture.rules_type)

            return {
                ...gesture,
                url: `/gestures_images/gesture_${n}_${type}.png`
            }
        })
    },

    async getProtocols(rulesType) {
        const { data: gameProtocol, error: e1 } = await supabase
            .from('game_protocol')
            .select('*')
            .eq('rules_type', rulesType)
            .order('sort_order', { ascending: true })

        if (e1) throw e1

        const { data: otherProtocols, error: e2 } = await supabase
            .from('other_protocols')
            .select('*')
        //.eq('protocol_filter', rulesType) // Removed filter to show all "Other" protocols

        if (e2) throw e2

        return { gameProtocol, otherProtocols }
    },

    async getAllSearchData() {
        // Fetch everything in parallel
        const [
            { data: chapters },
            { data: articles },
            { data: rules },
            { data: cases },
            { data: definitions },
            { data: gameProtocols },
            { data: otherProtocols },
            { data: diagrams },
            { data: gestures },
            { data: casebookRules }
        ] = await Promise.all([
            supabase.from('chapters').select('*'),
            supabase.from('articles').select('*'),
            supabase.from('rules').select('*'),
            supabase.from('casebook').select('*'),
            supabase.from('definitions').select('*'),
            supabase.from('game_protocol').select('*'),
            supabase.from('other_protocols').select('*'),
            supabase.from('diagrams').select('*'),
            supabase.from('gestures').select('*'),
            supabase.from('casebook_rules').select('*')
        ])

        return {
            chapters: chapters || [],
            articles: articles || [],
            rules: rules || [],
            cases: cases || [],
            definitions: definitions || [],
            gameProtocols: gameProtocols || [],
            otherProtocols: otherProtocols || [],
            diagrams: diagrams || [],
            gestures: gestures || [],
            casebookRules: casebookRules || [],
            guidelines: (await supabase.from('guidelines').select('*')).data || []
        }
    }
}
