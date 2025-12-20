import React, { Suspense, useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Safe environment configuration
const getEnvVar = (key: string, defaultValue: string = '') => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    // Use import.meta.env for Vite compatibility
    return (import.meta.env as any)?.[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

// Lazy load components to prevent initialization errors
const WalletProvider = React.lazy(() => 
  import("@/contexts/WalletContext").then(module => ({ 
    default: module.WalletProvider 
  })).catch(() => ({ 
    default: ({ children }: { children: React.ReactNode }) => (
      <div>
        <div style={{ color: 'orange', padding: '10px' }}>
          ⚠️ Wallet features unavailable - MetaMask may not be installed
        </div>
        {children}
      </div>
    )
  }))
);

const AppLayout = React.lazy(() => 
  import("@/components/layout/AppLayout").then(module => ({ default: module.AppLayout }))
    .catch(() => ({ default: () => <div>Layout unavailable</div> }))
);

const HomeLayout = React.lazy(() => 
  import("@/components/layout/HomeLayout").then(module => ({ default: module.HomeLayout }))
    .catch(() => ({ default: () => <div>Home layout unavailable</div> }))
);

// Pages
const Home = React.lazy(() => import("./pages/Home").catch(() => ({ default: () => <div>Home page unavailable</div> })));
const Dashboard = React.lazy(() => import("./pages/Dashboard").catch(() => ({ default: () => <div>Dashboard unavailable</div> })));
const CreatePlan = React.lazy(() => import("./pages/CreatePlan").catch(() => ({ default: () => <div>Create Plan unavailable</div> })));
const Rebalancer = React.lazy(() => import("./pages/Rebalancer").catch(() => ({ default: () => <div>Rebalancer unavailable</div> })));
const Delegation = React.lazy(() => import("./pages/Delegation").catch(() => ({ default: () => <div>Delegation unavailable</div> })));
const Settings = React.lazy(() => import("./pages/Settings").catch(() => ({ default: () => <div>Settings unavailable</div> })));
const NotFound = React.lazy(() => import("./pages/NotFound").catch(() => ({ default: () => <div>404 - Page not found</div> })));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif'
  }}>
    <div style={{ marginBottom: '20px' }}>⚡</div>
    <div>Loading AutoBalancer...</div>
  </div>
);

// Query client with safe defaults
let queryClient: QueryClient;
try {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
    },
  });
} catch (error) {
  console.warn('Failed to create QueryClient with defaults, using minimal config:', error);
  queryClient = new QueryClient();
}

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔧 Initializing AutoBalancer...');
        
        // Basic browser compatibility checks
        if (typeof window === 'undefined') {
          throw new Error('Window object not available');
        }
        
        if (!window.location) {
          throw new Error('Location not available');
        }
        
        // Give the DOM a moment to settle
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('✅ AutoBalancer ready');
        setIsReady(true);
      } catch (err) {
        console.error('❌ App initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown initialization error');
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '50px auto'
      }}>
        <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>⚠️ Initialization Error</h1>
        <p style={{ marginBottom: '20px', color: '#666' }}>Error: {error}</p>
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
          🔄 Retry
        </button>
      </div>
    );
  }

  if (!isReady) {
    return <LoadingFallback />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Suspense fallback={<LoadingFallback />}>
          <WalletProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Home page with its own layout (no sidebar) */}
                  <Route element={<HomeLayout />}>
                    <Route path="/" element={<Home />} />
                  </Route>
                  
                  {/* Dashboard pages with sidebar layout */}
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create-plan" element={<CreatePlan />} />
                    <Route path="/rebalancer" element={<Rebalancer />} />
                    <Route path="/delegation" element={<Delegation />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </WalletProvider>
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
