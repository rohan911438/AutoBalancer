/**
 * Permission Manager Component
 * 
 * Dashboard component for managing all user permissions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { RefreshCw, Shield, Plus, AlertTriangle } from 'lucide-react';
import { PermissionStatusCard } from './PermissionStatusCard';
import { useWallet } from '../../contexts/WalletContext';
import { PermissionMetadata } from '../../types/permissions';

export const PermissionManager: React.FC = () => {
  const { 
    getUserPermissions, 
    refreshPermissions, 
    revokePermission, 
    isConnected,
    isLoading 
  } = useWallet();
  
  const [permissions, setPermissions] = useState<PermissionMetadata[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadPermissions();
    }
  }, [isConnected]);

  const loadPermissions = () => {
    const userPermissions = getUserPermissions();
    setPermissions(userPermissions);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      refreshPermissions();
      setTimeout(() => {
        loadPermissions();
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
      setIsRefreshing(false);
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    try {
      const success = await revokePermission(permissionId);
      if (success) {
        // Refresh permissions list
        loadPermissions();
      }
    } catch (error) {
      console.error('Failed to revoke permission:', error);
    }
  };

  const getPermissionStats = () => {
    const active = permissions.filter(p => p.status === 'granted').length;
    const expired = permissions.filter(p => p.status === 'expired').length;
    const revoked = permissions.filter(p => p.status === 'revoked').length;
    
    return { active, expired, revoked, total: permissions.length };
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Permission Manager
          </CardTitle>
          <CardDescription>
            Manage your AutoBalancer permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to view and manage permissions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const stats = getPermissionStats();

  return (
    <div className="space-y-6">
      {/* Permission Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Permission Manager
            </CardTitle>
            <CardDescription>
              Manage your AutoBalancer permissions
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
              <div className="text-sm text-muted-foreground">Expired</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.revoked}</div>
              <div className="text-sm text-muted-foreground">Revoked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions List */}
      {permissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Permissions Found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't granted any AutoBalancer permissions yet.
            </p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create DCA Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Permissions</h3>
          {permissions.map((permission) => (
            <PermissionStatusCard
              key={permission.id}
              permission={permission}
              onRevoke={() => handleRevokePermission(permission.id)}
              onRefresh={loadPermissions}
            />
          ))}
        </div>
      )}
    </div>
  );
};