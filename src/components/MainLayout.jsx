import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Book,
    Image as ImageIcon,
    Info,
    ShieldCheck,
    List,
    ArrowLeft,
    Menu,
    X
} from 'lucide-react'
import RulesView from '../RulesView'
import DiagramsView from '../DiagramsView'
import DefinitionsView from '../DefinitionsView'
import ProtocolsView from '../ProtocolsView'
import GesturesView from '../GesturesView'

function MainLayout({ environment, onBack }) {
    const [activeTab, setActiveTab] = useState('rules')
    const [isSidebarOpen, setSidebarOpen] = useState(false)

    const themeColor = environment === 'beach' ? 'var(--beach-primary)' : 'var(--indoor-primary)'

    const navItems = [
        { id: 'rules', label: 'Rules', icon: Book },
        { id: 'diagrams', label: 'Diagrams', icon: ImageIcon },
        { id: 'definitions', label: 'Definitions', icon: Info },
        { id: 'protocols', label: 'Protocols', icon: ShieldCheck },
        { id: 'gestures', label: 'Gestures', icon: List },
    ]

    const renderContent = () => {
        switch (activeTab) {
            case 'rules': return <RulesView environment={environment} />
            case 'diagrams': return <DiagramsView environment={environment} />
            case 'definitions': return <DefinitionsView environment={environment} />
            case 'protocols': return <ProtocolsView environment={environment} />
            case 'gestures': return <GesturesView environment={environment} />
            default: return <RulesView environment={environment} />
        }
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar for Desktop */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 glass border-r border-border-subtle transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full p-6">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-xl font-bold tracking-tight">
                            {environment === 'beach' ? 'Beach' : 'Indoor'} <span style={{ color: themeColor }}>Volley</span>
                        </h2>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-text-muted">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = activeTab === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id)
                                        setSidebarOpen(false)
                                    }}
                                    className={`
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                    ${isActive ? 'bg-white/10 text-white shadow-lg' : 'text-text-secondary hover:bg-white/5 hover:text-white'}
                  `}
                                    style={isActive ? { borderLeft: `4px solid ${themeColor}` } : {}}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? '' : 'text-text-muted'}`} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            )
                        })}
                    </nav>

                    <button
                        onClick={onBack}
                        className="mt-auto flex items-center gap-2 text-text-muted hover:text-white transition-colors py-4 px-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Change Environment</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-bg-darker relative">
                {/* Mobile Header */}
                <header className="lg:hidden glass border-b border-border-subtle p-4 flex items-center justify-between sticky top-0 z-40">
                    <h2 className="font-bold">{environment === 'beach' ? 'Beach' : 'Indoor'}</h2>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 glass rounded-lg">
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-4 md:p-8 lg:p-12 max-w-5xl mx-auto min-h-full">
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}

export default MainLayout
