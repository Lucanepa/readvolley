import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { accordionMotion } from './styles/motion'
import { Card, BUTTON_SIZES, BUTTON_VARIANTS, FOCUS_RING, FOCUS_RING_INSET, cn } from './ui/volleyui'

const SOURCE_URL = 'https://www.volleyball.ch/_Resources/Persistent/c/b/3/f/cb3f0be3e71e90986627eb3a02716135646b33e3/26.08.24_%C3%84nderungen-Regeln-2027-d.pdf'

/**
 * Chapters 3 to 5 of the SSK document "Offizielle Volleyball-Regeln 2025-2028 /
 * Regeländerungen — Erläuterungen für Schiedsrichterinnen und Schiedsrichter"
 * (version 24.08.2026), translated into English. The German original linked at
 * the top of the view remains the binding text.
 */
const CHAPTERS = [
    {
        number: '3',
        title: 'Further explanations',
        sections: [
            {
                number: '3.1',
                title: 'Positions of the serving team (Rule 7.4)',
                blocks: [
                    { type: 'p', text: 'The players of the serving team may now take up any position at the moment of the service. This does not release them from lining up on court according to the correct rotational order at the beginning of the set, so that the 2nd referee can check it. Only afterwards may they position themselves freely.' },
                ],
            },
            {
                number: '3.2',
                title: 'Positions of the receiving team (Rule 7.4): adapted implementation',
                blocks: [
                    { type: 'p', text: 'Based on a trial (FIVB/CEV), the receiving team is no longer bound to its positions until the ball is hit either. The start of the service execution is now the moment from which the players may take up their positions on court freely (the moment at which a fault can occur).' },
                    { type: 'p', text: 'The start of the service execution is, for example, the first step, the toss of the ball, or a first arm or foot movement initiating the service. Bouncing the ball, moving it from hand to hand, or taking a deep breath do not yet count as the start of the service execution.' },
                    { type: 'p', text: 'The players must still be within their own court until the ball is hit.' },
                    { type: 'p', text: 'If the server commits a fault when hitting the ball, that fault is still considered to have been committed first and is sanctioned ahead of a positional fault of the opponent (Rules 7.5.2 and 12.7.1). The referee must therefore wait with the whistle for a positional fault until the ball has been hit, so that a fault in the execution of the service can also be recognised.' },
                ],
            },
            {
                number: '3.3',
                title: 'Screening (Rule 12.5.3): hands above head height',
                blocks: [
                    { type: 'p', text: 'The purpose of adapting this rule was to strengthen the idea of fair play.' },
                    { type: 'p', text: 'Players may not hold their hands higher than their head until the ball has crossed the plane of the net. It does not matter whether this involves one hand, part of a hand, or both hands. This is to prevent hands and arms being used as a kind of screen against the opponent. Players may still protect the back of their head with their hands; placing the hands on the head is also still tolerated. If, however, the hands extend beyond that above the head, this is no longer in accordance with the rules, since it no longer protects the back of the head.' },
                    { type: 'p', text: 'This applies even if the players concerned are not in the trajectory of the ball. It therefore does not matter whether the ball is served over these players or not — there is, for example, no reason why a player at position 5 or 6 should stand there with raised hands.' },
                    { type: 'p', text: 'The 1st referee should influence the teams before sanctioning them, and thereby prevent interruptions or deliberate obstruction of the opponent\'s view. This applies both when players hold their hands above their head and when players group together to form an individual or collective screen. The referee should use good judgement (no millimetre decisions), but act consistently.' },
                    { type: 'p', text: 'The 1st referee should indicate to the serving team by a whistle that they should lower their hands (a short whistle and/or a hand signal); he should therefore intervene before the whistle for service in order to avoid the fault. If the team does not understand this or does not implement it, the referee should briefly call the game captain over and warn the team accordingly.' },
                    { type: 'p', text: 'If a player nevertheless breaches this provision despite a previous warning to the team, this behaviour is to be judged in the same way as a screen and whistled accordingly (hand signal #12). In this situation — that is, after an unsuccessful warning — the 1st referee must whistle the screen immediately after the service (the hit of the ball). There is no need to wait here until the ball has flown over the player or players concerned.' },
                    { type: 'p', text: 'The warning for this behaviour (hands above head height) should not be repeated every time it occurs again; according to the SSK the procedure should in principle follow that of the verbal warning for minor misconduct. At the start of the new season in particular, referees should be granted a certain amount of latitude so that the teams have a learning and adjustment period, but too many warnings are likely to be inefficient and lead to teams simply ignoring them — so a healthy sense of proportion is required here.' },
                ],
            },
            {
                number: '3.4',
                title: 'Screening (Rule 12.5.2): standing together',
                blocks: [
                    { type: 'p', text: 'Since the serving team is no longer bound to fixed positions, the idea of fair play becomes even more important in how they line up on court. In principle, however, nothing has changed in the rules on the collective screen. The aim is not to whistle more collective screen faults from now on.' },
                    { type: 'p', text: 'During the execution of the service, the 1st referee should watch whether a player or a group of players of the serving team prevents the opponent from seeing the service (the hit of the ball) and the trajectory of the ball by waving, jumping, moving sideways, or standing together, until the ball crosses the vertical plane of the net. So if the served ball is clearly visible to the opponent along its entire trajectory until it crosses the net, this cannot be regarded as a screen (as before).' },
                    { type: 'p', text: 'Referees should, however, now monitor the teams\' intention to shield the ball more strictly (without overdoing it) and prevent teams from abusing the screening rule for tactical reasons from the start of the game.' },
                    { type: 'p', text: 'So if a team clearly groups together with the intention of obscuring the opponent\'s view of the service or of the trajectory of the ball, the 1st referee should indicate to the serving team by a whistle that the players should stand apart (a short whistle and/or a hand signal); he should therefore intervene before the whistle for service in order to avoid the fault (rule of thumb: just under an arm\'s length apart). If the team does not understand this or does not implement it, the referee should briefly call the game captain over and warn the team accordingly (the same procedure as for hands above head height). Should the players fail to do so and continue to stand close together, the 1st referee should not insist further and should whistle.' },
                    { type: 'p', text: 'In these situations the fault whistle should still be delayed until the ball has flown low over the group of players concerned and the trajectory of the ball and the server have effectively been obscured (contrary to the statements in the FIVB New Refereeing Guidelines and Instructions 2025, Rule 12 no. 5, which according to the Rules of the Game & Refereeing Commission are incorrect on this point). If the served ball passes to the side of loosely grouped players (without raised hands), or players who are simply changing position, or if a jump serve is played, the opposing team can see the ball directly after the service. This would still not be considered a screen.' },
                    { type: 'p', text: 'The warning for this behaviour (standing together) should not be repeated every time it occurs again; according to the SSK the procedure should in principle follow that of the verbal warning for minor misconduct. At the start of the new season in particular, referees should be granted a certain amount of latitude so that the teams have a learning and adjustment period, but too many warnings are likely to be inefficient and lead to teams simply ignoring them — so a healthy sense of proportion is required here (the same procedure as for hands above head height).' },
                    { type: 'p', text: 'It should be pointed out that "standing together" can occur not only side by side (at the same height) but also staggered towards the back. What is decisive is always whether the grouping of the players obscures the opponent\'s view of the service and the trajectory of the ball (see also fig. 6 of the Official Volleyball Rules).' },
                    { type: 'p', text: 'It is necessary that all referees follow these instructions from the start of the game in order to reverse this trend, which impairs fair play, without however overdoing it. The referee should restrict himself to clear cases (an unambiguous intention to obscure the server and the trajectory of the ball).' },
                ],
            },
        ],
    },
    {
        number: '4',
        title: 'New rule interpretation for double contact (internal set)',
        sections: [
            {
                number: '4.1',
                title: 'Double contact (Rules 9.2.3 and 9.3.4): internal set',
                blocks: [
                    { type: 'p', text: 'In order to increase the flow of the game, double contacts on the second hit should no longer be sanctioned in every case (the text of the rule, however, has not been adapted).' },
                    { type: 'p', text: 'Consecutive contacts of the ball with the hands are now permitted during an internal overhand (finger) set to a team-mate, provided they occur within one action. Double contacts when setting (two contacts) are therefore to be allowed, provided the ball remains in the team\'s own half of the court after the set.' },
                    { type: 'p', text: 'If it is clearly recognisable that the player has contacted the ball in two consecutive actions (e.g. the ball slips through the player\'s hands and touches his head, or there are two clearly visible, separate consecutive contacts), this still counts as a double contact and is to be sanctioned as a fault (hand signal #17).' },
                    { type: 'p', text: 'The new rule interpretation applies only to the overhand (finger) set. If, during an unclean overhand (finger) set, the ball touches another part of the body (e.g. the player\'s head), this is to be regarded as a second action, irrespective of the preceding contact.' },
                ],
            },
            {
                number: '4.2',
                title: 'Double contact (Rules 9.2.3 and 9.3.4): attack hits',
                blocks: [
                    { type: 'p', text: 'All attack hits executed with a double contact still count as a fault; in such cases the previous rule interpretation for double contacts applies. This means that such a ball, which is no longer to be regarded as an internal set but flies towards the opponent\'s court, becomes faulty at the moment the attack hit is completed (the ball completely crosses the vertical plane of the net, or is touched by an opponent in the block).' },
                    { type: 'p', text: 'The only exception is the situation in which such a ball, following an unclean overhand (finger) set, is touched simultaneously by the team\'s own attacker and by the opposing blocker; this is not to be counted as a fault.' },
                ],
            },
            {
                number: '4.3',
                title: 'For clarification',
                blocks: [
                    { type: 'p', text: 'Held or thrown balls when setting are still to be judged according to the previous criteria and sanctioned as a fault accordingly.' },
                ],
            },
        ],
    },
    {
        number: '5',
        title: 'Further rule tests for the 2026–2027 season',
        sections: [
            {
                number: null,
                title: null,
                blocks: [
                    { type: 'p', text: 'The FIVB and the CEV are carrying out further rule tests. Swiss Volley has decided to introduce selected rule tests in Switzerland.' },
                    { type: 'p', text: 'The rule tests listed below apply from the 2026/2027 season.' },
                ],
            },
            {
                number: '5.1',
                title: 'Stricter rule interpretation for held and thrown attack balls (Rule 9.2.2)',
                blocks: [
                    { type: 'p', text: 'According to Rule 9.2.2 the ball may not be held and/or thrown. Until now this rule has been interpreted rather generously. As part of a further test, a strict standard is now to be applied and the existing rule interpreted narrowly, in order to give more effect to the existing text of the rule.' },
                    { type: 'p', text: 'A distinction must first be made between attack balls (towards the opponent) and blocking actions. If it is a blocking action (with one hand or with both hands), the previous standard continues to apply unchanged.' },
                    { type: 'p', text: 'For attack balls, only a very short contact with the ball is permitted; pushed, guided, held or thrown balls are to be prevented and sanctioned as a fault. What is decisive for the assessment is primarily how long the ball is touched, whether the ball is touched with the whole hand or only with the fingers, and in which direction the ball flies after the contact.' },
                ],
            },
            {
                number: '5.1.1',
                title: 'One-handed attack (tip)',
                blocks: [
                    { type: 'p', text: 'With a one-handed attack (tip, "tipping") the hit must' },
                    {
                        type: 'ul', items: [
                            'in principle be executed with one (1) hand;',
                            'be executed with a short contact;',
                            'follow a straight line.',
                        ]
                    },
                    { type: 'p', text: 'The following points in particular can be used as indicators for assessing a faulty hit (non-exhaustive list):' },
                    {
                        type: 'ul', items: [
                            'the ball stops in the player\'s hand;',
                            'the ball is cushioned in a first arm movement and pushed away in a second arm movement;',
                            'the player touches the ball behind his head and pulls it forward;',
                            'the contact begins on one side of the body and the ball is released on the other side;',
                            'the contact is made with the whole palm instead of only with the fingers.',
                        ]
                    },
                ],
            },
            {
                number: '5.1.2',
                title: 'Two-handed attack',
                blocks: [
                    { type: 'p', text: 'With a two-handed attack (an action with both hands by which the ball flies over the net and which is not a blocking action), a distinction must be made between:' },
                    {
                        type: 'ul', items: [
                            'a deliberate two-handed attack hit (fault); and',
                            'a two-handed overhand (finger) set (setting action) that merely carries the ball over the net (not a fault).',
                        ]
                    },
                    { type: 'p', text: 'The setter may therefore hit or attack the ball on the second contact, provided the contact time with the ball is short, the attack is executed with one hand, and the ball is passed on in a straight line. If the setter plays the ball with both hands, he must perform a "setting movement". Two-handed attack hits are not permitted.' },
                    { type: 'p', text: 'The following points in particular can be used as indicators for assessing a faulty hit (non-exhaustive list):' },
                    {
                        type: 'ul', items: [
                            'acceleration of the ball by the player;',
                            'the angle at which the ball leaves after being played (a straight / descending ball as opposed to a rising ball);',
                            'the player touches the ball behind his head and pulls it forward.',
                        ]
                    },
                ],
            },
            {
                number: '5.1.3',
                title: 'For clarification',
                blocks: [
                    { type: 'p', text: 'Any ball coming from the opponent\'s side of the court, including a ball rebounding from the opponent\'s block, may be blocked in accordance with the rules. Any ball coming from the team\'s own side of the court, including a ball rebounding from the team\'s own block, is to be regarded as an attack ball if it is played towards the opponent\'s court.' },
                    { type: 'p', text: 'Reference should also be made here once again to the explanations concerning the double contact during an internal set (see chapter 4 above). A double contact is only permitted if, during an internal overhand (finger) set, the ball remains in the team\'s own half of the court after the set — but not if it flies into the opponent\'s court; that is still to be regarded as a fault.' },
                ],
            },
        ],
    },
]

// A link styled as the kit's secondary button: 44px tall on a phone, h-9 from sm.
const LINK_BUTTON = cn(
    'inline-flex items-center justify-center font-medium transition-colors',
    FOCUS_RING,
    BUTTON_SIZES.md,
    BUTTON_VARIANTS.secondary,
    'h-11 sm:h-9',
)

function TextBlock({ block }) {
    if (block.type === 'ul') {
        return (
            <ul className="mb-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-stone-700 marker:text-stone-400">
                {block.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        )
    }
    return <p className="mb-3 text-sm leading-relaxed text-stone-700 hyphens-auto">{block.text}</p>
}

function Chapter({ chapter, isOpen, onToggle }) {
    const panelId = `rule-changes-chapter-${chapter.number}`
    return (
        <section>
            <h2>
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className={cn(
                        'group flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50 sm:px-5',
                        FOCUS_RING_INSET,
                    )}
                >
                    <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-stone-400">{chapter.number}</span>
                    <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-stone-900 sm:text-[15px]">
                        {chapter.title}
                    </span>
                    <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className={cn('shrink-0 text-stone-400 transition-transform group-hover:text-stone-600', isOpen && 'rotate-180')}
                    />
                </button>
            </h2>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div id={panelId} {...accordionMotion} className="overflow-hidden">
                        <div className="max-w-3xl space-y-5 px-4 pb-5 pt-1 sm:pl-14 sm:pr-5">
                            {chapter.sections.map((section, index) => (
                                <div key={section.number || `intro-${index}`}>
                                    {section.title && (
                                        <h3 className="mb-2 text-sm font-semibold leading-snug text-stone-900">
                                            <span className="mr-2 tabular-nums text-stone-500">{section.number}</span>
                                            {section.title}
                                        </h3>
                                    )}
                                    {section.blocks.map((block, i) => <TextBlock key={i} block={block} />)}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

function RuleChanges2027View() {
    const [openChapter, setOpenChapter] = useState('3')

    return (
        <>
            <Card>
                <p className="text-sm font-semibold text-stone-800">
                    Official Volleyball Rules 2025–2028 · Explanations for referees (SSK, 24.08.2026)
                </p>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                    English translation of chapters 3 to 5 of the SSK document. The German original is the
                    binding text.
                </p>
                <a
                    href={SOURCE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(LINK_BUTTON, 'mt-3 w-full sm:w-auto')}
                >
                    <ExternalLink size={15} aria-hidden="true" />
                    Original PDF (DE) on volleyball.ch
                </a>
            </Card>

            <Card pad="flush" className="divide-y divide-stone-100 overflow-hidden">
                {CHAPTERS.map(chapter => (
                    <Chapter
                        key={chapter.number}
                        chapter={chapter}
                        isOpen={openChapter === chapter.number}
                        onToggle={() => setOpenChapter(prev => prev === chapter.number ? null : chapter.number)}
                    />
                ))}
            </Card>
        </>
    )
}

export default RuleChanges2027View
