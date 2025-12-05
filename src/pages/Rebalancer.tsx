import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { RefreshCw, Shield, AlertCircle } from 'lucide-react';

const initialAllocations = [
  { name: 'ETH', current: 45, target: 40, color: 'hsl(var(--chart-1))' },
  { name: 'BTC', current: 30, target: 35, color: 'hsl(var(--chart-2))' },
  { name: 'USDC', current: 15, target: 15, color: 'hsl(var(--chart-3))' },
  { name: 'LINK', current: 10, target: 10, color: 'hsl(var(--chart-4))' },
];

export const Rebalancer = () => {
  const { toast } = useToast();
  const [allocations, setAllocations] = useState(initialAllocations);
  const [rebalanceEnabled, setRebalanceEnabled] = useState(false);

  const totalTarget = allocations.reduce((sum, a) => sum + a.target, 0);

  const handleTargetChange = (index: number, value: number[]) => {
    const newAllocations = [...allocations];
    newAllocations[index].target = value[0];
    setAllocations(newAllocations);
  };

  const handleEnableRebalancer = () => {
    if (totalTarget !== 100) {
      toast({
        title: "Invalid Allocation",
        description: "Target allocations must sum to 100%",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Permission Request Initiated",
      description: "Please approve the rebalancing permission in your MetaMask wallet.",
    });
    setRebalanceEnabled(true);
  };

  const currentData = allocations.map(a => ({ name: a.name, value: a.current, color: a.color }));
  const targetData = allocations.map(a => ({ name: a.name, value: a.target, color: a.color }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Portfolio Rebalancer</h1>
          <p className="text-muted-foreground">Set target allocations and automate rebalancing</p>
        </div>
        <Button variant={rebalanceEnabled ? "outline" : "gradient"} onClick={handleEnableRebalancer}>
          <Shield className="h-4 w-4" />
          {rebalanceEnabled ? "Rebalancer Active" : "Enable Rebalancer"}
        </Button>
      </div>

      {/* Allocation Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Current Allocation</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Allocation']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Target Allocation</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {targetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Target']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Allocation Controls */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold">Target Weights</h2>
          <div className={`flex items-center gap-2 text-sm ${totalTarget === 100 ? 'text-success' : 'text-warning'}`}>
            {totalTarget !== 100 && <AlertCircle className="h-4 w-4" />}
            Total: {totalTarget}%
          </div>
        </div>

        <div className="space-y-6">
          {allocations.map((allocation, index) => (
            <div key={allocation.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: allocation.color }} />
                  <span className="font-medium">{allocation.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Current: {allocation.current}%</span>
                  <span className="font-medium text-primary">Target: {allocation.target}%</span>
                </div>
              </div>
              <Slider
                value={[allocation.target]}
                onValueChange={(v) => handleTargetChange(index, v)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-lg bg-secondary/50 border border-border">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            Rebalancing Settings
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Threshold</span>
              <p className="font-medium">5% deviation</p>
            </div>
            <div>
              <span className="text-muted-foreground">Check Interval</span>
              <p className="font-medium">Every 24 hours</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <p className={`font-medium ${rebalanceEnabled ? 'text-success' : 'text-muted-foreground'}`}>
                {rebalanceEnabled ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rebalancer;
