import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Home, ChevronRight, Book, Image as ImageIcon, Info, ShieldCheck, List } from 'lucide-react'
import MainLayout from './components/MainLayout'

function App() {
    const [environment, setEnvironment] = useState(null) // 'beach' | 'indoor' | null

    return (
        <div className="min-h-screen bg-bg-dark overflow-x-hidden">
            <AnimatePresence mode="wait">
                {!environment ? (
                    <motion.div
                        key="selector"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center min-h-screen p-6"
                    >
                        <motion.h1
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="text-4xl md:text-6xl mb-4 text-center tracking-tight"
                        >
                            Volleyball <span className="text-beach-primary">Rules</span>
                        </motion.h1>
                        <p className="text-text-muted text-xs mb-10 opacity-50">v1.0.1</p>

                        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
                            <EnvironmentCard
                                type="beach"
                                title="Beach"
                                icon={<Sun className="w-12 h-12 text-beach-primary" />}
                                onClick={() => setEnvironment('beach')}
                                colorClass="hover:border-beach-primary group"
                            />
                            <EnvironmentCard
                                type="indoor"
                                title="Indoor"
                                icon={<Home className="w-12 h-12 text-indoor-primary" />}
                                onClick={() => setEnvironment('indoor')}
                                colorClass="hover:border-indoor-primary group"
                            />
                        </div>
                    </motion.div>
                ) : (
                    <MainLayout
                        key="main"
                        environment={environment}
                        onBack={() => setEnvironment(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

function EnvironmentCard({ title, icon, onClick, colorClass }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`glass flex-1 p-12 rounded-3xl flex flex-col items-center justify-center gap-6 transition-all duration-300 border-2 border-transparent ${colorClass}`}
        >
            <div className="p-6 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                {icon}
            </div>
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="text-text-secondary text-center">
                Browse official regulations, diagrams, and referee protocols.
            </p>
            <ChevronRight className="w-6 h-6 text-text-muted group-hover:translate-x-1 transition-transform" />
        </motion.button>
    )
}

export default App
