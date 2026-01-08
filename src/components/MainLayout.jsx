import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Book, Image as ImageIcon, Info, ShieldCheck, List,
    Menu, X, ChevronLeft, Search, ChevronDown
} from 'lucide-react'
import RulesView from '../RulesView'
import DiagramsView from '../DiagramsView'
import DefinitionsView from '../DefinitionsView'
import ProtocolsView from '../ProtocolsView'
import GesturesView from '../GesturesView'

function MainLayout({ environment, onBack }) {
    const [activeTab, setActiveTab] = useState('rules')
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const isBeach = environment === 'beach'
    const accentColor = isBeach ? 'text-beach-primary' : 'text-indoor-primary'
    const accentBg = isBeach ? 'bg-beach-primary' : 'bg-indoor-primary'
    const accentBorder = isBeach ? 'border-beach-primary/30' : 'border-indoor-primary/30'

    const navItems = [
        { id: 'rules', label: 'RULES', icon: <Book size={16} /> },
        { id: 'diagrams', label: 'DIAGRAMS', icon: <ImageIcon size={16} /> },
        { id: 'definitions', label: 'DEFINITIONS', icon: <Info size={16} /> },
        { id: 'protocols', label: 'PROTOCOLS', icon: <ShieldCheck size={16} /> },
        { id: 'gestures', label: 'GESTURES', icon: <List size={16} /> },
    ]

    const activeItem = navItems.find(item => item.id === activeTab)

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
        <div className="min-h-screen bg-bg-dark text-text-primary flex flex-col font-sans">
            {/* Header - Fixed 40px */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-8 md:px-16" style={{ height: '40px' }}>
                <div className="h-full max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-lg font-black tracking-tighter ${accentColor}`}>
                                {environment.toUpperCase()}
                            </span>
                            <div className="w-px h-3 bg-white/10 mx-1" />
                            <span className="text-sm font-bold opacity-40 translate-y-[1px]">VOLLEY</span>
                        </div>
                    </div>

                    {/* Collapsible Nav Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`flex items-center gap-3 px-4 py-1.5 rounded-xl border transition-all duration-300 ${isMenuOpen
                                ? `${accentBorder} bg-white/10`
                                : 'border-white/5 bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className={accentColor}>{activeItem.icon}</div>
                            <span className="text-[11px] font-black tracking-widest">{activeItem.label}</span>
                            <ChevronDown size={14} className={`opacity-40 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isMenuOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                                        onClick={() => setIsMenuOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full mt-2 right-0 w-56 glass rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                                    >
                                        <div className="p-2 space-y-1">
                                            {navItems.map(item => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        setActiveTab(item.id)
                                                        setIsMenuOpen(false)
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === item.id
                                                        ? `${accentBg} text-white`
                                                        : 'hover:bg-white/5 text-text-secondary hover:text-white'
                                                        }`}
                                                >
                                                    <div className={activeTab === item.id ? 'text-white' : accentColor}>
                                                        {item.icon}
                                                    </div>
                                                    <span className="text-xs font-black tracking-widest">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 glass rounded-lg hover:bg-white/10 transition-all border border-white/5 opacity-60 hover:opacity-100">
                            <Search size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Spacer for Fixed Header */}
            <div style={{ height: '40px' }} className="w-full shrink-0" />

            {/* Main Content Area - Perfectly Centered */}
            <main className="flex-1 flex flex-col items-center justify-start py-20 px-6 md:px-12 w-full overflow-y-auto">
                <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="w-full flex justify-center"
                    >
                        <div className="w-full">
                            {renderContent()}
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Spacer for Fixed Footer */}
            <div style={{ height: '40px' }} className="w-full shrink-0" />

            {/* Footer - Fixed 40px */}
            <footer className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 flex items-center justify-center" style={{ height: '40px' }}>
                <span className="text-[10px] font-bold tracking-[0.3em] text-text-muted opacity-60 uppercase">
                    © 2026 OpenVolley • Elite Rules Companion
                </span>
            </footer>
        </div>
    )
}

export default MainLayout
