import { useState, useEffect } from 'react';
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
// import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Shield, Zap, Info, Wallet, CheckCircle2, AlertTriangle } from 'lucide-react';
// import { useWallet } from '@/contexts/WalletContext';
// import { PermissionRequestCard } from '@/components/permissions/PermissionRequestCard';
// import { PermissionStatusCard } from '@/components/permissions/PermissionStatusCard';
import { DCAPermissionConfig } from '@/types/permissions';

// Token addresses (mainnet - update for your target network)
const tokenAddresses = {
  eth: '0x0000000000000000000000000000000000000000', // ETH
  weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  usdc: '0xA0b86a33E6441E67f8e1f4a6D2A4cb7C3d4b2b8D', // USDC
  usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  btc: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  link: '0x514910771af9ca656af840dff83e8264ecf986ca', // LINK
};

// Agent contract address
const AGENT_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'; // TODO: Update with actual deployed address

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

type StepType = 'configure' | 'permission' | 'complete';

export const CreatePlan = () => {
  const { toast } = useToast();
  const { 
    isConnected, 
    rawAddress, 
    getUserPermissions, 
    checkPermissionStatus 
  } = useWallet();

  // Form state
  const [formData, setFormData] = useState({
    spendToken: 'usdc',
    buyToken: 'weth',
    amount: '',
    frequency: 'weekly',
    duration: '6m',
  });

  // Flow state
  const [currentStep, setCurrentStep] = useState<StepType>('configure');
  const [permissionId, setPermissionId] = useState<string | null>(null);
  const [existingPermission, setExistingPermission] = useState<any>(null);

  // Check for existing permissions
  useEffect(() => {
    if (isConnected && rawAddress && formData.spendToken) {
      const userPermissions = getUserPermissions();
      const tokenAddress = tokens.find(t => t.value === formData.spendToken)?.address;
      
      if (tokenAddress) {
        const existing = userPermissions.find(p => 
          p.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() &&
          p.status === 'granted'
        );
        setExistingPermission(existing || null);
      }
    }
  }, [isConnected, rawAddress, formData.spendToken, getUserPermissions]);

  // Form validation
  const isFormValid = formData.spendToken && 
                     formData.buyToken && 
                     formData.amount && 
                     formData.frequency && 
                     formData.duration &&
                     formData.spendToken !== formData.buyToken &&
                     parseFloat(formData.amount) > 0;

  // Calculate monthly estimate
  const calculateMonthlyAmount = (): number => {
    if (!formData.amount || !formData.frequency) return 0;
    
    const amount = parseFloat(formData.amount);
    const multiplier = formData.frequency === 'daily' ? 30 : 
                      formData.frequency === 'weekly' ? 4 : 1;
    
    return amount * multiplier;
  };

  // Convert duration to seconds
  const convertDurationToSeconds = (duration: string): number => {
    const value = parseInt(duration.slice(0, -1));
    const unit = duration.slice(-1);
    
    switch (unit) {
      case 'm': return value * 30 * 24 * 60 * 60; // months to seconds
      case 'y': return value * 365 * 24 * 60 * 60; // years to seconds
      default: return value * 30 * 24 * 60 * 60; // default to months
    }
  };

  // Build permission configuration
  const buildPermissionConfig = (): DCAPermissionConfig | null => {
    if (!isFormValid || !rawAddress) return null;

    const spendTokenData = tokens.find(t => t.value === formData.spendToken);
    const buyTokenData = tokens.find(t => t.value === formData.buyToken);

    if (!spendTokenData || !buyTokenData) return null;

    // Convert amount to wei (smallest unit)
    const amountInWei = (parseFloat(formData.amount) * Math.pow(10, spendTokenData.decimals)).toString();
    const durationInSeconds = convertDurationToSeconds(formData.duration);
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + durationInSeconds;

    return {
      userAddress: rawAddress,
      agentAddress: AGENT_CONTRACT_ADDRESS,
      tokenFrom: spendTokenData.address,
      tokenTo: buyTokenData.address,
      amountPerPeriod: amountInWei,
      period: formData.frequency as 'daily' | 'weekly' | 'monthly',
      duration: durationInSeconds,
      startTime,
      endTime,
    };
  };

  // Handle form submission
  const handleConfigureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!isFormValid) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('permission');
  };

  // Handle permission success
  const handlePermissionSuccess = (newPermissionId: string) => {
    setPermissionId(newPermissionId);
    setCurrentStep('complete');
    
    toast({
      title: "Permission Granted!",
      description: "Your DCA plan has been created and is ready for execution.",
    });
  };

  // Handle permission error
  const handlePermissionError = (error: string) => {
    toast({
      title: "Permission Failed",
      description: error,
      variant: "destructive",
    });
  };

  // Handle form submission
  const handleConfigureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!isFormValid) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('permission');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Create DCA Plan</h1>
        <p className="text-muted-foreground">Set up automated recurring purchases with MetaMask Advanced Permissions</p>
      </div>

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${currentStep === 'configure' ? 'text-primary' : currentStep === 'permission' || currentStep === 'complete' ? 'text-green-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'configure' ? 'border-primary bg-primary text-primary-foreground' : currentStep === 'permission' || currentStep === 'complete' ? 'border-green-600 bg-green-600 text-white' : 'border-muted-foreground'}`}>
              {currentStep === 'permission' || currentStep === 'complete' ? '✓' : '1'}
            </div>
            <span className="font-medium">Configure Plan</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className={`flex items-center space-x-2 ${currentStep === 'permission' ? 'text-primary' : currentStep === 'complete' ? 'text-green-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'permission' ? 'border-primary bg-primary text-primary-foreground' : currentStep === 'complete' ? 'border-green-600 bg-green-600 text-white' : 'border-muted-foreground'}`}>
              {currentStep === 'complete' ? '✓' : '2'}
            </div>
            <span className="font-medium">Grant Permission</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className={`flex items-center space-x-2 ${currentStep === 'complete' ? 'text-green-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'complete' ? 'border-green-600 bg-green-600 text-white' : 'border-muted-foreground'}`}>
              {currentStep === 'complete' ? '✓' : '3'}
            </div>
            <span className="font-medium">Complete</span>
          </div>
        </div>
      </div>

      {/* Wallet Connection Check */}
      {!isConnected && (
        <Alert className="mb-6">
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to create a DCA plan and grant permissions.
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Configure Plan */}
      {currentStep === 'configure' && (
        <div className="grid md:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Plan Configuration
                </CardTitle>
                <CardDescription>
                  Configure your Dollar Cost Averaging plan parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConfigureSubmit} className="space-y-6">
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
                            <SelectItem key={token.value} value={token.value} disabled={token.value === formData.spendToken}>
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
                      <Label>Amount per Period</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="bg-secondary"
                        step="0.01"
                        min="0.01"
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
                      <Label>Duration</Label>
                      <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.spendToken === formData.buyToken && formData.spendToken && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You cannot use the same token for spending and buying.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg" 
                    disabled={!isFormValid || !isConnected}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continue to Permission Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Plan Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spending</span>
                    <span className="font-medium">
                      {formData.spendToken ? tokens.find(t => t.value === formData.spendToken)?.label.split(' - ')[0] : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buying</span>
                    <span className="font-medium">
                      {formData.buyToken ? tokens.find(t => t.value === formData.buyToken)?.label.split(' - ')[0] : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">{formData.amount || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="font-medium capitalize">
                      {formData.frequency ? frequencies.find(f => f.value === formData.frequency)?.label : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {formData.duration ? durations.find(d => d.value === formData.duration)?.label : '-'}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between font-semibold">
                      <span>Est. Monthly</span>
                      <span className="text-primary">
                        {calculateMonthlyAmount().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permission Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  ERC-7715 Permission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This plan will request a limited permission to execute trades on your behalf. You maintain full control and can revoke anytime.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Spending limit enforced
                  </li>
                  <li className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Time-bound execution
                  </li>
                  <li className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Revocable anytime
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Permission Request */}
      {currentStep === 'permission' && (
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            {buildPermissionConfig() && (
              <PermissionRequestCard
                config={buildPermissionConfig()!}
                onSuccess={handlePermissionSuccess}
                onError={handlePermissionError}
              />
            )}
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('configure')}
                className="w-full"
              >
                Back to Configuration
              </Button>
            </div>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spending</span>
                  <span className="font-medium">
                    {tokens.find(t => t.value === formData.spendToken)?.label.split(' - ')[0]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buying</span>
                  <span className="font-medium">
                    {tokens.find(t => t.value === formData.buyToken)?.label.split(' - ')[0]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{formData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequency</span>
                  <span className="font-medium">
                    {frequencies.find(f => f.value === formData.frequency)?.label}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {currentStep === 'complete' && permissionId && (
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  DCA Plan Created Successfully!
                </CardTitle>
                <CardDescription>
                  Your automated DCA plan is now active and ready for execution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Permission granted! Your DCA plan will automatically execute according to your specified schedule.
                    You can monitor and manage this permission from your dashboard.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setCurrentStep('configure');
                      setPermissionId(null);
                      setFormData({
                        spendToken: 'usdc',
                        buyToken: 'weth',
                        amount: '',
                        frequency: 'weekly',
                        duration: '6m',
                      });
                    }}
                  >
                    Create Another Plan
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            {getUserPermissions().find(p => p.id === permissionId) && (
              <PermissionStatusCard
                permission={getUserPermissions().find(p => p.id === permissionId)!}
                showActions={false}
              />
            )}
          </div>
        </div>
      )}

      {/* Existing Permission Notice */}
      {existingPermission && currentStep === 'configure' && (
        <Alert className="mt-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            You already have an active permission for {tokens.find(t => t.address === existingPermission.tokenAddress)?.label}.
            You can create additional plans using the same permission or create a new one.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CreatePlan;
