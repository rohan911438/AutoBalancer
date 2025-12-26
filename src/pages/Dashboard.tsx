import { StatCard } from '@/components/cards/StatCard';
import { BackendStatus } from '@/components/BackendStatus';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { BalanceDebugger } from '@/components/BalanceDebugger';
import { WalletStatus } from '@/components/WalletStatus';
import { 
  Activity, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Play,
  Pause,
  MoreVertical,
  Wallet,
  RefreshCw
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const stats = [
  { title: 'Active Plans', value: '3', subtitle: '2 DCA, 1 Rebalancer', icon: Activity },
  { title: 'Total Invested', value: '$12,450', subtitle: 'All time', icon: DollarSign, trend: { value: '+15.3%', positive: true } },
  { title: 'Next Execution', value: '2h 34m', subtitle: 'ETH DCA Plan', icon: Clock },
  { title: 'Portfolio Value', value: '$18,234', subtitle: 'Current', icon: TrendingUp, trend: { value: '+8.2%', positive: true } },
];

const chartData = [
  { date: 'Nov 1', value: 10000 },
  { date: 'Nov 8', value: 11200 },
  { date: 'Nov 15', value: 10800 },
  { date: 'Nov 22', value: 12500 },
  { date: 'Nov 29', value: 14200 },
  { date: 'Dec 5', value: 18234 },
];

const activePlans = [
  { id: 1, name: 'ETH Weekly DCA', token: 'ETH', amount: '$100/week', status: 'Active', nextExecution: '2h 34m' },
  { id: 2, name: 'BTC Daily DCA', token: 'BTC', amount: '$50/day', status: 'Active', nextExecution: '6h 12m' },
  { id: 3, name: 'Portfolio Rebalancer', token: 'Mixed', amount: 'Auto', status: 'Paused', nextExecution: '-' },
];

const executionHistory = [
  { id: 1, date: 'Dec 4, 2024', plan: 'ETH Weekly DCA', amount: '0.042 ETH', value: '$100.00', status: 'Success' },
  { id: 2, date: 'Dec 4, 2024', plan: 'BTC Daily DCA', amount: '0.0012 BTC', value: '$50.00', status: 'Success' },
  { id: 3, date: 'Dec 3, 2024', plan: 'BTC Daily DCA', amount: '0.0011 BTC', value: '$50.00', status: 'Success' },
  { id: 4, date: 'Dec 2, 2024', plan: 'BTC Daily DCA', amount: '0.0013 BTC', value: '$50.00', status: 'Success' },
];

export const Dashboard = () => {
  const { isConnected, address, rawAddress, balance, refreshBalance } = useWallet();

  const handleRefreshBalance = async () => {
    try {
      await refreshBalance();
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  return (
    <div className="space-y-6">
      <WalletStatus />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your automated investment strategies</p>
        </div>
        <Button variant="gradient">
          <Activity className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Backend Status Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <BackendStatus />
        <div className="md:col-span-2">
          <div className="glass-card p-6">
            <h2 className="text-xl font-display font-semibold mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Frontend</span>
                <span className="text-sm font-medium text-green-600">✅ Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">MetaMask</span>
                <span className="text-sm font-medium text-green-600">✅ Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Scheduler</span>
                <span className="text-sm font-medium text-yellow-600">⏸️ Development Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-display font-semibold mb-6">Portfolio Performance</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Plans */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-display font-semibold mb-6">Active Plans</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {activePlans.map((plan) => (
            <div key={plan.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.amount}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${plan.status === 'Active' ? 'bg-success' : 'bg-warning'}`} />
                  <span className="text-sm">{plan.status}</span>
                </div>
                <Button variant="ghost" size="sm">
                  {plan.status === 'Active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
              {plan.nextExecution !== '-' && (
                <p className="text-xs text-muted-foreground mt-2">Next: {plan.nextExecution}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Execution History */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-display font-semibold mb-6">Execution History</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executionHistory.map((execution) => (
              <TableRow key={execution.id}>
                <TableCell className="text-muted-foreground">{execution.date}</TableCell>
                <TableCell>{execution.plan}</TableCell>
                <TableCell className="font-mono">{execution.amount}</TableCell>
                <TableCell>{execution.value}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                    {execution.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;
