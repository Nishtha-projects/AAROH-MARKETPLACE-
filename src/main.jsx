import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n.js'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Aaroh UI caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#FAF5EB',
          color: '#1C2638',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🪷</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', marginBottom: '12px' }}>
            Aaroh Cultural Journal
          </h2>
          <p style={{ maxWidth: '480px', marginBottom: '20px', color: '#525E75' }}>
            An unexpected error occurred while loading this view: {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              backgroundColor: '#1A3459',
              color: '#FAF5EB',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reload Aaroh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

