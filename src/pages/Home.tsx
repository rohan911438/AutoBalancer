import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { BackendStatus } from '@/components/BackendStatus';
import { Wallet, Zap, Shield, Clock, ArrowRight, CheckCircle, TrendingUp, BarChart3, DollarSign, Users, Star, Github, Twitter } from 'lucide-react';
import { useState, useEffect } from 'react';

const features = [
  {
    icon: Zap,
    title: 'Automated DCA',
    description: 'Set up recurring purchases that execute automatically without manual intervention.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Shield,
    title: 'Secure Permissions',
    description: 'Grant limited permissions using ERC-7715, keeping full control of your assets.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Choose daily, weekly, or custom intervals for your investment strategy.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: TrendingUp,
    title: 'Portfolio Rebalancing',
    description: 'Automatically maintain your target allocation across different cryptocurrencies.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track your performance with detailed charts and investment insights.',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: DollarSign,
    title: 'Cost Optimization',
    description: 'Minimize fees with smart transaction batching and gas optimization.',
    color: 'from-green-500 to-teal-500'
  }
];

const steps = [
  {
    title: 'Connect your MetaMask wallet',
    description: 'Securely connect your MetaMask wallet to get started with AutoBalancer.',
    icon: Wallet
  },
  {
    title: 'Create a DCA plan',
    description: 'Set up your investment preferences, amounts, and scheduling.',
    icon: Clock
  },
  {
    title: 'Grant permission using ERC-7715',
    description: 'Authorize AutoBalancer with limited permissions for automated trading.',
    icon: Shield
  },
  {
    title: 'Relax and watch it work',
    description: 'Sit back while AutoBalancer handles your investment strategy automatically.',
    icon: TrendingUp
  }
];

const stats = [
  { label: 'Total Value Locked', value: '$2.4M+', icon: DollarSign },
  { label: 'Active Users', value: '1,200+', icon: Users },
  { label: 'Success Rate', value: '99.8%', icon: Star },
  { label: 'Transactions', value: '15,000+', icon: BarChart3 }
];

const testimonials = [
  {
    quote: "AutoBalancer has completely transformed my crypto investment strategy. Set it and forget it!",
    author: "Sarah Chen",
    role: "DeFi Investor"
  },
  {
    quote: "The ERC-7715 integration gives me peace of mind knowing I maintain full control of my assets.",
    author: "Michael Rodriguez",
    role: "Crypto Trader"
  },
  {
    quote: "Finally, a DCA solution that actually works reliably. The automation is flawless.",
    author: "Alex Kumar",
    role: "Portfolio Manager"
  }
];

export const Home = () => {
  const { isConnected, connectWallet } = useWallet();
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/10 blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-fade-in">
            <Zap className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Powered by MetaMask ERC-7715</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Automate Your Crypto
            <span className="block gradient-text animate-gradient">Investment Strategy</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Set up automated DCA plans and portfolio rebalancing with advanced MetaMask permissions. 
            Your keys, your control, fully automated.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {isConnected ? (
              <>
                <Button variant="gradient" size="xl" onClick={() => navigate('/dashboard')} className="transform hover:scale-105 transition-all duration-300">
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="xl" onClick={() => navigate('/create-plan')} className="transform hover:scale-105 transition-all duration-300">
                  Create DCA Plan
                </Button>
              </>
            ) : (
              <>
                <Button variant="gradient" size="xl" onClick={connectWallet} className="transform hover:scale-105 transition-all duration-300">
                  <Wallet className="h-5 w-5" />
                  Connect Wallet to Start
                </Button>
                <Button variant="outline" size="xl" className="transform hover:scale-105 transition-all duration-300">
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-display font-bold mb-2 gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to automate your crypto investment strategy with confidence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title} 
                className="glass-card p-8 group hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-4 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with AutoBalancer in just four simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="glass-card p-8 text-center group hover:border-primary/50 transition-all duration-500">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-2xl group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-primary/20">
                        <step.icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-4 group-hover:text-primary transition-colors duration-300">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                    <ArrowRight className="h-6 w-6 text-primary/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-display font-bold mb-16 animate-fade-in-up">What Our Users Say</h2>
          
          <div className="relative h-64 overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ${
                  index === currentTestimonial ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                }`}
              >
                <div className="glass-card p-8 max-w-2xl mx-auto">
                  <p className="text-xl italic mb-6 text-foreground">"_{testimonial.quote}_"</p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-8 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-primary' : 'bg-primary/20'
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {isConnected ? (
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="gradient-border p-12 text-center animate-fade-in-up">
              <div className="flex items-center justify-center gap-2 mb-6 text-success">
                <CheckCircle className="h-8 w-8 animate-pulse" />
                <span className="font-semibold text-lg">Wallet Connected Successfully!</span>
              </div>
              <h2 className="text-4xl font-display font-bold mb-6">Ready to Automate?</h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Your wallet is connected. Create your first DCA plan and let AutoBalancer handle your investment strategy automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gradient" size="xl" onClick={() => navigate('/dashboard')} className="transform hover:scale-105 transition-all duration-300">
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="xl" onClick={() => navigate('/create-plan')} className="transform hover:scale-105 transition-all duration-300">
                  Create First Plan
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 px-6 bg-gradient-to-b from-background to-card/50">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Start Your Journey Today</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of users who trust AutoBalancer with their crypto investment automation.
            </p>
            <Button variant="gradient" size="xl" onClick={connectWallet} className="transform hover:scale-105 transition-all duration-300">
              <Wallet className="h-5 w-5" />
              Connect Wallet & Get Started
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold gradient-text">AutoBalancer</span>
            </div>
            
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm">
                <Github className="h-4 w-4" />
                GitHub
              </Button>
              <Button variant="ghost" size="sm">
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 AutoBalancer. Built with ❤️ for the DeFi community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
