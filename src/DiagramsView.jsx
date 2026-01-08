import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from './services/api'

function DiagramsView({ environment }) {
    const [diagrams, setDiagrams] = useState([])
    const [loading, setLoading] = useState(true)

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

    if (loading) return <div className="flex items-center justify-center p-20 text-text-muted">Loading diagrams...</div>

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Diagrams</h1>
                <p className="text-text-secondary">Official visual references and court dimensions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {diagrams.map((diagram) => (
                    <motion.div
                        key={diagram.id}
                        whileHover={{ y: -5 }}
                        className="glass rounded-3xl overflow-hidden border border-border-subtle group"
                    >
                        <div className="aspect-video relative bg-white/5 overflow-hidden flex items-center justify-center">
                            {diagram.diagram_image ? (
                                <img
                                    src={diagram.diagram_image}
                                    alt={diagram.diagram_name}
                                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="text-text-muted">No Image Available</div>
                            )}
                        </div>
                        <div className="p-6">
                            <span className="text-xs font-mono text-text-muted uppercase tracking-widest">Diagram {diagram.diagram_n}</span>
                            <h3 className="text-lg font-bold mt-1">{diagram.diagram_name}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default DiagramsView
