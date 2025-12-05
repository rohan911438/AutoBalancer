import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { apiService } from '../services/api';
import type { ApiResponse } from '../services/api';

interface BackendStatus {
  isConnected: boolean;
  status?: string;
  environment?: string;
  timestamp?: string;
  error?: string;
}

export const BackendStatus: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    isConnected: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkBackendConnection = async () => {
    setIsLoading(true);
    try {
      const response: ApiResponse = await apiService.healthCheck();
      setBackendStatus({
        isConnected: true,
        status: response.status,
        environment: response.environment,
        timestamp: response.timestamp
      });
    } catch (error: any) {
      setBackendStatus({
        isConnected: false,
        error: error.message || 'Failed to connect to backend'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testApiEndpoint = async () => {
    setIsLoading(true);
    try {
      const response: ApiResponse = await apiService.testConnection();
      console.log('✅ Backend API test successful:', response);
      alert(`Backend API Test Successful!\n\n${response.message}\nTimestamp: ${response.timestamp}`);
    } catch (error: any) {
      console.error('❌ Backend API test failed:', error);
      alert(`Backend API Test Failed!\n\nError: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkBackendConnection();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Backend Connection
          <Badge variant={backendStatus.isConnected ? 'default' : 'destructive'}>
            {backendStatus.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
        <CardDescription>
          AutoBalancer backend server status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {backendStatus.isConnected ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">{backendStatus.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Environment:</span>
              <span className="font-medium">{backendStatus.environment}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Check:</span>
              <span className="font-medium">
                {backendStatus.timestamp ? 
                  new Date(backendStatus.timestamp).toLocaleTimeString() : 
                  'Just now'
                }
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-destructive">
            {backendStatus.error}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={checkBackendConnection}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            {isLoading ? 'Checking...' : 'Refresh'}
          </Button>
          <Button
            onClick={testApiEndpoint}
            disabled={isLoading || !backendStatus.isConnected}
            size="sm"
            className="flex-1"
          >
            {isLoading ? 'Testing...' : 'Test API'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};