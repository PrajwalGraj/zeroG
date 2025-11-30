import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroWorkflow from "@/assets/hero-workflow.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import Image from "next/image";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20">
      {/* Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${heroBg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-1 border-2 border-border bg-background/80 backdrop-blur-sm">
              <span className="text-sm font-mono">Passwordless • Fair • Secure</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Trade DeFi
              <br />
              the <span className="italic">right</span> way
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Complete DeFi infrastructure: passwordless onboarding, automated vaults, 
              secure swaps, and liquidity mining. Built for simplicity and security.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="border-2 shadow-lg text-lg px-8 group"
                asChild
              >
                <Link href="/signin">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 shadow-md text-lg px-8"
                asChild
              >
                <Link href="/signin">Launch App</Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Liquidity lock</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Fair distribution</span>
              </div>
            </div>
          </div>

          {/* Right Column: Workflow Diagram */}
          <div className="relative">
            <div className="relative border-2 border-border bg-background/90 backdrop-blur-sm p-8 shadow-2xl">
              <Image 
                src={heroWorkflow} 
                alt="ZeroG workflow: Photon Integration → Automated Vault → Fair Token Launch → Swap/Staking"
                className="w-full h-auto"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[hsl(var(--pastel-yellow))] border-2 border-border -z-10" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[hsl(var(--pastel-teal))] border-2 border-border -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};
