import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { HomeLayout } from "@/components/layout/HomeLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CreatePlan from "./pages/CreatePlan";
import Rebalancer from "./pages/Rebalancer";
import Delegation from "./pages/Delegation";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </WalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
