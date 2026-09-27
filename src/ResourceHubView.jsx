import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, ExternalLink, Clock, MapPin, FileDown, CalendarDays } from 'lucide-react'
import { theme } from './styles/theme'

const ACCENT = theme.colors.ssk.primary
const LR_FEEDBACK_URL = 'https://de.surveymonkey.com/r/Feedback_LR_25_26'

const LEAGUES = {
    nla: {
        label: 'NLA',
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
        title: 'eScoresheet Checklist',
        subtitle: 'eScoresheet Checklist',
        links: [{ label: 'SwissVolley', href: 'https://www.volleyball.ch/de/wissen/escoresheet-von-genius-sports' }],
    },
    {
        title: 'Volleymetrics',
        subtitle: 'Volleymetrics',
        links: [{ label: 'Hudl Portal', href: 'https://portal.volleymetrics.hudl.com/' }],
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

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim()
        // Unfold continuation lines (RFC 5545 folds long values onto indented lines).
        while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
            i++
            line += lines[i].substring(1)
        }

        if (line === 'BEGIN:VEVENT') {
            current = {}
        } else if (line === 'END:VEVENT') {
            if (current && current.start && current.summary) events.push(current)
            current = null
        } else if (current) {
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

function SectionTitle({ children }) {
    return (
        <h3 style={{
            fontSize: '1.35rem',
            fontWeight: '900',
            textAlign: 'center',
            marginBottom: '1.25rem',
            fontFamily: 'Outfit, sans-serif'
        }}>{children}</h3>
    )
}

function ResourceCard({ item, external = false }) {
    return (
        <div style={{
            ...theme.styles.glass,
            padding: '1.25rem',
            borderRadius: '1.25rem',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
        }}>
            <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.15rem' }}>{item.title}</h4>
                <p style={{ fontSize: '0.8rem', color: theme.colors.text.muted }}>{item.subtitle}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                {item.links.map(link => (
                    <a
                        key={link.href + link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            flex: '1 1 0',
                            minWidth: '7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.9rem',
                            backgroundColor: ACCENT,
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.ssk.secondary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ACCENT}
                    >
                        {external ? <ExternalLink size={14} /> : <Download size={14} />}
                        {link.label}
                    </a>
                ))}
            </div>
        </div>
    )
}

function CardGrid({ children }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            maxWidth: '1000px',
            margin: '0 auto',
            width: '100%'
        }}>{children}</div>
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
            if (filtered.length === 0) setErrorMessage('No games found for this calendar.')
        } catch (err) {
            setErrorMessage(`Could not load the calendar — ${err.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    const fillReport = async (event) => {
        setBusyEvent(event.summary + event.start.toISOString())
        try {
            const { PDFDocument } = await import('pdf-lib')
            const bytes = await fetch(config.reportPdf).then(r => r.arrayBuffer())
            const pdf = await PDFDocument.load(bytes)

            let form
            try {
                form = pdf.getForm()
            } catch {
                window.alert('This PDF has no fillable fields.')
                return
            }

            const data = parseEventDescription(event.description || '')
            const f = config.fields
            const setText = (name, value) => {
                if (!value) return
                try {
                    form.getTextField(name).setText(value)
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
            window.alert('Could not fill in the report: ' + error)
        } finally {
            setBusyEvent(null)
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <section>
                <SectionTitle>{config.label} Documents</SectionTitle>
                <CardGrid>
                    {config.documents.map(doc => <ResourceCard key={doc.title} item={doc} />)}
                </CardGrid>
            </section>

            <section>
                <SectionTitle>Fill in hall report</SectionTitle>
                <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                    <div style={{
                        ...theme.styles.glass,
                        padding: '1.25rem',
                        borderRadius: '1.25rem',
                        border: '1px solid rgba(255,255,255,0.08)',
                        marginBottom: '1.25rem'
                    }}>
                        <label
                            htmlFor={`ical-${league}`}
                            style={{
                                display: 'block',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                color: theme.colors.text.secondary,
                                marginBottom: '0.5rem'
                            }}
                        >
                            iCal link
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <input
                                id={`ical-${league}`}
                                type="text"
                                value={icalUrl}
                                placeholder="https://volleymanager.volleyball.ch/indoor/iCal/referee/XXXXX"
                                onChange={(e) => handleUrlChange(e.target.value)}
                                onKeyUp={(e) => { if (e.key === 'Enter') loadCalendar() }}
                                style={{
                                    flex: '1 1 16rem',
                                    minWidth: 0,
                                    padding: '0.6rem 0.9rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                    color: theme.colors.text.primary,
                                    fontSize: '0.85rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <button
                                onClick={loadCalendar}
                                disabled={isLoading}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    borderRadius: '0.75rem',
                                    backgroundColor: isLoading ? theme.colors.bg.hover : ACCENT,
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    cursor: isLoading ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                <CalendarDays size={16} />
                                {isLoading ? 'Loading…' : 'Load games'}
                            </button>
                        </div>
                        <p style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: theme.colors.text.muted }}>
                            Your personal Volleymanager referee calendar. The link is kept on this device only.
                        </p>
                        {errorMessage && (
                            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: ACCENT }}>{errorMessage}</p>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {events.map(event => {
                            const key = event.summary + event.start.toISOString()
                            return (
                                <div
                                    key={key}
                                    style={{
                                        ...theme.styles.glass,
                                        padding: '1.25rem',
                                        borderRadius: '1.25rem',
                                        border: '1px solid rgba(255,255,255,0.08)'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '1rem',
                                        marginBottom: '0.6rem'
                                    }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '800' }}>{event.summary}</h4>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: theme.colors.text.muted,
                                            whiteSpace: 'nowrap'
                                        }}>{formatDate(event.start)}</span>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.3rem',
                                        fontSize: '0.8rem',
                                        color: theme.colors.text.secondary
                                    }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Clock size={14} />
                                            {formatTime(event.start)}{event.end ? ` – ${formatTime(event.end)}` : ''}
                                        </span>
                                        {event.location && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <MapPin size={14} />
                                                {event.location}
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.6rem', paddingTop: '1rem', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={() => fillReport(event)}
                                            disabled={busyEvent === key}
                                            style={{
                                                flex: '1 1 10rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.4rem',
                                                padding: '0.55rem 0.9rem',
                                                borderRadius: '0.9rem',
                                                backgroundColor: busyEvent === key ? theme.colors.bg.hover : ACCENT,
                                                color: '#ffffff',
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                cursor: busyEvent === key ? 'default' : 'pointer'
                                            }}
                                        >
                                            <FileDown size={14} />
                                            {busyEvent === key ? 'Preparing…' : 'Fill in report'}
                                        </button>
                                        <a
                                            href={getLrFeedbackLink(event)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                flex: '1 1 10rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.4rem',
                                                padding: '0.55rem 0.9rem',
                                                borderRadius: '0.9rem',
                                                backgroundColor: 'rgba(255,255,255,0.08)',
                                                color: theme.colors.text.primary,
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <ExternalLink size={14} />
                                            LR Feedback
                                        </a>
                                    </div>
                                </div>
                            )
                        })}

                        {!isLoading && !hasSearched && events.length === 0 && (
                            <p style={{ textAlign: 'center', color: theme.colors.text.muted, padding: '1.5rem', fontSize: '0.85rem' }}>
                                Paste your iCal URL above to list your games.
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

function GeneralSection() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <section>
                <SectionTitle>General Documents</SectionTitle>
                <CardGrid>
                    {GENERAL_DOCUMENTS.map(doc => <ResourceCard key={doc.title} item={doc} />)}
                </CardGrid>
            </section>
            <section>
                <SectionTitle>Helpful Links</SectionTitle>
                <CardGrid>
                    {GENERAL_LINKS.map(link => <ResourceCard key={link.title} item={link} external />)}
                </CardGrid>
            </section>
        </div>
    )
}

/* ------------------------------------------------------------------ *
 * View
 * ------------------------------------------------------------------ */

function ResourceHubView() {
    const [section, setSection] = useState('nla')

    return (
        <div style={{
            flex: 1,
            width: '100%',
            overflowY: 'auto',
            backgroundColor: theme.colors.bg.dark,
            padding: '2rem 1.5rem 4rem'
        }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <h2 style={{
                        fontSize: '2.25rem',
                        fontWeight: '900',
                        letterSpacing: '-0.025em',
                        fontFamily: 'Outfit, sans-serif'
                    }}>
                        Resource <span style={{ color: ACCENT }}>Hub</span>
                    </h2>
                    <p style={{ color: theme.colors.text.secondary, marginTop: '0.35rem' }}>
                        Download helpful documents and explore curated links
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'flex',
                        gap: '0.25rem',
                        padding: '0.25rem',
                        borderRadius: '2rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        {[
                            { id: 'nla', label: 'NLA' },
                            { id: 'nlb', label: 'NLB' },
                            { id: 'general', label: 'General' },
                        ].map(item => {
                            const isActive = section === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setSection(item.id)}
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        borderRadius: '2rem',
                                        backgroundColor: isActive ? ACCENT : 'transparent',
                                        color: isActive ? '#ffffff' : theme.colors.text.secondary,
                                        fontWeight: '800',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                >{item.label}</button>
                            )
                        })}
                    </div>
                </div>

                <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    {section === 'general' ? <GeneralSection /> : <LeagueSection league={section} />}
                </motion.div>
            </div>
        </div>
    )
}

export default ResourceHubView
