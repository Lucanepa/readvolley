import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Clock, ClipboardList, Zap } from 'lucide-react'
import { api } from './services/api'

function ProtocolsView({ environment }) {
    const [type, setType] = useState('game') // 'game' | 'other'
    const [protocols, setProtocols] = useState([])
    const [loading, setLoading] = useState(true)

    const isBeach = environment === 'beach'
    const accentColor = isBeach ? 'text-beach-primary' : 'text-indoor-primary'
    const accentBg = isBeach ? 'bg-beach-primary' : 'bg-indoor-primary'
    const borderAccent = isBeach ? 'border-beach-primary/30' : 'border-indoor-primary/30'

    useEffect(() => {
        loadProtocols()
    }, [environment, type])

    const loadProtocols = async () => {
        setLoading(true)
        try {
            const data = await api.getProtocols(environment)
            setProtocols(type === 'game' ? data.gameProtocol : data.otherProtocols)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 text-text-muted gap-4">
            <div className={`w-12 h-12 border-4 ${borderAccent} border-t-transparent rounded-full animate-spin`} />
            <p className="font-bold tracking-widest uppercase text-sm">Loading Procedural Guides...</p>
        </div>
    )

    return (
        <div className="space-y-24 animate-fade-in pb-32">
            <div className="text-center max-w-2xl mx-auto mb-24">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 text-xs font-black tracking-[0.2em] uppercase ${accentColor}`}>
                    <ShieldCheck size={14} /> Match Procedures
                </div>
                <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Official <span className={accentColor}>Protocols</span></h1>
                <p className="text-xl text-text-secondary font-medium">
                    Standardized timings and procedures for every stage of the match,
                    maintaining fairness and organization at all levels.
                </p>
            </div>

            <div className="flex justify-center mb-20">
                <div className="flex p-1.5 bg-white/5 rounded-[24px] border border-white/10 w-full max-w-md shadow-2xl">
                    <button
                        onClick={() => setType('game')}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[20px] font-black tracking-tight transition-all duration-300 ${type === 'game'
                            ? `${accentBg} text-white shadow-xl`
                            : 'text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Clock size={18} /> Game Protocol
                    </button>
                    <button
                        onClick={() => setType('other')}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[20px] font-black tracking-tight transition-all duration-300 ${type === 'other'
                            ? `${accentBg} text-white shadow-xl`
                            : 'text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Zap size={18} /> Other Protocols
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 gap-6 max-w-4xl mx-auto"
                >
                    {protocols.map((protocol, index) => (
                        <div
                            key={protocol.id}
                            className="glass p-12 rounded-[40px] border border-white/5 hover:border-white/20 transition-all duration-500 shadow-2xl group"
                        >
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className={`shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${accentColor} group-hover:scale-105 transition-transform duration-500`}>
                                    <ClipboardList size={32} />
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <h3 className="text-2xl font-black tracking-tight uppercase tracking-tighter">{protocol.title}</h3>
                                        <span className={`px-4 py-2 rounded-xl bg-white/5 border border-white/10 font-black text-xs tracking-widest uppercase ${accentColor}`}>
                                            SEQUENCE {index + 1}
                                        </span>
                                    </div>
                                    <p className="text-lg text-text-secondary font-medium leading-relaxed">
                                        {protocol.protocolText}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {protocols.length === 0 && (
                        <div className="text-center py-24 glass rounded-[32px] border border-dashed border-white/10">
                            <p className="text-text-muted font-black tracking-widest uppercase">No protocols recorded for this category yet.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default ProtocolsView
