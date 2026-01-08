import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { List, User, Users, AlertTriangle } from 'lucide-react'
import { api } from './services/api'

function GesturesView({ environment }) {
    const [gestures, setGestures] = useState([])
    const [loading, setLoading] = useState(true)

    const isBeach = environment === 'beach'
    const accentColor = isBeach ? 'text-beach-primary' : 'text-indoor-primary'
    const accentBg = isBeach ? 'bg-beach-primary' : 'bg-indoor-primary'
    const borderAccent = isBeach ? 'border-beach-primary/30' : 'border-indoor-primary/30'

    useEffect(() => {
        loadGestures()
    }, [environment])

    const loadGestures = async () => {
        setLoading(true)
        try {
            const data = await api.getGestures(environment)
            setGestures(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 text-text-muted gap-4">
            <div className={`w-12 h-12 border-4 ${borderAccent} border-t-transparent rounded-full animate-spin`} />
            <p className="font-bold tracking-widest uppercase text-sm">Preparing Referee Signals...</p>
        </div>
    )

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 text-xs font-black tracking-[0.2em] uppercase ${accentColor}`}>
                    <List size={14} /> Official Signals
                </div>
                <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Referee <span className={accentColor}>Gestures</span></h1>
                <p className="text-xl text-text-secondary font-medium">
                    The visual language of officiating. Explore standard hand signals
                    and the corresponding responsibilities for match officials.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
                {gestures.map((gesture, index) => (
                    <motion.div
                        key={gesture.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group glass rounded-[40px] overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-500 shadow-2xl"
                    >
                        <div className="flex flex-col lg:flex-row">
                            {/* Image Section */}
                            <div className="lg:w-1/3 bg-black/40 p-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/5">
                                <div className="relative">
                                    <div className={`absolute -inset-4 rounded-full blur-3xl opacity-20 ${accentBg}`} />
                                    <img
                                        src={gesture.url}
                                        alt={gesture.title}
                                        className="relative w-full max-w-[200px] h-auto object-contain group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="lg:w-2/3 p-10 lg:p-14 flex flex-col justify-center gap-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-xl glass border border-white/10 font-bold text-xs tracking-widest uppercase ${accentColor}`}>
                                            SIGNAL {gesture.gestureNumber || index + 1}
                                        </span>
                                    </div>
                                    <h3 className="text-4xl font-black tracking-tighter uppercase">{gesture.title}</h3>
                                    <p className="text-xl text-text-secondary font-medium leading-relaxed">
                                        {gesture.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-start gap-4 transition-colors hover:bg-white/10">
                                        <div className={`p-2 rounded-xl bg-blend-soft-light ${gesture.referee_1 ? accentBg : 'bg-white/10'}`}>
                                            <User size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black tracking-widest uppercase opacity-40">1st Referee</p>
                                            <p className={`font-bold ${gesture.referee_1 ? 'text-white' : 'text-text-muted'}`}>
                                                {gesture.referee_1 ? 'Responsible' : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-start gap-4 transition-colors hover:bg-white/10">
                                        <div className={`p-2 rounded-xl bg-blend-soft-light ${gesture.referee_2 ? accentBg : 'bg-white/10'}`}>
                                            <Users size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black tracking-widest uppercase opacity-40">2nd Referee</p>
                                            <p className={`font-bold ${gesture.referee_2 ? 'text-white' : 'text-text-muted'}`}>
                                                {gesture.referee_2 ? 'Responsible' : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {gestures.length === 0 && (
                <div className="text-center py-24 glass rounded-[40px] border border-dashed border-white/10">
                    <p className="text-text-muted font-bold tracking-widest uppercase">Visualizing gestures, please wait...</p>
                </div>
            )}
        </div>
    )
}

export default GesturesView
