import { Component, type ErrorInfo, type ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary-container">
                    <div className="error-card">
                        <div className="error-icon">⚠️</div>
                        <h1>Something went wrong</h1>
                        <p>We encountered an unexpected error while rendering this part of the dashboard.</p>
                        <pre className="error-message">
                            {this.state.error?.message || "Unknown error"}
                        </pre>
                        <button 
                            className="error-retry-btn"
                            onClick={() => window.location.reload()}
                        >
                            RELOAD DASHBOARD
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
