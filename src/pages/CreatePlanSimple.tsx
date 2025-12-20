import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CreatePlan = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create DCA Plan</h1>
        <p className="text-muted-foreground">
          Set up automated Dollar Cost Averaging with MetaMask Advanced Permissions
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create Your DCA Plan</CardTitle>
          <CardDescription>
            Configure your automated investment strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>✅ Create Plan page is now working!</p>
            <p>This is a simplified version to test the component loading.</p>
            <p>The full form will be restored once we confirm this loads properly.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePlan;