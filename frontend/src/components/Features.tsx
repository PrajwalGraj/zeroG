import { Shield, Vault, Rocket } from "lucide-react";
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
            Everything you need to launch and manage tokens, from onboarding to trading
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            title="Fair Launch & Trading"
            description="Anti-whale token launches with built-in liquidity protection"
            accentColor="teal"
            features={[
              "Create tokens in minutes",
              "Fair launch mechanisms",
              "Liquidity lock guarantees",
              "Integrated swap & staking"
            ]}
          />
        </div>
      </div>
    </section>
  );
};
