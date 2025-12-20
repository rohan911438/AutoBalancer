import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, Settings as SettingsIcon, Bell, User, ExternalLink } from 'lucide-react';
import { PermissionManager } from '@/components/permissions/PermissionManager';
import { BackendStatus } from '@/components/BackendStatus';

export const Settings = () => {
  const { toast } = useToast();

  const handleNotificationToggle = (setting: string, enabled: boolean) => {
    toast({
      title: enabled ? "Notification Enabled" : "Notification Disabled",
      description: `${setting} notifications have been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your AutoBalancer account and permissions</p>
      </div>

      <Tabs defaultValue="permissions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-6">
          <PermissionManager />
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your AutoBalancer preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-execution</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow AutoBalancer to execute trades automatically
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enabled
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Slippage Tolerance</h4>
                  <p className="text-sm text-muted-foreground">
                    Maximum slippage allowed for trades
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  5%
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Gas Priority</h4>
                  <p className="text-sm text-muted-foreground">
                    Preferred gas fee level for transactions
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Standard
                </Button>
              </div>
            </CardContent>
          </Card>

          <BackendStatus />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which events you'd like to be notified about
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">DCA Execution</h4>
                  <p className="text-sm text-muted-foreground">
                    Get notified when DCA trades are executed
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleNotificationToggle('DCA Execution', true)}
                >
                  Enabled
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Permission Expiry</h4>
                  <p className="text-sm text-muted-foreground">
                    Get reminded when permissions are about to expire
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleNotificationToggle('Permission Expiry', true)}
                >
                  Enabled
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Error Alerts</h4>
                  <p className="text-sm text-muted-foreground">
                    Get notified when trades fail or encounter issues
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleNotificationToggle('Error Alerts', true)}
                >
                  Enabled
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Weekly Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly performance reports
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleNotificationToggle('Weekly Summary', false)}
                >
                  Disabled
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your AutoBalancer account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Connected Wallet</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  Connect your MetaMask wallet to view account details
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Member Since</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Etherscan
                  </Button>
                  <Button variant="outline" size="sm">
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
