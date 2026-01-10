import React from 'react';
import { theme } from '../styles/theme';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    resetErrorBoundary = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            // Check if a custom fallback is provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    ...theme.styles.glass,
                    borderRadius: '1.5rem',
                    margin: '2rem auto',
                    maxWidth: '600px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444'
                    }}>
                        <AlertTriangle size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Something went wrong</h2>
                    <p style={{ color: theme.colors.text.secondary, margin: 0 }}>
                        We encountered an unexpected error in this section.
                    </p>

                    {/* Optional: Show technically error detail in dev mode (or if requested) */}
                    {/* <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                        {this.state.error && this.state.error.toString()}
                    </details> */}

                    <button
                        onClick={this.resetErrorBoundary}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '2rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                        }}
                    >
                        <RefreshCcw size={18} /> Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
