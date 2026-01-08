import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, Search, Type } from 'lucide-react'
import { api } from './services/api'

function DefinitionsView({ environment }) {
    const [definitions, setDefinitions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const isBeach = environment === 'beach'
    const accentColor = isBeach ? 'text-beach-primary' : 'text-indoor-primary'
    const borderAccent = isBeach ? 'border-beach-primary/30' : 'border-indoor-primary/30'
    const focusBorder = isBeach ? 'focus:border-beach-primary/50' : 'focus:border-indoor-primary/50'

    useEffect(() => {
        loadDefinitions()
    }, [environment])

    const loadDefinitions = async () => {
        setLoading(true)
        try {
            const data = await api.getDefinitions(environment)
            setDefinitions(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const filteredDefinitions = definitions.filter(d =>
        d.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.definition.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 text-text-muted gap-4">
            <div className={`w-12 h-12 border-4 ${borderAccent} border-t-transparent rounded-full animate-spin`} />
            <p className="font-bold tracking-widest uppercase text-sm">Indexing Definitions...</p>
        </div>
    )

    return (
        <div className="space-y-20 animate-fade-in pb-32">
            <div className="text-center max-w-2xl mx-auto mb-24">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 text-xs font-black tracking-[0.2em] uppercase ${accentColor}`}>
                    <Info size={14} /> Official Terminology
                </div>
                <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Rules <span className={accentColor}>Glossary</span></h1>
                <p className="text-xl text-text-secondary font-medium">
                    A comprehensive guide to all official {environment} volleyball terms,
                    ensuring clarity and consistency in application.
                </p>
            </div>

            <div className="max-w-3xl mx-auto w-full mb-12 relative">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-text-muted" />
                </div>
                <input
                    type="text"
                    placeholder="Search for terms, definitions, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full bg-white/5 border border-white/10 rounded-[28px] py-6 pl-16 pr-8 text-lg font-medium outline-none transition-all duration-300 shadow-2xl ${focusBorder} focus:bg-white/10`}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-6xl mx-auto w-full">
                {filteredDefinitions.map((def, index) => (
                    <motion.div
                        key={def.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group glass p-10 rounded-[32px] border border-white/5 hover:border-white/20 transition-all duration-500 shadow-xl"
                    >
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                            <div className={`w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center ${accentColor} border border-white/10 group-hover:scale-110 transition-transform`}>
                                <Type size={24} />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black tracking-tight uppercase tracking-tighter transition-all">
                                    {def.term}
                                </h3>
                                <p className="text-lg text-text-secondary leading-relaxed font-medium">
                                    {def.definition}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredDefinitions.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                        <p className="text-text-muted font-bold tracking-widest uppercase">No matching definitions found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DefinitionsView
