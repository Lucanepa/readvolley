// Rules that are under experimentation, or applied with an interpretation that
// comes from an FIVB/CEV rule test, in the current Swiss season. The rules
// view marks them with an asterisk. Source: the SSK explanations of
// 24.08.2026 (RuleChanges2027View, section numbers below) and SSK News 26-2/26-3.
// Update this list when Swiss Volley adopts or drops a test.

const RECEIVING_POSITIONS = {
    note: 'Trial-based: the receiving team may leave its positions from the start of the service execution.',
    section: '3.2',
}

const DOUBLE_CONTACT = {
    note: 'New interpretation from an FIVB test: a double contact on an internal overhand set is allowed.',
    section: '4.1',
}

const HELD_THROWN = {
    note: 'Rule test 2026/27: stricter judging of held and thrown attack balls.',
    section: '5.1',
}

const RULE_EXPERIMENTS = {
    indoor: {
        '7.4': RECEIVING_POSITIONS,
        '7.4.1': RECEIVING_POSITIONS,
        '9.2.2': HELD_THROWN,
        '9.2.3': DOUBLE_CONTACT,
        '9.3.4': DOUBLE_CONTACT,
    },
}

export function ruleExperiment(rulesType, ruleN) {
    return RULE_EXPERIMENTS[rulesType]?.[String(ruleN ?? '').trim()] || null
}

// True when any experimental rule belongs to this article ("9" covers 9.x).
export function articleHasExperiment(rulesType, articleN) {
    const prefix = `${String(articleN ?? '').trim()}.`
    return Object.keys(RULE_EXPERIMENTS[rulesType] || {}).some(n => n.startsWith(prefix))
}
