import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Clock, DollarSign, AlertTriangle, ExternalLink } from 'lucide-react';

const permissions = [
  {
    id: 1,
    name: 'ETH Weekly DCA',
    type: 'DCA Plan',
    grantedAt: 'Nov 15, 2024',
    expiresAt: 'Nov 15, 2025',
    spendingLimit: '$100/week',
    tokenSpend: 'USDC',
    tokenBuy: 'ETH',
    status: 'Active',
  },
  {
    id: 2,
    name: 'BTC Daily DCA',
    type: 'DCA Plan',
    grantedAt: 'Nov 20, 2024',
    expiresAt: 'Feb 20, 2025',
    spendingLimit: '$50/day',
    tokenSpend: 'USDC',
    tokenBuy: 'WBTC',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Portfolio Rebalancer',
    type: 'Rebalancer',
    grantedAt: 'Dec 1, 2024',
    expiresAt: 'Dec 1, 2025',
    spendingLimit: '$1000/month',
    tokenSpend: 'Multiple',
    tokenBuy: 'Multiple',
    status: 'Paused',
  },
];

export const Settings = () => {
  const { toast } = useToast();

  const handleRevoke = (permissionName: string) => {
    toast({
      title: "Permission Revoked",
      description: `${permissionName} permission has been revoked successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Settings & Permissions</h1>
        <p className="text-muted-foreground">Manage all granted ERC-7715 permissions</p>
      </div>

      {/* Warning Banner */}
      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-warning">Permission Management</p>
          <p className="text-sm text-muted-foreground">
            Revoking a permission will immediately stop all associated automated actions. 
            You can re-enable them by creating a new plan.
          </p>
        </div>
      </div>

      {/* Permissions List */}
      <div className="space-y-4">
        {permissions.map((permission) => (
          <div key={permission.id} className="glass-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold">{permission.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      permission.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {permission.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{permission.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRevoke(permission.name)}
                >
                  Revoke
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border grid md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Granted</p>
                  <p className="text-sm font-medium">{permission.grantedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p className="text-sm font-medium">{permission.expiresAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Spending Limit</p>
                  <p className="text-sm font-medium">{permission.spendingLimit}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Token Pair</p>
                <p className="text-sm font-medium">{permission.tokenSpend} → {permission.tokenBuy}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Settings */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-display font-semibold mb-4">General Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium">Notification Preferences</p>
              <p className="text-sm text-muted-foreground">Receive alerts for executed trades</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium">Default Slippage Tolerance</p>
              <p className="text-sm text-muted-foreground">Currently set to 0.5%</p>
            </div>
            <Button variant="outline" size="sm">Adjust</Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium">Gas Settings</p>
              <p className="text-sm text-muted-foreground">Automatic gas optimization enabled</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
