import React, { useState, useEffect } from 'react'
import { Download, ExternalLink, Clock, FileDown, CalendarDays, FileText, Link2 } from 'lucide-react'
import {
    Button, BUTTON_SIZES, BUTTON_VARIANTS, FOCUS_RING, Card, CardHeading, Input, Notice,
    RowList, Row, DateRail, SegmentedControl, SkeletonRows, EmptyInCard, toast, cn,
    weekdayLabel, dayLabel, timeLabel,
} from './ui/volleyui'

const LR_FEEDBACK_URL = 'https://de.surveymonkey.com/r/Feedback_LR_25_26'

const LEAGUES = {
    nla: {
        label: 'NLA',
        // Only NLA games have a line referee to give feedback on.
        hasLrFeedback: true,
        storageKey: 'nla-ical-url',
        // A game belongs to this league if the entry mentions either marker.
        markers: ['(NLA)', '(LNA)'],
        reportPdf: '/hub_docs/NLA_Hallenrapport_d.pdf',
        documents: [
            {
                title: 'Hallenrapport NLA',
                subtitle: 'Rapport Salle LNA',
                links: [
                    { label: 'Download DE', href: '/hub_docs/NLA_Hallenrapport_d.pdf' },
                    { label: 'Download FR', href: '/hub_docs/NLA_Hallenrapport_f.pdf' },
                ],
            },
            {
                title: 'Leitfaden Bench-Application',
                subtitle: 'Guide Bench-Application',
                links: [
                    { label: 'Download DE', href: '/hub_docs/NLA_Bench-Application_d.pdf' },
                    { label: 'Download FR', href: '/hub_docs/NLA_Bench-Application_f.pdf' },
                ],
            },
        ],
        // AcroForm field names of the NLA hall report.
        fields: {
            gameNumber: 'SpielNr',
            homeTeam: 'Heimteam',
            awayTeam: 'Gastteam',
            venueName: 'Hallenname',
            city: 'Ort',
            gameDate: 'Datum',
            firstReferee: 'Text19',
            secondReferee: 'Text20',
            leagueRadio: 'Gruppe3',
        },
    },
    nlb: {
        label: 'NLB',
        storageKey: 'nlb-ical-url',
        markers: ['(NLB)', '(LNB)'],
        reportPdf: '/hub_docs/NLB_Hallenrapport_d.pdf',
        documents: [
            {
                title: 'Hallenrapport NLB',
                subtitle: 'Rapport Salle LNB',
                links: [
                    { label: 'Download DE', href: '/hub_docs/NLB_Hallenrapport_d.pdf' },
                    { label: 'Download FR', href: '/hub_docs/NLB_Hallenrapport_f.pdf' },
                ],
            },
            {
                title: 'Hallenliste mit 1 Ball',
                subtitle: 'Liste de salles 1 ballon',
                links: [
                    { label: 'Download DE', href: '/hub_docs/NLB_Hallenliste_1Ball_d.pdf' },
                    { label: 'Download FR', href: '/hub_docs/NLB_Hallenliste_1Ball_f.pdf' },
                ],
            },
        ],
        fields: {
            gameNumber: 'Text9',
            homeTeam: 'Text10',
            awayTeam: 'Text12',
            venueName: 'Text14',
            city: 'Text13',
            gameDate: 'Text11',
            firstReferee: 'Text23',
            secondReferee: 'Text24',
            leagueRadio: 'Gruppe15',
        },
    },
}

const GENERAL_DOCUMENTS = [
    {
        title: 'Ständige Weisungen',
        subtitle: 'Directives permanentes',
        links: [
            { label: 'Download DE', href: '/hub_docs/SSK-Staendige-Weisungen_d.pdf' },
            { label: 'Download FR', href: '/hub_docs/SSK-Staendige-Weisungen_f.pdf' },
        ],
    },
    {
        title: 'Game Management Leitfaden',
        subtitle: 'Guide Game Management',
        links: [
            { label: 'Download DE', href: '/hub_docs/Game-Management_d.pdf' },
            { label: 'Download FR', href: '/hub_docs/Game-Management_f.pdf' },
        ],
    },
    {
        title: 'Spielprotokoll Volleyball',
        subtitle: 'Protocole de match en volleyball',
        links: [
            { label: 'Download DE', href: '/hub_docs/Spielprotokoll_d.pdf' },
            { label: 'Download FR', href: '/hub_docs/Spielprotokoll_f.pdf' },
        ],
    },
]

const GENERAL_LINKS = [
    {
        title: 'Feedback LR',
        subtitle: 'Feedback JL',
        links: [{ label: 'Surveymonkey', href: LR_FEEDBACK_URL }],
    },
    {
        title: 'Feedback RD',
        subtitle: 'Feedback RD',
        links: [
            { label: 'DE', href: 'https://de.surveymonkey.com/r/RD_Evaluation_25_26_d' },
            { label: 'FR', href: 'https://fr.surveymonkey.com/r/Evaluation_RD_25_26_f' },
        ],
    },
    {
        title: 'eScoresheet checklist',
        subtitle: 'eScoresheet checklist',
        links: [{ label: 'SwissVolley', href: 'https://www.volleyball.ch/de/wissen/escoresheet-von-genius-sports' }],
    },
    {
        title: 'Volleymetrics',
        subtitle: 'Volleymetrics',
        links: [{ label: 'Hudl portal', href: 'https://portal.volleymetrics.hudl.com/' }],
    },
    {
        title: 'Volleyball Arena',
        subtitle: 'Volleyball Arena',
        links: [{ label: 'Livestream', href: 'https://volleyballarena.tv/' }],
    },
]

/* ------------------------------------------------------------------ *
 * iCalendar parsing
 * ------------------------------------------------------------------ */

function decodeICalText(value) {
    return value
        .replace(/\\n/g, '\n')
        .replace(/\\,/g, ',')
        .replace(/\\;/g, ';')
        .replace(/\\\\/g, '\\')
}

function parseICalDate(line) {
    if (!line) return null
    const isUtc = line.includes('TZID=UTC')
    const colon = line.lastIndexOf(':')
    if (colon === -1) return null

    const value = line.substring(colon + 1)
    const year = parseInt(value.substring(0, 4))
    const month = parseInt(value.substring(4, 6)) - 1
    const day = parseInt(value.substring(6, 8))

    if (value.length > 8) {
        const hour = parseInt(value.substring(9, 11))
        const minute = parseInt(value.substring(11, 13))
        return isUtc ? new Date(Date.UTC(year, month, day, hour, minute)) : new Date(year, month, day, hour, minute)
    }
    return new Date(year, month, day)
}

function parseICalendar(text) {
    const events = []
    const lines = text.split(/\r?\n/)
    let current = null
    // Nested components (e.g. a VALARM reminder) carry their own DESCRIPTION,
    // which must not overwrite the event's.
    let nested = 0

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim()
        // Unfold continuation lines (RFC 5545 folds long values onto indented lines).
        while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
            i++
            line += lines[i].substring(1)
        }

        if (line === 'BEGIN:VEVENT') {
            current = {}
            nested = 0
        } else if (line === 'END:VEVENT') {
            if (current && current.start && current.summary) events.push(current)
            current = null
        } else if (current && line.startsWith('BEGIN:')) {
            nested++
        } else if (current && line.startsWith('END:')) {
            nested = Math.max(0, nested - 1)
        } else if (current && nested === 0) {
            const colon = line.indexOf(':')
            if (colon <= 0) continue
            const key = line.substring(0, colon)
            const value = line.substring(colon + 1)

            if (key.startsWith('DTSTART')) {
                const date = parseICalDate(line)
                if (date) current.start = date
            } else if (key.startsWith('DTEND')) {
                const date = parseICalDate(line)
                if (date) current.end = date
            } else if (key === 'SUMMARY') {
                current.summary = decodeICalText(value)
            } else if (key === 'DESCRIPTION') {
                current.description = decodeICalText(value)
            } else if (key === 'LOCATION') {
                current.location = decodeICalText(value)
            }
        }
    }

    return events.sort((a, b) => a.start.getTime() - b.start.getTime())
}

/**
 * Volleymanager writes the match details into the event description. The labels
 * differ per language, so each field is matched in DE, FR and IT.
 */
function parseEventDescription(description) {
    const out = {}
    const firstMatch = (...patterns) => {
        for (const pattern of patterns) {
            const m = description.match(pattern)
            if (m) return m
        }
        return null
    }

    const number = firstMatch(/Spiel: #(\d+)/, /Match: #(\d+)/, /Partita: #(\d+)/)
    if (number) out.gameNumber = number[1]

    const date = firstMatch(
        /Spiel: #\d+ \| (\d{2}\.\d{2}\.\d{4})/,
        /Match: #\d+ \| (\d{2}\.\d{2}\.\d{4})/,
        /Partita: #\d+ \| (\d{2}\.\d{2}\.\d{4})/
    )
    if (date) out.gameDate = date[1]

    const teams = firstMatch(
        /Spiel: #\d+ \| .+ \| (.+) — (.+)/,
        /Match: #\d+ \| .+ \| (.+) — (.+)/,
        /Partita: #\d+ \| .+ \| (.+) — (.+)/
    )
    if (teams) {
        out.homeTeam = teams[1].trim()
        out.awayTeam = teams[2].trim()
    }

    const league = firstMatch(/Liga: #\d+ \| ([^\n]+)/, /Ligue: #\d+ \| ([^\n]+)/, /Lega: #\d+ \| ([^\n]+)/)
    if (league) out.league = league[1].trim().replace(/\s*\|\s*/g, ' ').trim()

    const venue = firstMatch(/Halle: #\d+ \| ([^\n(]+)/, /Salle: #\d+ \| ([^\n(]+)/, /Palestra: #\d+ \| ([^\n(]+)/)
    if (venue) out.venueName = venue[1].trim()

    const address = firstMatch(/Adresse: ([^\n]+)/, /Indirizzo: ([^\n]+)/)
    if (address) {
        out.venueAddress = address[1].trim()
        const city = address[1].match(/(\d{4}\s+[^,]+)/)
        if (city) out.city = city[1].trim()
    }

    const first = firstMatch(/1\. SR: ([^|]+)/, /ARB 1: ([^|]+)/, /1\. Arbitro: ([^|]+)/)
    if (first) out.firstReferee = first[1].trim()

    const second = firstMatch(/2\. SR: ([^|]+)/, /ARB 2: ([^|]+)/, /2\. Arbitro: ([^|]+)/)
    if (second) out.secondReferee = second[1].trim()

    return out
}

const formatDate = (date) => new Intl.DateTimeFormat('de-CH', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
}).format(date)

const formatTime = (date) => new Intl.DateTimeFormat('de-CH', {
    hour: '2-digit', minute: '2-digit'
}).format(date)

function getLrFeedbackLink(event) {
    const params = new URLSearchParams({
        eventSummary: event.summary ?? '',
        eventDate: formatDate(event.start),
    })
    if (event.description) params.set('eventDescription', event.description)
    return `${LR_FEEDBACK_URL}?${params.toString()}`
}

/* ------------------------------------------------------------------ *
 * Shared UI pieces
 * ------------------------------------------------------------------ */

// A link that looks like a secondary button. 44px tall on a phone, the kit's
// h-9 from sm up.
const LINK_BUTTON = cn(
    'inline-flex items-center justify-center font-medium transition-colors',
    FOCUS_RING,
    BUTTON_SIZES.md,
    BUTTON_VARIANTS.secondary,
    'h-11 sm:h-9',
)

const NO_GAMES_MESSAGE = 'No games found for this calendar.'

function ResourceRow({ item, external = false }) {
    const Icon = external ? Link2 : FileText
    return (
        <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
                    <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug break-words text-stone-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-stone-500">{item.subtitle}</p>
                </div>
            </div>
            <div className="flex gap-2 pl-12 sm:shrink-0 sm:pl-0">
                {item.links.map(link => (
                    <a
                        key={link.href + link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(LINK_BUTTON, 'flex-1 sm:flex-none')}
                    >
                        {external
                            ? <ExternalLink size={15} aria-hidden="true" />
                            : <Download size={15} aria-hidden="true" />}
                        {link.label}
                    </a>
                ))}
            </div>
        </div>
    )
}

function ResourceList({ title, hint, items, external = false }) {
    return (
        <Card>
            <CardHeading title={title} hint={hint} className="mb-1" />
            <RowList soft>
                {items.map(item => <ResourceRow key={item.title} item={item} external={external} />)}
            </RowList>
        </Card>
    )
}

/* ------------------------------------------------------------------ *
 * League section (documents + hall report tool)
 * ------------------------------------------------------------------ */

function LeagueSection({ league }) {
    const config = LEAGUES[league]
    const [icalUrl, setIcalUrl] = useState('')
    const [events, setEvents] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [hasSearched, setHasSearched] = useState(false)
    const [busyEvent, setBusyEvent] = useState(null)
    // The last report that could not be filled in, shown under its game.
    const [reportError, setReportError] = useState(null)

    useEffect(() => {
        try {
            const stored = localStorage.getItem(config.storageKey)
            setIcalUrl(stored || '')
        } catch {
            setIcalUrl('')
        }
        setEvents([])
        setErrorMessage('')
        setHasSearched(false)
    }, [config.storageKey])

    const persistUrl = (value) => {
        try {
            if (value.trim()) localStorage.setItem(config.storageKey, value)
            else localStorage.removeItem(config.storageKey)
        } catch {
            // Private mode or blocked storage: the URL simply is not remembered.
        }
    }

    const handleUrlChange = (value) => {
        setIcalUrl(value)
        persistUrl(value)
    }

    const loadCalendar = async () => {
        if (!icalUrl.trim()) {
            setErrorMessage('Please enter a valid iCal URL.')
            return
        }
        persistUrl(icalUrl)
        setIsLoading(true)
        setErrorMessage('')
        setEvents([])
        setHasSearched(true)

        // Games from the start of last week onwards — a report is often only
        // filled in after the game.
        const now = new Date()
        const mondayOffset = (now.getDay() + 6) % 7
        const from = new Date(now)
        from.setDate(now.getDate() - mondayOffset - 7)
        from.setHours(0, 0, 0, 0)

        // Volleymanager's iCal endpoint sends no CORS header, so the calendar is
        // fetched through our own function (functions/api/ical.js).
        try {
            const response = await fetch(`/api/ical?url=${encodeURIComponent(icalUrl.trim())}`)
            if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                throw new Error(err.error || response.statusText)
            }
            const parsed = parseICalendar(await response.text())

            const filtered = parsed.filter(event => {
                if (event.start.getTime() < from.getTime()) return false
                const isFirstReferee = event.summary?.includes('ARB 1')
                    || event.summary?.includes('1. SR')
                    || event.summary?.includes('1. Arbitro')
                if (!isFirstReferee) return false
                const haystack = `${event.summary || ''} ${event.description || ''}`
                return haystack.includes('Mobiliar') || config.markers.some(m => haystack.includes(m))
            })

            setEvents(filtered)
            if (filtered.length === 0) setErrorMessage(NO_GAMES_MESSAGE)
        } catch (err) {
            setErrorMessage(`Could not load the calendar — ${err.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    // Shown inline under the game; the toast is extra.
    const reportFailed = (key, message) => {
        setReportError({ key, message })
        toast.error(message)
    }

    const fillReport = async (event) => {
        const eventKey = event.summary + event.start.toISOString()
        setBusyEvent(eventKey)
        setReportError(null)
        try {
            const { PDFDocument, StandardFonts } = await import('pdf-lib')
            const bytes = await fetch(config.reportPdf).then(r => r.arrayBuffer())
            const pdf = await PDFDocument.load(bytes)

            let form
            try {
                form = pdf.getForm()
            } catch {
                reportFailed(eventKey, 'This PDF has no fillable fields.')
                return
            }

            const data = parseEventDescription(event.description || '')
            const f = config.fields
            // The forms default to 12pt, which crowds the header boxes. Fill at
            // 10pt, shrinking further only when a value would not fit its box.
            const font = await pdf.embedFont(StandardFonts.Helvetica)
            const setText = (name, value) => {
                if (!value) return
                try {
                    const field = form.getTextField(name)
                    const width = field.acroField.getWidgets()[0].getRectangle().width - 4
                    let size = 10
                    while (size > 6 && font.widthOfTextAtSize(value, size) > width) size -= 0.5
                    field.setFontSize(size)
                    field.setText(value)
                } catch {
                    // Field missing in this revision of the form — skip it.
                }
            }

            setText(f.gameNumber, data.gameNumber)
            setText(f.homeTeam, data.homeTeam)
            setText(f.awayTeam, data.awayTeam)
            setText(f.venueName, data.venueName)
            setText(f.city, data.city)
            setText(f.gameDate, data.gameDate)
            setText(f.firstReferee, data.firstReferee)
            setText(f.secondReferee, data.secondReferee)

            if (data.league) {
                try {
                    const group = form.getRadioGroup(f.leagueRadio)
                    const options = group.getOptions()
                    if (options.length > 0 && data.league.includes('♂')) group.select(options[0])
                    else if (options.length > 1 && data.league.includes('♀')) group.select(options[1])
                } catch {
                    // No such radio group — leave the league unselected.
                }
            }

            const saved = await pdf.save()
            const blob = new Blob([saved], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `Rapport_${event.summary}_${formatDate(event.start)}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            reportFailed(eventKey, 'Could not fill in the report: ' + error)
        } finally {
            setBusyEvent(null)
        }
    }

    const noGames = errorMessage === NO_GAMES_MESSAGE
    const nowMs = Date.now()

    return (
        <>
            <ResourceList
                title={`${config.label} documents`}
                hint="Each form in German (DE) and French (FR)."
                items={config.documents}
            />

            <Card>
                <CardHeading
                    title="Fill in hall report"
                    hint={`Lists your ${config.label} games as 1st referee from last week on and fills the hall report for the one you pick.`}
                />

                {/* Label, field + button, hint: written out because Field takes a single control. */}
                <label htmlFor={`ical-${league}`} className="mb-1.5 block text-sm font-medium text-stone-700">
                    iCal link
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                        id={`ical-${league}`}
                        type="text"
                        size="lg"
                        value={icalUrl}
                        placeholder="https://volleymanager.volleyball.ch/indoor/iCal/referee/XXXXX"
                        aria-describedby={`ical-${league}-hint`}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        onKeyUp={(e) => { if (e.key === 'Enter') loadCalendar() }}
                        className="min-w-0 sm:flex-1"
                    />
                    <Button
                        size="xl"
                        icon={CalendarDays}
                        loading={isLoading}
                        onClick={loadCalendar}
                        className="shrink-0"
                    >
                        Load games
                    </Button>
                </div>
                <p id={`ical-${league}-hint`} className="mt-1.5 text-xs text-stone-500">
                    Your personal Volleymanager referee calendar. The link is kept on this device only.
                </p>

                {errorMessage && !noGames && <Notice className="mt-3">{errorMessage}</Notice>}

                {isLoading && (
                    <div className="mt-4 border-t border-stone-100">
                        <SkeletonRows rows={3} pill={false} />
                    </div>
                )}

                {!isLoading && events.length > 0 && (
                    <RowList soft className="mt-4 border-t border-stone-100 pt-1">
                        {events.map(event => {
                            const key = event.summary + event.start.toISOString()
                            const tone = event.start.getTime() >= nowMs ? 'red' : 'stone'
                            return (
                                <Row
                                    key={key}
                                    tone={tone}
                                    leading={(
                                        <DateRail
                                            tone={tone}
                                            weekday={weekdayLabel(event.start, 'EN')}
                                            date={dayLabel(event.start)}
                                        />
                                    )}
                                    title={event.summary}
                                    meta={(
                                        <span className="inline-flex items-center gap-1.5 tabular-nums">
                                            <Clock size={12} aria-hidden="true" />
                                            {timeLabel(event.start)}{event.end ? ` – ${timeLabel(event.end)}` : ''}
                                        </span>
                                    )}
                                    location={event.location}
                                    tools={(
                                        <div className="flex w-full flex-col gap-1.5">
                                            <div className="flex w-full gap-1.5 sm:gap-2">
                                                <Button
                                                    variant="dark"
                                                    icon={FileDown}
                                                    loading={busyEvent === key}
                                                    onClick={() => fillReport(event)}
                                                    className="h-11 flex-1 sm:h-9 sm:flex-none"
                                                >
                                                    Fill in report
                                                </Button>
                                                {config.hasLrFeedback && (
                                                    <a
                                                        href={getLrFeedbackLink(event)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={cn(LINK_BUTTON, 'flex-1 sm:flex-none')}
                                                    >
                                                        <ExternalLink size={15} aria-hidden="true" />
                                                        LR feedback
                                                    </a>
                                                )}
                                            </div>
                                            {reportError?.key === key && <Notice>{reportError.message}</Notice>}
                                        </div>
                                    )}
                                />
                            )
                        })}
                    </RowList>
                )}

                {!isLoading && noGames && (
                    <EmptyInCard className="mt-4 border-t border-stone-100 pt-4">{NO_GAMES_MESSAGE}</EmptyInCard>
                )}

                {!isLoading && !hasSearched && events.length === 0 && (
                    <EmptyInCard className="mt-4 border-t border-stone-100 pt-4">
                        Paste your iCal URL above to list your games.
                    </EmptyInCard>
                )}
            </Card>
        </>
    )
}

function GeneralSection() {
    return (
        <>
            <ResourceList
                title="General documents"
                hint="Each document in German (DE) and French (FR)."
                items={GENERAL_DOCUMENTS}
            />
            <ResourceList
                title="Helpful links"
                hint="Feedback forms and other services. Each opens in a new tab."
                items={GENERAL_LINKS}
                external
            />
        </>
    )
}

/* ------------------------------------------------------------------ *
 * View
 * ------------------------------------------------------------------ */

const SECTIONS = [
    { value: 'nla', label: 'NLA' },
    { value: 'nlb', label: 'NLB' },
    { value: 'general', label: 'General' },
]

function ResourceHubView() {
    const [section, setSection] = useState('nla')

    return (
        <>
            <SegmentedControl
                ariaLabel="Resources for"
                options={SECTIONS}
                value={section}
                onChange={setSection}
                className="mb-4 sm:max-w-sm"
            />

            {/* Keyed so switching league starts the section afresh. */}
            <div key={section}>
                {section === 'general' ? <GeneralSection /> : <LeagueSection league={section} />}
            </div>
        </>
    )
}

export default ResourceHubView
