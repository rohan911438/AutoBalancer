import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  PieChart, 
  Users, 
  Settings,
  Home,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet } from '@/contexts/WalletContext';

const navItems = [
  { to: '/', icon: Home, label: 'Home', requiresWallet: false },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', requiresWallet: true },
  { to: '/create-plan', icon: PlusCircle, label: 'Create Plan', requiresWallet: true },
  { to: '/rebalancer', icon: PieChart, label: 'Rebalancer', requiresWallet: true },
  { to: '/delegation', icon: Users, label: 'Delegation', requiresWallet: true },
  { to: '/settings', icon: Settings, label: 'Settings', requiresWallet: true },
];

export const AppSidebar = () => {
  const { isConnected } = useWallet();
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold gradient-text">AutoBalancer</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems
            .filter(item => !item.requiresWallet || isConnected)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-primary'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground mb-2">Powered by</p>
            <p className="text-sm font-medium">MetaMask ERC-7715</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
