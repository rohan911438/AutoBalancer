/**
 * Permission Status Display Component
 * 
 * Shows the current status and details of an ERC-7715 permission
 */

import React from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { AlertTriangle, Check, Clock, XCircle, Shield, Info } from 'lucide-react';
import { PermissionMetadata, PermissionStatus } from '../../types/permissions';
import { useWallet } from '../../contexts/WalletContext';

interface PermissionStatusCardProps {
  permission: PermissionMetadata;
  onRevoke?: () => void;
  onRefresh?: () => void;
  showActions?: boolean;
}

export const PermissionStatusCard: React.FC<PermissionStatusCardProps> = ({
  permission,
  onRevoke,
  onRefresh,
  showActions = true
}) => {
  const { checkPermissionStatus } = useWallet();
  const currentStatus = checkPermissionStatus(permission.id);

  const getStatusIcon = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return <Check className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4" />;
      case 'revoked':
      case 'denied':
        return <XCircle className="w-4 h-4" />;
      case 'exhausted':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'destructive';
      case 'revoked':
      case 'denied':
        return 'destructive';
      case 'exhausted':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const calculateProgress = () => {
    const spent = BigInt(permission.spentAmount);
    const total = BigInt(permission.totalAllowance);
    if (total === BigInt(0)) return 0;
    return Number((spent * BigInt(100)) / total);
  };

  const formatTokenAmount = (amount: string, decimals: number = 18) => {
    const value = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const whole = value / divisor;
    const fraction = value % divisor;
    const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 6);
    return `${whole.toString()}.${fractionStr}`;
  };

  const formatTimeRemaining = () => {
    const now = Date.now();
    const endTime = permission.endTime * 1000;
    
    if (endTime <= now) {
      return 'Expired';
    }
    
    const timeLeft = endTime - now;
    const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h remaining`;
    } else {
      return 'Less than 1h remaining';
    }
  };

  const progress = calculateProgress();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            DCA Permission
          </div>
          <Badge variant={getStatusColor(currentStatus)} className="flex items-center gap-1">
            {getStatusIcon(currentStatus)}
            {(currentStatus as string).charAt(0).toUpperCase() + (currentStatus as string).slice(1)}
          </Badge>
        </CardTitle>
        <CardDescription>
          Permission ID: {permission.id.slice(0, 8)}...{permission.id.slice(-8)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Allowance Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Allowance Used</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Spent: {formatTokenAmount(permission.spentAmount)}</span>
            <span>Total: {formatTokenAmount(permission.totalAllowance)}</span>
          </div>
        </div>

        {/* Permission Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Max per Period:</span>
            <div className="text-muted-foreground">
              {formatTokenAmount(permission.maxPerPeriod)} tokens
            </div>
          </div>
          <div>
            <span className="font-medium">Time Remaining:</span>
            <div className="text-muted-foreground">
              {formatTimeRemaining()}
            </div>
          </div>
          <div>
            <span className="font-medium">Token:</span>
            <div className="text-muted-foreground font-mono">
              {permission.tokenAddress.slice(0, 6)}...{permission.tokenAddress.slice(-4)}
            </div>
          </div>
          <div>
            <span className="font-medium">Agent:</span>
            <div className="text-muted-foreground font-mono">
              {permission.agentAddress.slice(0, 6)}...{permission.agentAddress.slice(-4)}
            </div>
          </div>
        </div>

        {/* Last Usage */}
        {permission.lastUsedAt && (
          <div className="text-sm">
            <span className="font-medium">Last Used:</span>
            <div className="text-muted-foreground">
              {new Date(permission.lastUsedAt).toLocaleString()}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {(currentStatus as string) === 'granted' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onRevoke}
                disabled={!onRevoke}
              >
                Revoke Permission
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={!onRefresh}
            >
              Refresh
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};