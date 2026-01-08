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
            .eq('protocol_filter', rulesType) // Assuming protocol_filter matches rules_type

        if (e2) throw e2

        return { gameProtocol, otherProtocols }
    }
}
