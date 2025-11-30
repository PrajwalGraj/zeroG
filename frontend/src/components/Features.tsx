import { Shield, Vault, Rocket, DollarSign } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

export const Features = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Complete DeFi infrastructure
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to trade, earn, and access premium DeFi data
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={Shield}
            title="Photon Integration"
            description="Passwordless authentication powered by Photon SDK"
            accentColor="yellow"
            features={[
              "No wallet downloads required",
              "Email & social login support",
              "Instant onboarding experience",
              "Secure key management"
            ]}
          />
          
          <FeatureCard
            icon={Vault}
            title="Automated Vault"
            description="Smart contract vaults with automated reward distribution"
            accentColor="pink"
            features={[
              "Deposit tokens securely",
              "Earn passive rewards",
              "Transparent fee structure",
              "24/7 automated compounding"
            ]}
          />
          
          <FeatureCard
            icon={Rocket}
            title="Swap & Staking"
            description="Seamless token swaps with integrated staking rewards"
            accentColor="teal"
            features={[
              "Low-fee token swaps",
              "Real-time price quotes",
              "Liquidity pool access",
              "Integrated staking"
            ]}
          />

          <FeatureCard
            icon={DollarSign}
            title="x402 API Marketplace"
            description="Pay-per-use premium DeFi data with blockchain payments"
            accentColor="purple"
            features={[
              "Premium pool analytics",
              "Pay only for what you use",
              "HTTP 402 protocol",
              "Instant data access"
            ]}
          />
        </div>
      </div>
    </section>
  );
};
