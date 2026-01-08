import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, AlertTriangle } from 'lucide-react'
import { api } from './services/api'

function GesturesView({ environment }) {
    const [gestures, setGestures] = useState([])
    const [loading, setLoading] = useState(true)

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

    if (loading) return <div className="flex items-center justify-center p-20 text-text-muted">Loading gestures...</div>

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Referee Signals</h1>
                <p className="text-text-secondary">Official hand signals used by the refereeing team.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gestures.map((gesture) => (
                    <motion.div
                        key={gesture.id}
                        whileHover={{ scale: 1.01 }}
                        className="glass rounded-3xl overflow-hidden border border-border-subtle group flex flex-col sm:flex-row"
                    >
                        <div className="w-full sm:w-1/3 aspect-[3/4] bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {gesture.image ? (
                                <img
                                    src={gesture.image}
                                    alt={gesture.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <div className="text-text-muted text-xs font-mono uppercase tracking-widest rotate-90">No Image</div>
                            )}
                        </div>

                        <div className="p-6 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono text-text-muted">Signal {gesture.gesture_n}</span>
                                    <div className="flex gap-2">
                                        {gesture.first_r && (
                                            <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-[10px] font-bold border border-orange-500/20" title="1st Referee">1R</span>
                                        )}
                                        {gesture.second_r && (
                                            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[10px] font-bold border border-blue-500/20" title="2nd Referee">2R</span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold">{gesture.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{gesture.text}</p>
                            </div>

                            {gesture.notes && (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <p className="text-xs text-text-muted italic flex items-start gap-2">
                                        <ShieldAlert className="w-3 h-3 mt-0.5 shrink-0" />
                                        {gesture.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default GesturesView
