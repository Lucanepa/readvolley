import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Book, Image as ImageIcon, Info, ShieldCheck, List,
    Menu, X, ChevronLeft, Search
} from 'lucide-react'
import RulesView from '../RulesView'
import DiagramsView from '../DiagramsView'
import DefinitionsView from '../DefinitionsView'
import ProtocolsView from '../ProtocolsView'
import GesturesView from '../GesturesView'

function MainLayout({ environment, onBack }) {
    const [activeTab, setActiveTab] = useState('rules')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const isBeach = environment === 'beach'
    const accentColor = isBeach ? 'text-beach-primary' : 'text-indoor-primary'
    const accentBg = isBeach ? 'bg-beach-primary' : 'bg-indoor-primary'
    const accentBorder = isBeach ? 'border-beach-primary/30' : 'border-indoor-primary/30'

    const navItems = [
        { id: 'rules', label: 'Rules', icon: <Book size={20} /> },
        { id: 'diagrams', label: 'Diagrams', icon: <ImageIcon size={20} /> },
        { id: 'definitions', label: 'Definitions', icon: <Info size={20} /> },
        { id: 'protocols', label: 'Protocols', icon: <ShieldCheck size={20} /> },
        { id: 'gestures', label: 'Gestures', icon: <List size={20} /> },
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
        <div className="min-h-screen bg-bg-dark text-text-primary flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-10 h-10 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={`text-xl font-black ${accentColor}`}>
                            {environment.toUpperCase()}
                        </span>
                        <span className="text-xl font-light opacity-40">VOLLEY</span>
                    </div>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5 h-7">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`px-3 py-1 rounded-md flex items-center gap-2 text-[11px] font-black transition-all duration-300 h-full ${activeTab === item.id
                                ? `${accentBg} text-white shadow-lg`
                                : 'text-text-secondary hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {/* Hide icon on tiny header to save space */}
                            {item.label.toUpperCase()}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <button className="p-2.5 glass rounded-xl hover:bg-white/10 transition-colors hidden md:block border border-white/10">
                        <Search className="w-5 h-5 opacity-60" />
                    </button>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2.5 glass rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        />
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-80 bg-bg-surface z-[70] shadow-2xl p-8 border-l border-white/5"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <h3 className="text-xl font-black tracking-tight">NAVIGATION</h3>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2 glass rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                {navItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id)
                                            setIsSidebarOpen(false)
                                        }}
                                        className={`p-5 rounded-2xl flex items-center gap-4 text-lg font-bold transition-all ${activeTab === item.id
                                            ? `${accentBg} text-white`
                                            : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <div className={activeTab === item.id ? 'text-white' : accentColor}>
                                            {item.icon}
                                        </div>
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-auto pt-8 border-t border-white/10">
                                <button
                                    onClick={onBack}
                                    className="w-full p-4 rounded-xl border border-white/10 text-text-muted flex items-center justify-center gap-2 hover:bg-white/5"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Switch Environment
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <main className="flex-1 mt-14 pt-8 pb-24 px-6 md:px-16">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {renderContent()}
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="h-10 flex items-center justify-center text-text-muted text-[10px] tracking-[0.2em] border-t border-white/5 bg-bg-dark/50 backdrop-blur-sm z-50">
                © 2026 OPEN VOLLEY • OFFICIAL RULES & CASEBOOK
            </footer>
        </div>
    )
}

export default MainLayout
