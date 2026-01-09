import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { theme } from './styles/theme'
import { supabase } from './lib/supabase'
import { X, Lock, LogIn } from 'lucide-react'

function LoginView({ onClose }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Supabase Login Error:', error)
            setError(error.message)
            setLoading(false)
        } else {
            // Login successful
            setLoading(false)
            onClose()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 3000,
                backgroundColor: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                style={{
                    backgroundColor: '#1a1a1a',
                    padding: '2rem',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    width: '100%',
                    maxWidth: '400px',
                    position: 'relative'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: theme.colors.text.secondary,
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '1rem',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        marginBottom: '1rem',
                        color: 'white'
                    }}>
                        <Lock size={32} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Admin Access</h2>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '0.5rem',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            backgroundColor: 'white',
                            color: 'black',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Signing in...' : <><LogIn size={20} /> Sign In</>}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    )
}

export default LoginView
