import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Home, ChevronRight } from 'lucide-react'
import MainLayout from './components/MainLayout'

function App() {
    const [environment, setEnvironment] = useState(null)
    const [hoveredEnv, setHoveredEnv] = useState(null)

    return (
        <div className="min-h-screen bg-bg-dark text-text-primary font-sans selection:bg-beach-primary/30 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                {!environment ? (
                    <motion.div
                        key="selector"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
                    >
                        {/* Dynamic Backgrounds */}
                        <div className="absolute inset-0 z-0 bg-bg-dark">
                            <div className="absolute inset-0 bg-black/60 z-10" />
                            <AnimatePresence>
                                {hoveredEnv === 'beach' && (
                                    <motion.div
                                        key="beach-bg"
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        transition={{ duration: 0.8 }}
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: 'url("/beach-bg.png")' }}
                                    />
                                )}
                                {hoveredEnv === 'indoor' && (
                                    <motion.div
                                        key="indoor-bg"
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        transition={{ duration: 0.8 }}
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: 'url("/indoor-bg.png")' }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative z-20 container mx-auto px-6 flex flex-col items-center justify-center min-h-screen py-20">
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="text-center mb-16"
                            >
                                <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
                                    VOLLEY<span className="text-beach-primary italic">RULES</span>
                                </h1>
                                <p className="text-xl text-text-secondary max-w-2xl mx-auto font-medium opacity-80">
                                    The ultimate companion for officials and enthusiasts.
                                    Browse regulations, diagrams, and protocols with precision.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                                <EnvironmentCard
                                    type="indoor"
                                    title="VOLLEYBALL"
                                    subtitle="Official Indoor Regulations"
                                    icon={<Home className="w-10 h-10" />}
                                    onHover={() => setHoveredEnv('indoor')}
                                    onBlur={() => setHoveredEnv(null)}
                                    onClick={() => setEnvironment('indoor')}
                                    accentColor="indoor"
                                />
                                <EnvironmentCard
                                    type="beach"
                                    title="BEACH VOLLEY"
                                    subtitle="Official Beach Regulations"
                                    icon={<Sun className="w-10 h-10" />}
                                    onHover={() => setHoveredEnv('beach')}
                                    onBlur={() => setHoveredEnv(null)}
                                    onClick={() => setEnvironment('beach')}
                                    accentColor="beach"
                                />
                            </div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                className="mt-20 text-[10px] tracking-[0.4em] uppercase opacity-40 font-bold"
                            >
                                Powered by OpenVolley • v1.2.5
                            </motion.p>
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

function EnvironmentCard({ title, subtitle, icon, onClick, onHover, onBlur, accentColor }) {
    const isBeach = accentColor === 'beach'
    const colorClass = isBeach ? 'text-beach-primary' : 'text-indoor-primary'
    const borderClass = isBeach ? 'hover:border-beach-primary/50' : 'hover:border-indoor-primary/50'
    const glowClass = isBeach ? 'group-hover:shadow-[0_0_50px_-12px_rgba(245,158,11,0.3)]' : 'group-hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]'

    return (
        <motion.button
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={onHover}
            onMouseLeave={onBlur}
            onClick={onClick}
            className={`group relative glass p-12 py-16 rounded-[40px] flex flex-col items-center justify-center text-center transition-all duration-500 border-2 border-white/5 ${borderClass} ${glowClass}`}
        >
            <div className={`p-6 rounded-3xl bg-white/5 mb-8 group-hover:bg-white/10 transition-all duration-500 shadow-inner ${colorClass}`}>
                {icon}
            </div>
            <h2 className="text-4xl font-black mb-3 tracking-tight group-hover:scale-110 transition-transform duration-500">{title}</h2>
            <p className="text-text-secondary text-base mb-10 font-medium opacity-60 tracking-wide">{subtitle}</p>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                Enter Arena <ChevronRight size={14} />
            </div>
        </motion.button>
    )
}

export default App
