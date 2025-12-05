import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Shield, Zap, Info } from 'lucide-react';

const tokens = [
  { value: 'eth', label: 'ETH - Ethereum', icon: '⟠' },
  { value: 'btc', label: 'WBTC - Wrapped Bitcoin', icon: '₿' },
  { value: 'usdc', label: 'USDC - USD Coin', icon: '$' },
  { value: 'usdt', label: 'USDT - Tether', icon: '₮' },
  { value: 'link', label: 'LINK - Chainlink', icon: '⬡' },
];

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const CreatePlan = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    spendToken: '',
    buyToken: '',
    amount: '',
    frequency: '',
    duration: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Permission Request Initiated",
      description: "Please approve the ERC-7715 permission in your MetaMask wallet.",
    });
  };

  const isFormValid = formData.spendToken && formData.buyToken && formData.amount && formData.frequency;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Create DCA Plan</h1>
        <p className="text-muted-foreground">Set up automated recurring purchases with MetaMask permissions</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Form Section */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Token to Spend</Label>
                <Select value={formData.spendToken} onValueChange={(v) => setFormData({ ...formData, spendToken: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select token to spend" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.value} value={token.value}>
                        <span className="flex items-center gap-2">
                          <span>{token.icon}</span>
                          {token.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Token to Buy</Label>
                <Select value={formData.buyToken} onValueChange={(v) => setFormData({ ...formData, buyToken: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select token to buy" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.value} value={token.value}>
                        <span className="flex items-center gap-2">
                          <span>{token.icon}</span>
                          {token.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount per Period ($)</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration (optional)</Label>
                <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Indefinite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Month</SelectItem>
                    <SelectItem value="3m">3 Months</SelectItem>
                    <SelectItem value="6m">6 Months</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                    <SelectItem value="indefinite">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={!isFormValid}>
              <Shield className="h-4 w-4" />
              Enable Plan & Request Permission
            </Button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="md:col-span-2 space-y-6">
          {/* Plan Summary */}
          <div className="glass-card p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Plan Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spending</span>
                <span className="font-medium">{formData.spendToken ? tokens.find(t => t.value === formData.spendToken)?.label.split(' - ')[0] : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buying</span>
                <span className="font-medium">{formData.buyToken ? tokens.find(t => t.value === formData.buyToken)?.label.split(' - ')[0] : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">${formData.amount || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-medium capitalize">{formData.frequency || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{formData.duration || 'Indefinite'}</span>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between font-semibold">
                  <span>Est. Monthly</span>
                  <span className="text-primary">
                    ${formData.amount && formData.frequency ? 
                      (Number(formData.amount) * (formData.frequency === 'daily' ? 30 : formData.frequency === 'weekly' ? 4 : formData.frequency === 'biweekly' ? 2 : 1)).toFixed(2) 
                      : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Permission Info */}
          <div className="glass-card p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              ERC-7715 Permission
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This plan will request a limited permission to execute trades on your behalf. You maintain full control and can revoke anytime.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Spending limit enforced
              </li>
              <li className="flex items-center gap-2 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Time-bound execution
              </li>
              <li className="flex items-center gap-2 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Revocable anytime
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;
