import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          fontFamily: 'Arial, sans-serif',
          maxWidth: '600px',
          margin: '50px auto'
        }}>
          <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>⚠️ Something went wrong</h1>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            AutoBalancer encountered an error during startup. This usually happens when:
          </p>
          <ul style={{ textAlign: 'left', color: '#666', marginBottom: '20px' }}>
            <li>MetaMask is not installed or accessible</li>
            <li>Network connectivity issues</li>
            <li>Browser compatibility problems</li>
          </ul>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Reload Page
          </button>
          {this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>Error Details</summary>
              <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', marginTop: '10px', fontSize: '12px' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe app initialization with fallback
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  console.log("🚀 Starting AutoBalancer App...");
  
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  
  console.log("✅ AutoBalancer App initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize AutoBalancer:", error);
  
  // Fallback UI if React fails to mount
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto;">
        <h1 style="color: #e74c3c; margin-bottom: 20px;">⚠️ AutoBalancer Failed to Start</h1>
        <p style="margin-bottom: 20px; color: #666;">
          The application encountered a critical error during initialization.
        </p>
        <p style="margin-bottom: 20px; color: #666;">
          Please try refreshing the page or check the browser console for more details.
        </p>
        <button 
          onclick="window.location.reload()"
          style="
            padding: 10px 20px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          "
        >
          🔄 Reload Page
        </button>
      </div>
    `;
  }
}
