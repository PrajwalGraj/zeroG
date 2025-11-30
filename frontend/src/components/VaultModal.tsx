"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, AlertCircle, ChevronRight, Wallet } from "lucide-react";
import { Vault } from "./VaultCard";
import { Pool } from "./PoolsTable";
import { toast } from "@/hooks/use-toast";
import { usePhoton } from "@/hooks/usePhoton";

const tokenLogos: Record<string, string> = {
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.png",
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  WBTC: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
  APT: "https://cryptologos.cc/logos/aptos-apt-logo.png",
};

interface VaultModalProps {
  vault: Vault | null;
  isOpen: boolean;
  onClose: () => void;
  associatedPools?: Pool[];
}

export const VaultModal = ({
  vault,
  isOpen,
  onClose,
  associatedPools = [],
}: VaultModalProps) => {
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const { track } = usePhoton();

  if (!vault) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const estimatedShare = depositAmount
    ? ((parseFloat(depositAmount) / (vault.tvl + parseFloat(depositAmount))) * 100).toFixed(4)
    : "0.0000";

  const estimatedRewards = depositAmount
    ? ((parseFloat(depositAmount) * vault.apr) / 100).toFixed(2)
    : "0.00";

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      });
      return;
    }

    setIsDepositing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Track vault deposit with Photon
    try {
      await track('vault_deposit', {
        vault_id: vault.id,
        vault_name: vault.name,
        vault_type: vault.type,
        token: vault.token,
        amount: depositAmount,
        estimated_rewards: estimatedRewards,
        apr: vault.apr.toString(),
      });
    } catch (error) {
      console.log('Vault deposit tracking skipped');
    }

    toast({
      title: "Deposit Successful!",
      description: `You deposited ${depositAmount} ${vault.token} into ${vault.name}.`,
    });

    setIsDepositing(false);
    setDepositAmount("");
    onClose();
  };

  const badgeColors: Record<string, string> = {
    stable: "bg-yellow-200 text-foreground border-2 border-border",
    concentrated: "bg-pink-200 text-foreground border-2 border-border",
    metastable: "bg-teal-200 text-foreground border-2 border-border",
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md border-l-2 border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border-2 border-border">
              {tokenLogos[vault.token] ? (
                <img 
                  src={tokenLogos[vault.token]} 
                  alt={vault.token} 
                  className="w-7 h-7 object-contain"
                />
              ) : (
                <span className="font-bold text-sm">{vault.token}</span>
              )}
            </div>
            <span className="text-base">{vault.name}</span>
          </SheetTitle>
          <SheetDescription>
            <Badge className={badgeColors[vault.type]}>
              {vault.type.charAt(0).toUpperCase() + vault.type.slice(1)}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Vault Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border-2 border-border bg-muted/30">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Value Locked</p>
              <p className="font-bold text-lg">{formatNumber(vault.tvl)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">APR</p>
              <p className={`font-bold text-lg ${vault.apr > 15 ? 'text-green-600' : vault.apr > 5 ? 'text-blue-600' : 'text-gray-600'}`}>
                {vault.apr.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Your Stake</p>
              <p className="font-bold text-lg">{formatNumber(vault.myStake)}</p>
            </div>
            {vault.locked && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lock Duration</p>
                <p className="font-bold text-lg flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  {vault.lockDuration}
                </p>
              </div>
            )}
          </div>

          {/* Lock Warning */}
          {vault.locked && (
            <div className="flex items-start gap-2 p-3 rounded-lg border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Locked Vault</p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Funds will be locked for {vault.lockDuration} after deposit.
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Deposit Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="deposit-amount" className="text-sm font-medium">
                Deposit Amount
              </Label>
              <div className="mt-2 relative">
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="pr-16 rounded-full border-2 border-border"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  {vault.token}
                </span>
              </div>
            </div>

            {depositAmount && parseFloat(depositAmount) > 0 && (
              <div className="p-4 rounded-xl border-2 border-border bg-muted/30 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Pool Share</span>
                  <span className="font-medium">{estimatedShare}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Annual Rewards</span>
                  <span className="font-medium text-green-600">
                    +${estimatedRewards}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleDeposit}
              disabled={isDepositing || !depositAmount || parseFloat(depositAmount) <= 0}
              className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full border-2 border-foreground"
            >
              {isDepositing ? "Depositing..." : "Deposit"}
            </Button>
          </div>

          <Separator />

          {/* Associated Pools */}
          {associatedPools.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Associated Pools
              </h4>
              <div className="space-y-2">
                {associatedPools.map((pool) => (
                  <div
                    key={pool.id}
                    className="flex items-center justify-between p-3 rounded-lg border-2 border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{pool.pair}</p>
                      <p className="text-xs text-muted-foreground">
                        TVL: {formatNumber(pool.tvl)} • APR: {pool.apr.toFixed(2)}%
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
