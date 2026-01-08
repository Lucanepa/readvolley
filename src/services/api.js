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
        const { data, error } = await supabase
            .from('casebook')
            .select('*')
            .contains('rule_reference_array', ruleIds)

        if (error) throw error
        return data
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
        return data
    },

    async getGestures(rulesType) {
        const { data, error } = await supabase
            .from('gestures')
            .select('*')
            .eq('rules_type', rulesType)
            .order('gesture_order', { ascending: true })

        if (error) throw error
        return data
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
