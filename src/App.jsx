import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Home, ChevronRight, Search } from 'lucide-react'
import MainLayout from './components/MainLayout'
import SearchView from './SearchView'
import SwissVolleyView from './SwissVolleyView'
import SwissVolleyMark from './components/SwissVolleyMark'
import LoginView from './LoginView'
import { warmSearchIndex } from './components/SectionShell'
import { Button, UiHost, FOCUS_RING, cn } from './ui/volleyui'
import { useRoute, navigate, routeTitle } from './services/router'

function checkToken() {
    const token = localStorage.getItem('admin_token')
    if (!token) return null
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp * 1000 > Date.now()) {
            return { role: payload.role }
        }
        localStorage.removeItem('admin_token')
    } catch {
        localStorage.removeItem('admin_token')
    }
    return null
}

function App() {
    const route = useRoute()
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [user, setUser] = useState(checkToken)

    const environment = route.view === 'env' ? route.environment : null

    useEffect(() => {
        const onAuthChange = () => setUser(checkToken())
        window.addEventListener('auth-change', onAuthChange)
        return () => window.removeEventListener('auth-change', onAuthChange)
    }, [])

    useEffect(() => {
        document.title = routeTitle(route)
    }, [route.view, route.environment, route.tab])

    const openSearch = () => setIsSearchOpen(true)
    const openLogin = () => setShowLogin(true)

    return (
        <>
            {route.view === 'env' ? (
                <MainLayout
                    environment={environment}
                    activeTab={route.tab}
                    user={user}
                    onOpenSearch={openSearch}
                    onLogin={openLogin}
                />
            ) : route.view === 'swiss' ? (
                <SwissVolleyView
                    user={user}
                    activeTab={route.tab}
                    onLogin={openLogin}
                    onOpenSearch={openSearch}
                />
            ) : (
                <HomeScreen onOpenSearch={openSearch} />
            )}

            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="fixed inset-0 z-50"
                    >
                        <SearchView
                            onClose={() => setIsSearchOpen(false)}
                            initialEnvironment={environment}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLogin && (
                    <LoginView onClose={() => setShowLogin(false)} />
                )}
            </AnimatePresence>

            <UiHost />
        </>
    )
}

/** The front door: pick a discipline, search, or open Swiss Volley. */
function HomeScreen({ onOpenSearch }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="relative overflow-hidden bg-white rounded-3xl shadow-card-lg border border-stone-200/70 p-6 sm:p-8">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 to-red-500" />
                    <div className="text-center mb-7">
                        <h1 className="text-3xl font-bold tracking-tight text-stone-900">ReadVolley</h1>
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Rules and casebook</p>
                    </div>

                    <div className="space-y-2">
                        <DisciplineButton icon={Home} title="Volleyball" hint="Indoor rules, diagrams and signals" onClick={() => navigate('/indoor/rules')} />
                        <DisciplineButton icon={Sun} title="Beach volleyball" hint="Beach rules, diagrams and signals" onClick={() => navigate('/beach/rules')} />
                    </div>

                    <Button
                        variant="secondary"
                        size="xl"
                        block
                        icon={Search}
                        className="mt-4"
                        onClick={onOpenSearch}
                        onPointerEnter={warmSearchIndex}
                        onFocus={warmSearchIndex}
                    >
                        Search everything
                    </Button>

                    <div className="mt-6 border-t border-stone-100 pt-5 flex justify-center">
                        <button
                            type="button"
                            onClick={() => navigate('/swiss_volley')}
                            className={cn('rounded-lg px-3 py-2 transition-colors hover:bg-stone-100', FOCUS_RING)}
                        >
                            <SwissVolleyMark fontSize="1.125rem" />
                        </button>
                    </div>
                </div>
                <p className="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-stone-400 mt-5">
                    Powered by OpenVolley · v1.2.6
                </p>
            </div>
        </div>
    )
}

function DisciplineButton({ icon: Icon, title, hint, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn('group w-full flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-3 text-left transition-colors hover:border-stone-300 hover:bg-stone-50 active:scale-[0.99]', FOCUS_RING)}
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
                <Icon size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-stone-900">{title}</span>
                <span className="block text-xs text-stone-500">{hint}</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-stone-400 group-hover:text-stone-600" aria-hidden="true" />
        </button>
    )
}

export default App
