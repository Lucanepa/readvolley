import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Maximize2 } from 'lucide-react'
import { api } from './services/api'

function DiagramsView({ environment }) {
    const [diagrams, setDiagrams] = useState([])
    const [loading, setLoading] = useState(true)

    const isBeach = environment === 'beach'
    const accentColor = isBeach ? 'text-beach-primary' : 'text-indoor-primary'
    const borderAccent = isBeach ? 'border-beach-primary/30' : 'border-indoor-primary/30'

    useEffect(() => {
        loadDiagrams()
    }, [environment])

    const loadDiagrams = async () => {
        setLoading(true)
        try {
            const data = await api.getDiagrams(environment)
            setDiagrams(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 text-text-muted gap-4">
            <div className={`w-12 h-12 border-4 ${borderAccent} border-t-transparent rounded-full animate-spin`} />
            <p className="font-bold tracking-widest uppercase text-sm">Loading Visual Assets...</p>
        </div>
    )

    return (
        <div className="space-y-24 animate-fade-in pb-32">
            <div className="text-center max-w-2xl mx-auto mb-24">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 text-xs font-black tracking-[0.2em] uppercase ${accentColor}`}>
                    <ImageIcon size={14} /> Visual Reference
                </div>
                <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Official <span className={accentColor}>Diagrams</span></h1>
                <p className="text-xl text-text-secondary font-medium">
                    Detailed court dimensions, equipment specifications, and field layouts
                    as defined by official regulations.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {diagrams.map((diagram, index) => (
                    <motion.div
                        key={diagram.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group glass rounded-[32px] overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 shadow-2xl"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden bg-black/40 p-4">
                            <img
                                src={diagram.url}
                                alt={diagram.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <button className="glass p-4 rounded-full hover:scale-110 transition-transform">
                                    <Maximize2 className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="absolute top-6 left-6">
                                <span className={`px-4 py-2 rounded-xl glass border border-white/10 font-black text-sm tracking-tight ${accentColor}`}>
                                    DIAGRAM {diagram.n}
                                </span>
                            </div>
                        </div>
                        <div className="p-10">
                            <h3 className="text-2xl font-black tracking-tight mb-2 uppercase group-hover:translate-x-1 transition-transform tracking-tighter">
                                {diagram.name}
                            </h3>
                            <p className="text-text-secondary font-medium opacity-60">
                                Official scale reference for {environment} volleyball standards.
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {diagrams.length === 0 && (
                <div className="text-center py-20 glass rounded-[32px] border border-dashed border-white/10">
                    <p className="text-text-muted font-bold tracking-widest uppercase">No diagrams available for this environment yet.</p>
                </div>
            )}
        </div>
    )
}

export default DiagramsView
