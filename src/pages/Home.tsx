import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { Wallet, Zap, Shield, Clock, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Automated DCA',
    description: 'Set up recurring purchases that execute automatically without manual intervention.'
  },
  {
    icon: Shield,
    title: 'Secure Permissions',
    description: 'Grant limited permissions using ERC-7715, keeping full control of your assets.'
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Choose daily, weekly, or custom intervals for your investment strategy.'
  }
];

const steps = [
  'Connect your MetaMask wallet',
  'Create a DCA plan with your preferences',
  'Grant permission using ERC-7715',
  'Sit back while AutoBalancer handles the rest'
];

export const Home = () => {
  const { isConnected, connectWallet } = useWallet();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-7rem)]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by MetaMask ERC-7715</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight">
            Automate Your Crypto
            <span className="block gradient-text">Investment Strategy</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Set up automated DCA plans and portfolio rebalancing with advanced MetaMask permissions. 
            Your keys, your control, fully automated.
          </p>

          <div className="flex items-center justify-center gap-4">
            {isConnected ? (
              <Button variant="gradient" size="xl" onClick={() => navigate('/create-plan')}>
                Create a DCA Plan
                <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="gradient" size="xl" onClick={connectWallet}>
                <Wallet className="h-5 w-5" />
                Connect Wallet to Start
              </Button>
            )}
            <Button variant="outline" size="xl" onClick={() => navigate('/dashboard')}>
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="glass-card p-8 group hover:border-primary/50 transition-all duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="glass-card p-10">
          <h2 className="text-3xl font-display font-bold mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-primary to-transparent" />
                  )}
                </div>
                <p className="text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {isConnected && (
        <section className="py-16">
          <div className="gradient-border p-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 text-success">
              <CheckCircle className="h-6 w-6" />
              <span className="font-medium">Wallet Connected</span>
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">Ready to Automate?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Your wallet is connected. Create your first DCA plan and let AutoBalancer handle your investment strategy.
            </p>
            <Button variant="gradient" size="lg" onClick={() => navigate('/create-plan')}>
              Create Your First Plan
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
