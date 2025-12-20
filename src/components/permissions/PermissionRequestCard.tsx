/**
 * Permission Request Component
 * 
 * Handles the ERC-7715 permission request flow for DCA plans
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Loader2, Shield, Clock, DollarSign, Calendar } from 'lucide-react';
import { DCAPermissionConfig, PermissionRequestParams } from '../../types/permissions';
import { useWallet } from '../../contexts/WalletContext';

interface PermissionRequestCardProps {
  config: DCAPermissionConfig;
  onSuccess?: (permissionId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const PermissionRequestCard: React.FC<PermissionRequestCardProps> = ({
  config,
  onSuccess,
  onError,
  disabled = false
}) => {
  const { requestPermission, isRequestingPermission, isConnected } = useWallet();
  const [requestStatus, setRequestStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleRequestPermission = async () => {
    if (!isConnected) {
      setErrorMessage('Please connect your wallet first');
      setRequestStatus('error');
      return;
    }

    setRequestStatus('requesting');
    setErrorMessage('');

    try {
      const params: PermissionRequestParams = {
        config,
        description: `DCA permission for ${formatTokenAmount(config.amountPerPeriod)} tokens ${config.period}`
      };

      const result = await requestPermission(params);

      if (result.success) {
        setRequestStatus('success');
        if (onSuccess && result.permissionId) {
          onSuccess(result.permissionId);
        }
      } else {
        setRequestStatus('error');
        setErrorMessage(result.error || 'Permission request failed');
        if (onError) {
          onError(result.error || 'Permission request failed');
        }
      }
    } catch (error) {
      setRequestStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  const formatTokenAmount = (amount: string, decimals: number = 18) => {
    const value = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const whole = value / divisor;
    return whole.toString();
  };

  const formatDuration = () => {
    const days = config.duration / (24 * 60 * 60);
    return `${Math.round(days)} days`;
  };

  const calculateTotalAllowance = () => {
    const periodDuration = config.period === 'daily' ? 24 * 60 * 60 : 
                          config.period === 'weekly' ? 7 * 24 * 60 * 60 : 
                          30 * 24 * 60 * 60; // monthly
    const totalPeriods = Math.ceil(config.duration / periodDuration);
    const totalAllowance = BigInt(config.amountPerPeriod) * BigInt(totalPeriods);
    return formatTokenAmount(totalAllowance.toString());
  };

  const isLoading = isRequestingPermission || requestStatus === 'requesting';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Advanced Permission Required
        </CardTitle>
        <CardDescription>
          Grant permission for automated DCA execution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">Amount per {config.period}</span>
            </div>
            <Badge variant="outline">{formatTokenAmount(config.amountPerPeriod)} tokens</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Total Duration</span>
            </div>
            <Badge variant="outline">{formatDuration()}</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Maximum Allowance</span>
            </div>
            <Badge variant="outline">{calculateTotalAllowance()} tokens</Badge>
          </div>
        </div>

        {/* Permission Details */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This permission allows the AutoBalancer agent to spend up to{' '}
            <strong>{formatTokenAmount(config.amountPerPeriod)} tokens {config.period}</strong>{' '}
            from your wallet for DCA execution. The permission will automatically expire after{' '}
            <strong>{formatDuration()}</strong> and can be revoked at any time.
          </AlertDescription>
        </Alert>

        {/* Error Display */}
        {requestStatus === 'error' && errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {requestStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              ✅ Permission granted successfully! Your DCA plan can now execute automatically.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <Button
          onClick={handleRequestPermission}
          disabled={disabled || !isConnected || isLoading || requestStatus === 'success'}
          className="w-full"
          size="lg"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {requestStatus === 'success' 
            ? 'Permission Granted'
            : isLoading 
              ? 'Requesting Permission...'
              : 'Grant Permission'
          }
        </Button>

        {!isConnected && (
          <p className="text-sm text-muted-foreground text-center">
            Connect your wallet to request permission
          </p>
        )}
      </CardContent>
    </Card>
  );
};