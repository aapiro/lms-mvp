import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <span className="error-boundary-icon">⚠️</span>
            <h2>Algo salió mal</h2>
            <p>Ha ocurrido un error inesperado. Puedes intentar recargar la página.</p>
            <div className="error-boundary-actions">
              <button
                onClick={() => window.location.reload()}
                className="error-boundary-btn primary"
              >
                Recargar página
              </button>
              <a href="/" className="error-boundary-btn secondary">
                Volver al inicio
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
