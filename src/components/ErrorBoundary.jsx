import React from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { Button } from '../ui/volleyui'

/**
 * Catches a crash inside one panel so the rest of the app (navigation, other
 * tabs) keeps working, and offers to load the panel again.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { error: null }
    }

    static getDerivedStateFromError(error) {
        return { error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    resetErrorBoundary = () => {
        this.setState({ error: null })
        if (this.props.onReset) this.props.onReset()
    }

    render() {
        if (!this.state.error) return this.props.children
        if (this.props.fallback) return this.props.fallback

        return (
            <div className="mx-auto max-w-sm rounded-2xl border border-stone-200/70 bg-white p-6 text-center shadow-card">
                <AlertTriangle className="mx-auto h-8 w-8 text-red-600" aria-hidden="true" />
                <h2 className="mt-3 text-base font-semibold text-stone-900">This section could not be shown</h2>
                <p className="mt-2 text-xs text-stone-500">Something went wrong while loading it. The rest of the app still works.</p>
                {this.state.error.message && (
                    <p className="mt-1 break-words text-[11px] text-stone-400">{this.state.error.message}</p>
                )}
                <Button block icon={RotateCw} className="mt-5" onClick={this.resetErrorBoundary}>Try again</Button>
            </div>
        )
    }
}

export default ErrorBoundary
