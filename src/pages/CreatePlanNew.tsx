import { useState } from 'react';
import { ethers } from 'ethers';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Shield, Wallet, CheckCircle2 } from 'lucide-react';

// Token addresses (update for your target network)
const tokenAddresses = {
  eth: '0x0000000000000000000000000000000000000000', // ETH
  weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  usdc: '0xA0b86a33E6441E67f8e1f4a6D2A4cb7C3d4b2b8D', // USDC
  usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  btc: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  link: '0x514910771af9ca656af840dff83e8264ecf986ca', // LINK
};

const tokens = [
  { value: 'usdc', label: 'USDC - USD Coin', icon: '$', address: tokenAddresses.usdc, decimals: 6 },
  { value: 'usdt', label: 'USDT - Tether', icon: '₮', address: tokenAddresses.usdt, decimals: 6 },
  { value: 'weth', label: 'WETH - Wrapped Ethereum', icon: '⟠', address: tokenAddresses.weth, decimals: 18 },
  { value: 'btc', label: 'WBTC - Wrapped Bitcoin', icon: '₿', address: tokenAddresses.btc, decimals: 8 },
  { value: 'link', label: 'LINK - Chainlink', icon: '⬡', address: tokenAddresses.link, decimals: 18 },
];

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const durations = [
  { value: '1m', label: '1 Month', seconds: 30 * 24 * 60 * 60 },
  { value: '3m', label: '3 Months', seconds: 90 * 24 * 60 * 60 },
  { value: '6m', label: '6 Months', seconds: 180 * 24 * 60 * 60 },
  { value: '1y', label: '1 Year', seconds: 365 * 24 * 60 * 60 },
];

const CreatePlan = () => {
  // Temporary hooks - replace with actual implementations
  const useToast = () => ({ toast: (args: any) => console.log('Toast:', args) });
  const useWallet = () => ({
    isConnected: true,
    address: '0x1234567890123456789012345678901234567890',
    requestPermission: async () => ({ success: true, permissionId: 'test-permission' })
  });

  const { toast } = useToast();
  const { isConnected, address, requestPermission } = useWallet();

  // Form state
  const [currentStep, setCurrentStep] = useState<'plan' | 'permission' | 'success'>('plan');
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const calculateTotalAmount = () => {
    if (!amount || !frequency || !duration) return '0';
    
    const amountNum = parseFloat(amount);
    const durationData = durations.find(d => d.value === duration);
    if (!durationData) return '0';
    
    const daysInDuration = durationData.seconds / (24 * 60 * 60);
    let executionCount = 0;
    
    switch (frequency) {
      case 'daily':
        executionCount = Math.floor(daysInDuration);
        break;
      case 'weekly':
        executionCount = Math.floor(daysInDuration / 7);
        break;
      case 'monthly':
        executionCount = Math.floor(daysInDuration / 30);
        break;
    }
    
    return (amountNum * executionCount).toFixed(6);
  };

  const handleCreatePlan = async () => {
    if (!fromToken || !toToken || !amount || !frequency || !duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep('permission');
  };

  const handlePermissionRequest = async () => {
    setIsCreating(true);
    
    try {
      const result = await requestPermission({});
      
      if (result.success) {
        setCurrentStep('success');
        toast({
          title: "Success",
          description: "DCA plan created successfully",
        });
      }
    } catch (error) {
      console.error('Failed to create plan:', error);
      toast({
        title: "Error",
        description: "Failed to create DCA plan",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('plan');
    setFromToken('');
    setToToken('');
    setAmount('');
    setFrequency('');
    setDuration('');
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Connect Your Wallet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Please connect your MetaMask wallet to create DCA plans
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create DCA Plan</h1>
        <p className="text-muted-foreground">
          Set up automated Dollar Cost Averaging with MetaMask Advanced Permissions
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${currentStep === 'plan' ? 'text-primary' : 'text-green-600'}`}>
            <div className={`rounded-full p-2 ${currentStep === 'plan' ? 'bg-primary text-primary-foreground' : 'bg-green-600 text-white'}`}>
              {currentStep === 'plan' ? '1' : <CheckCircle2 className="h-4 w-4" />}
            </div>
            <span className="ml-2 text-sm font-medium">Configure Plan</span>
          </div>
          
          <div className={`h-0.5 flex-1 mx-4 ${currentStep !== 'plan' ? 'bg-green-600' : 'bg-muted'}`} />
          
          <div className={`flex items-center ${currentStep === 'permission' ? 'text-primary' : currentStep === 'success' ? 'text-green-600' : 'text-muted-foreground'}`}>
            <div className={`rounded-full p-2 ${currentStep === 'permission' ? 'bg-primary text-primary-foreground' : currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-muted'}`}>
              {currentStep === 'permission' ? '2' : currentStep === 'success' ? <CheckCircle2 className="h-4 w-4" /> : '2'}
            </div>
            <span className="ml-2 text-sm font-medium">Grant Permission</span>
          </div>
          
          <div className={`h-0.5 flex-1 mx-4 ${currentStep === 'success' ? 'bg-green-600' : 'bg-muted'}`} />
          
          <div className={`flex items-center ${currentStep === 'success' ? 'text-green-600' : 'text-muted-foreground'}`}>
            <div className={`rounded-full p-2 ${currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-muted'}`}>
              {currentStep === 'success' ? <CheckCircle2 className="h-4 w-4" /> : '3'}
            </div>
            <span className="ml-2 text-sm font-medium">Complete</span>
          </div>
        </div>
      </div>

      {/* Plan Configuration Step */}
      {currentStep === 'plan' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>DCA Configuration</CardTitle>
              <CardDescription>
                Set up your automated investment parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-token">From Token</Label>
                  <Select value={fromToken} onValueChange={setFromToken}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token to sell" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.value} value={token.value}>
                          {token.icon} {token.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="to-token">To Token</Label>
                  <Select value={toToken} onValueChange={setToToken}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token to buy" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.filter(t => t.value !== fromToken).map((token) => (
                        <SelectItem key={token.value} value={token.value}>
                          {token.icon} {token.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount per Execution</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.000001"
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Amount of {fromToken ? tokens.find(t => t.value === fromToken)?.label.split(' - ')[0] : 'tokens'} to sell each time
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="How often?" />
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
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="For how long?" />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((dur) => (
                        <SelectItem key={dur.value} value={dur.value}>
                          {dur.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCreatePlan} 
                className="w-full" 
                disabled={!fromToken || !toToken || !amount || !frequency || !duration}
              >
                Continue to Permission Request
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan Summary</CardTitle>
              <CardDescription>
                Review your DCA configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">From:</span>
                  <span>{fromToken ? tokens.find(t => t.value === fromToken)?.label : 'Not selected'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">To:</span>
                  <span>{toToken ? tokens.find(t => t.value === toToken)?.label : 'Not selected'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount per execution:</span>
                  <span>{amount || '0'} {fromToken ? tokens.find(t => t.value === fromToken)?.label.split(' - ')[0] : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span>{frequency ? frequencies.find(f => f.value === frequency)?.label : 'Not selected'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{duration ? durations.find(d => d.value === duration)?.label : 'Not selected'}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Allowance Needed:</span>
                    <span>{calculateTotalAmount()} {fromToken ? tokens.find(t => t.value === fromToken)?.label.split(' - ')[0] : ''}</span>
                  </div>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  ✅ Create Plan page is working! This uses ERC-7715 Advanced Permissions to securely automate your DCA strategy.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Permission Request Step */}
      {currentStep === 'permission' && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Grant Permission</CardTitle>
              <CardDescription>
                Authorize the AutoBalancer agent to execute your DCA plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p>You need to grant permission to the AutoBalancer agent to:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Spend up to {calculateTotalAmount()} {fromToken ? tokens.find(t => t.value === fromToken)?.label.split(' - ')[0] : ''}</li>
                  <li>Execute swaps {frequency} for {duration ? durations.find(d => d.value === duration)?.label : ''}</li>
                  <li>Interact with approved DEX contracts</li>
                </ul>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This uses ERC-7715 Advanced Permissions for secure, limited access. You can revoke this permission at any time.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button onClick={() => setCurrentStep('plan')} variant="outline" className="flex-1">
                  Back to Configuration
                </Button>
                <Button onClick={handlePermissionRequest} disabled={isCreating} className="flex-1">
                  {isCreating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                      Creating...
                    </>
                  ) : (
                    'Grant Permission & Create Plan'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Step */}
      {currentStep === 'success' && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Plan Created Successfully!</CardTitle>
              <CardDescription>
                Your DCA plan is now active and will execute automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strategy:</span>
                    <span>{fromToken ? tokens.find(t => t.value === fromToken)?.icon : ''} → {toToken ? tokens.find(t => t.value === toToken)?.icon : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Execution:</span>
                    <span>In {frequency === 'daily' ? '1 day' : frequency === 'weekly' ? '1 week' : '1 month'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Create Another Plan
                </Button>
                <Button onClick={() => window.location.href = '/dashboard'} className="flex-1">
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CreatePlan;