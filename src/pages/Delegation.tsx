import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Shield, Trash2, Copy, ExternalLink } from 'lucide-react';

const agents = [
  { 
    id: 1, 
    name: 'Primary Agent', 
    address: '0xABC...123', 
    isPrimary: true,
    spendingLimit: 'Unlimited',
    permissions: ['DCA', 'Rebalance'],
    status: 'Active'
  },
  { 
    id: 2, 
    name: 'DCA Agent #1', 
    address: '0xDEF...456', 
    isPrimary: false,
    spendingLimit: '$500/month',
    permissions: ['DCA'],
    status: 'Active'
  },
  { 
    id: 3, 
    name: 'Rebalance Agent', 
    address: '0xGHI...789', 
    isPrimary: false,
    spendingLimit: '$1000/month',
    permissions: ['Rebalance'],
    status: 'Paused'
  },
];

export const Delegation = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', limit: '' });

  const handleCreateAgent = () => {
    toast({
      title: "Agent Created",
      description: `${newAgent.name} has been created with a spending limit of $${newAgent.limit}/month.`,
    });
    setDialogOpen(false);
    setNewAgent({ name: '', limit: '' });
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: "Address Copied", description: "Agent address copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Agent Delegation</h1>
          <p className="text-muted-foreground">Manage delegated sub-agents with partial allowances</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="h-4 w-4" />
              Create Sub-Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Delegated Agent</DialogTitle>
              <DialogDescription>
                Create a sub-agent with limited permissions and spending allowance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Agent Name</Label>
                <Input
                  placeholder="e.g., DCA Agent #2"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Spending Limit ($)</Label>
                <Input
                  type="number"
                  placeholder="500"
                  value={newAgent.limit}
                  onChange={(e) => setNewAgent({ ...newAgent, limit: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="gradient" onClick={handleCreateAgent}>Create Agent</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Primary Agent Card */}
      <div className="gradient-border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-semibold">Primary Agent</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">Primary</span>
              </div>
              <p className="text-muted-foreground font-mono text-sm">0xABC...123</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Spending Limit</p>
            <p className="text-lg font-semibold text-primary">Unlimited</p>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-sm">Active</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Permissions:</span>
            <span className="font-medium text-foreground">DCA, Rebalance</span>
          </div>
        </div>
      </div>

      {/* Sub-Agents Table */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Delegated Agents
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Spending Limit</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.filter(a => !a.isPrimary).map((agent) => (
              <TableRow key={agent.id}>
                <TableCell className="font-medium">{agent.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{agent.address}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyAddress(agent.address)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{agent.spendingLimit}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {agent.permissions.map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded-full bg-secondary text-xs">{p}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    agent.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {agent.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Delegation;
