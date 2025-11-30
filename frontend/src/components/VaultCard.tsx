import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Lock, ArrowRight } from "lucide-react";

export interface Vault {
  id: string;
  name: string;
  token: string;
  tvl: number;
  apr: number;
  myStake: number;
  type: "stable" | "concentrated" | "metastable";
  locked?: boolean;
  lockDuration?: string;
}

interface VaultCardProps {
  vault: Vault;
  onEnter: (vault: Vault) => void;
}

const typeColors = {
  stable: "bg-yellow-50 dark:bg-yellow-950/20",
  concentrated: "bg-pink-50 dark:bg-pink-950/20",
  metastable: "bg-teal-50 dark:bg-teal-950/20",
};

const badgeColors = {
  stable: "bg-yellow-200 text-foreground hover:bg-yellow-200",
  concentrated: "bg-pink-200 text-foreground hover:bg-pink-200",
  metastable: "bg-teal-200 text-foreground hover:bg-teal-200",
};

const tokenLogos: Record<string, string> = {
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.png",
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
};

export const VaultCard = ({ vault, onEnter }: VaultCardProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Simple sparkline as SVG
  const sparklinePoints = "0,15 10,12 20,18 30,8 40,14 50,6 60,10 70,4 80,8 90,2 100,5";

  return (
    <div className={`${typeColors[vault.type]} p-6 rounded-2xl border-2 border-border transition-transform hover:-translate-y-1 duration-200 h-full flex flex-col`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center border-2 border-border flex-shrink-0">
            {tokenLogos[vault.token] ? (
              <img 
                src={tokenLogos[vault.token]} 
                alt={vault.token} 
                className="w-8 h-8 object-contain"
              />
            ) : (
              <span className="text-lg font-bold">{vault.token}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base leading-tight mb-1.5">{vault.name}</h4>
            <Badge className={`${badgeColors[vault.type]} text-xs font-medium border-2 border-border`}>
              {vault.type.charAt(0).toUpperCase() + vault.type.slice(1)}
            </Badge>
          </div>
        </div>
        {vault.locked && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs flex-shrink-0 ml-2">
            <Lock className="h-3 w-3" />
            <span className="whitespace-nowrap">{vault.lockDuration}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">TVL</p>
          <p className="font-bold text-sm">{formatNumber(vault.tvl)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">APR</p>
          <p className={`font-bold text-sm ${vault.apr > 15 ? 'text-green-600' : vault.apr > 5 ? 'text-blue-600' : 'text-gray-600'}`}>
            {vault.apr.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">My Stake</p>
          <p className="font-bold text-sm">{formatNumber(vault.myStake)}</p>
        </div>
      </div>

      {/* Mini Sparkline */}
      <div className="mb-4 h-8 w-full flex-grow-0">
        <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={sparklinePoints}
          />
        </svg>
      </div>

      <Button
        onClick={() => onEnter(vault)}
        className="w-full bg-foreground text-background hover:bg-foreground/90 group rounded-full border-2 border-foreground mt-auto"
      >
        <span>Enter Vault</span>
        <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
};
