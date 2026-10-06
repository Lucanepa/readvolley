import React from 'react'
import SSKNewsView from './SSKNewsView'
import { MultimediaView } from './MultimediaView'
import ResourceHubView from './ResourceHubView'
import RuleChanges2027View from './RuleChanges2027View'
import { Globe, ChevronRight, FileText, PlaySquare, Scale, LayoutGrid, Home, Lock, LogOut, Sun } from 'lucide-react'
import SectionShell from './components/SectionShell'
import { OptionsRow, Card, RowList, FOCUS_RING, cn } from './ui/volleyui'
import { navigate } from './services/router'

const TABS = [
    { id: 'ssk_news', label: 'SSK news', short: 'News', icon: FileText, description: 'Latest updates and PDF documents from the SSK.' },
    { id: 'resource_hub', label: 'Resource hub', short: 'Resources', icon: Globe, description: 'Documents, links and the hall report tool for referees in NLA and NLB.' },
    { id: 'rule_changes_2027', label: 'Rule changes 2027', short: '2027', icon: Scale, description: 'SSK explanations of the rule changes and rule tests for the 2026/2027 season.' },
    { id: 'multimedia', label: 'Multimedia', short: 'Media', icon: PlaySquare, description: 'Presentations, videos and other material shared by the SSK.' },
]

function SwissVolleyView({ user, onLogin, onOpenSearch, activeTab }) {
    const goToTab = (id) => navigate(`/${id}`)
    const current = TABS.find(tab => tab.id === activeTab)

    const renderContent = () => {
        switch (activeTab) {
            case 'ssk_news': return <SSKNewsView user={user} onLogin={onLogin} />
            case 'resource_hub': return <ResourceHubView />
            case 'rule_changes_2027': return <RuleChanges2027View />
            case 'multimedia': return <MultimediaView user={user} onLogin={onLogin} />
            default: return <OverviewMenu onSelect={goToTab} />
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        window.dispatchEvent(new Event('auth-change'))
    }

    return (
        <SectionShell
            items={TABS}
            activeId={activeTab}
            onSelect={goToTab}
            title={current ? current.label : 'Swiss Volley'}
            eyebrow={current ? 'Swiss Volley' : 'Official resources and guidelines'}
            onOpenSearch={onOpenSearch}
            panelKey={activeTab || 'overview'}
            onResetPanel={() => navigate(activeTab ? `/${activeTab}` : '/swiss_volley')}
            options={(
                <>
                    <OptionsRow icon={LayoutGrid} onClick={() => navigate('/swiss_volley')}>Swiss Volley overview</OptionsRow>
                    <OptionsRow icon={Home} onClick={() => navigate('/indoor/rules')}>Indoor rules</OptionsRow>
                    <OptionsRow icon={Sun} onClick={() => navigate('/beach/rules')}>Beach rules</OptionsRow>
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

function OverviewMenu({ onSelect }) {
    return (
        <Card pad="list">
            <RowList>
                {TABS.map(({ id, label, description, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onSelect(id)}
                        className={cn('group flex w-full items-start gap-3 rounded-md px-1 py-3 text-left transition-colors hover:bg-stone-50', FOCUS_RING)}
                    >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
                            <Icon size={18} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-stone-900">{label}</span>
                            <span className="mt-0.5 block text-xs text-stone-500">{description}</span>
                        </span>
                        <ChevronRight size={16} className="mt-2.5 shrink-0 text-stone-400 group-hover:text-stone-600" aria-hidden="true" />
                    </button>
                ))}
            </RowList>
        </Card>
    )
}

export default SwissVolleyView
