import React, { useState } from 'react'
import { Lock, LogIn } from 'lucide-react'
import { Modal, Field, Input, Button, FormError } from './ui/volleyui'

function LoginView({ onClose }) {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const API_BASE = import.meta.env.VITE_API_URL || ''

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            let res
            try {
                res = await fetch(`${API_BASE}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password }),
                })
            } catch {
                // fetch only rejects when the request never got an answer.
                throw new Error('No connection to the server – please check your connection and try again.')
            }
            const data = await res.json().catch(() => ({}))
            // The server's message (wrong password, too many attempts) is shown as is.
            if (!res.ok) throw new Error(data.error || 'Sign-in failed.')
            localStorage.setItem('admin_token', data.token)
            window.dispatchEvent(new Event('auth-change'))
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        // A form dialog: the darker decision scrim, and a stray backdrop click
        // doesn't throw away what was typed (Escape and × still close).
        <Modal
            open
            onClose={onClose}
            title="Admin sign-in"
            icon={Lock}
            size="sm"
            decision
            dismissible={false}
            closeLabel="Close"
        >
            <form onSubmit={handleLogin} className="space-y-3">
                <Field label="Password">
                    <Input
                        type="password"
                        size="lg"
                        autoComplete="current-password"
                        data-autofocus
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        invalid={!!error}
                        required
                    />
                </Field>

                <FormError size="md">{error}</FormError>

                <Button
                    type="submit"
                    size="xl"
                    block
                    icon={LogIn}
                    loading={loading}
                    disabled={!password}
                >
                    Sign in
                </Button>
            </form>
        </Modal>
    )
}

export default LoginView
