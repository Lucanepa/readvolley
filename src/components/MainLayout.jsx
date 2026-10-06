import React from 'react'
import {
    Book, Image as ImageIcon, Info, ShieldCheck, Hand, MoreHorizontal,
    Search, Home, Lock, LogOut,
} from 'lucide-react'
import RulesView from '../RulesView'
import DiagramsView from '../DiagramsView'
import DefinitionsView from '../DefinitionsView'
import ProtocolsView from '../ProtocolsView'
import GesturesView from '../GesturesView'
import ExtraView from '../ExtraView'
import SectionShell from './SectionShell'
import SwissVolleyMark from './SwissVolleyMark'
import { OptionsRow, SegmentedControl } from '../ui/volleyui'
import { navigate } from '../services/router'

const NAV_ITEMS = [
    { id: 'rules', label: 'Rules', icon: Book },
    { id: 'diagrams', label: 'Diagrams', icon: ImageIcon },
    { id: 'definitions', label: 'Definitions', short: 'Terms', icon: Info },
    { id: 'hand_signals', label: 'Hand signals', short: 'Signals', icon: Hand },
    { id: 'protocols', label: 'Protocols', icon: ShieldCheck, railOnly: true },
    { id: 'extra', label: 'Extra', icon: MoreHorizontal, railOnly: true },
]

const DISCIPLINES = [
    { value: 'indoor', label: 'Indoor' },
    { value: 'beach', label: 'Beach' },
]

function MainLayout({ environment, activeTab, onOpenSearch, user, onLogin }) {
    const setActiveTab = (id) => navigate(`/${environment}/${id}`)
    const current = NAV_ITEMS.find(item => item.id === activeTab) || NAV_ITEMS[0]

    const renderContent = () => {
        switch (activeTab) {
            case 'rules': return <RulesView environment={environment} />
            case 'diagrams': return <DiagramsView environment={environment} />
            case 'definitions': return <DefinitionsView environment={environment} />
            case 'protocols': return <ProtocolsView environment={environment} />
            case 'hand_signals': return <GesturesView environment={environment} />
            case 'extra': return <ExtraView environment={environment} user={user} onLogin={onLogin} />
            default: return <RulesView environment={environment} />
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        window.dispatchEvent(new Event('auth-change'))
    }

    return (
        <SectionShell
            items={NAV_ITEMS}
            activeId={current.id}
            onSelect={setActiveTab}
            title={current.label}
            eyebrow={environment === 'beach' ? 'Beach volleyball' : 'Indoor volleyball'}
            titleAside={(
                <SegmentedControl
                    variant="pill"
                    ariaLabel="Discipline"
                    options={DISCIPLINES}
                    value={environment}
                    onChange={(env) => navigate(`/${env}/${activeTab}`)}
                />
            )}
            onOpenSearch={onOpenSearch}
            panelKey={`${environment}/${activeTab}`}
            onResetPanel={() => setActiveTab(activeTab)}
            options={(
                <>
                    {NAV_ITEMS.filter(item => item.railOnly).map(item => (
                        <OptionsRow
                            key={item.id}
                            icon={item.icon}
                            className="lg:hidden"
                            trailing={item.id === activeTab ? 'Open' : undefined}
                            onClick={() => setActiveTab(item.id)}
                        >
                            {item.label}
                        </OptionsRow>
                    ))}
                    <OptionsRow icon={Search} onClick={onOpenSearch}>Search everything</OptionsRow>
                    <OptionsRow onClick={() => navigate('/swiss_volley')}>
                        <SwissVolleyMark fontSize="0.875rem" />
                    </OptionsRow>
                    <OptionsRow icon={Home} onClick={() => navigate('/')}>Home</OptionsRow>
                    {user
                        ? <OptionsRow icon={LogOut} onClick={handleLogout}>Sign out</OptionsRow>
                        : <OptionsRow icon={Lock} onClick={onLogin}>Admin sign-in</OptionsRow>}
                </>
            )}
        >
            {renderContent()}
        </SectionShell>
    )
}

export default MainLayout
