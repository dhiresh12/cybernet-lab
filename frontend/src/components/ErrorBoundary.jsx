import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('React error boundary caught:', error, info);

    if (this.props.onError) {
      this.props.onError(error, info);
    }

    if (typeof window !== 'undefined' && window.__SENTRY__) {
      try {
        window.__SENTRY__.captureException(error, { extra: info });
      } catch (e) {
        // Sentry not available
      }
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV !== 'production';
      return (
        <div style={{
          padding: 24,
          color: '#ff3355',
          background: '#0a0a12',
          height: '100%',
          fontFamily: 'monospace',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}>
          <h2 style={{ marginBottom: 16 }}>Component Error</h2>
          <p style={{ color: '#aaa', marginBottom: 8 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {isDev && this.state.error?.stack && (
            <pre style={{
              fontSize: 11,
              color: '#888',
              background: '#111118',
              padding: 16,
              borderRadius: 4,
              maxWidth: 800,
              maxHeight: 400,
              overflow: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error.stack}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            style={{
              marginTop: 24,
              padding: '10px 24px',
              background: '#ff3355',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
