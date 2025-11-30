"use client";

import { useState } from "react";
import Link from "next/link";
import { MyPositions } from "@/components/MyPositions";
import { VaultCard, Vault } from "@/components/VaultCard";
import { PoolsTable, Pool } from "@/components/PoolsTable";
import { VaultModal } from "@/components/VaultModal";
import { Button } from "@/components/ui/button";
import { Plus, ArrowDownToLine, ArrowUpFromLine, LayoutGrid } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePhoton } from "@/hooks/usePhoton";
import { useWalletContext } from "../wallet-provider";
import signinBg from "@/assets/signin-bg.jpg";

// Sample data
const sampleVaults: Vault[] = [
  {
    id: "1",
    name: "Automated Vault — Stable USDC Pool",
    token: "USDC",
    tvl: 12500000,
    apr: 18.5,
    myStake: 5000,
    type: "stable",
    locked: true,
    lockDuration: "7 days",
  },
  {
    id: "2",
    name: "Concentrated ETH-USDT",
    token: "ETH",
    tvl: 8750000,
    apr: 24.2,
    myStake: 2500,
    type: "concentrated",
  },
  {
    id: "3",
    name: "Metastable SOL Yield",
    token: "SOL",
    tvl: 4200000,
    apr: 12.8,
    myStake: 0,
    type: "metastable",
    locked: true,
    lockDuration: "14 days",
  },
];

const samplePools: Pool[] = [
  { id: "1", pair: "USDC/USDT", token1: "USDC", token2: "USDT", tvl: 45000000, volume24h: 12000000, utilization: 78.5, apr: 8.2, type: "stable", feeTier: 0.01 },
  { id: "2", pair: "ETH/USDC", token1: "ETH", token2: "USDC", tvl: 32000000, volume24h: 8500000, utilization: 65.2, apr: 15.8, type: "concentrated", feeTier: 0.05 },
  { id: "3", pair: "SOL/USDC", token1: "SOL", token2: "USDC", tvl: 18000000, volume24h: 5200000, utilization: 82.1, apr: 22.4, type: "concentrated", feeTier: 0.05 },
  { id: "4", pair: "BTC/ETH", token1: "BTC", token2: "ETH", tvl: 28000000, volume24h: 7800000, utilization: 45.6, apr: 12.1, type: "metastable", feeTier: 0.03 },
  { id: "5", pair: "AVAX/USDC", token1: "AVAX", token2: "USDC", tvl: 9500000, volume24h: 2100000, utilization: 58.9, apr: 18.5, type: "concentrated", feeTier: 0.05 },
  { id: "6", pair: "DAI/USDC", token1: "DAI", token2: "USDC", tvl: 52000000, volume24h: 15000000, utilization: 91.2, apr: 6.8, type: "stable", feeTier: 0.01 },
  { id: "7", pair: "MATIC/ETH", token1: "MATIC", token2: "ETH", tvl: 7200000, volume24h: 1800000, utilization: 42.3, apr: 28.9, type: "concentrated", feeTier: 0.05 },
  { id: "8", pair: "LINK/ETH", token1: "LINK", token2: "ETH", tvl: 5800000, volume24h: 1200000, utilization: 35.7, apr: 19.2, type: "metastable", feeTier: 0.03 },
  { id: "9", pair: "UNI/USDC", token1: "UNI", token2: "USDC", tvl: 4100000, volume24h: 980000, utilization: 28.4, apr: 14.6, type: "concentrated", feeTier: 0.05 },
  { id: "10", pair: "AAVE/ETH", token1: "AAVE", token2: "ETH", tvl: 3500000, volume24h: 750000, utilization: 52.1, apr: 16.3, type: "metastable", feeTier: 0.03 },
  { id: "11", pair: "CRV/USDC", token1: "CRV", token2: "USDC", tvl: 2800000, volume24h: 620000, utilization: 68.9, apr: 32.1, type: "concentrated", feeTier: 0.05 },
  { id: "12", pair: "FRAX/USDC", token1: "FRAX", token2: "USDC", tvl: 38000000, volume24h: 9200000, utilization: 88.4, apr: 5.9, type: "stable", feeTier: 0.01 },
];

export default function VaultPage() {
  const { walletAddress: petraWallet, aptBalance } = useWalletContext();
  const { walletAddress: photonWallet, photonToken, track } = usePhoton();
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [showPools, setShowPools] = useState(false);
  
  const isConnected = !!petraWallet || !!photonWallet;
  const displayAddress = petraWallet || photonWallet;

  // Calculate totals from sample vaults
  const totalValue = sampleVaults.reduce((acc, vault) => acc + vault.myStake, 0);
  const totalYield = sampleVaults.reduce((acc, vault) => acc + (vault.myStake * vault.apr / 100), 0);
  const activePositions = sampleVaults.filter(vault => vault.myStake > 0).length;

  const handleEnterVault = async (vault: Vault) => {
    setSelectedVault(vault);
    
    // Track vault view event
    try {
      await track('vault_view', {
        vault_id: vault.id,
        vault_name: vault.name,
        vault_type: vault.type,
        tvl: vault.tvl.toString(),
        apr: vault.apr.toString(),
      });
    } catch (error) {
      console.log('Vault view tracking skipped');
    }
  };

  const handleAddLiquidity = async (pool: Pool) => {
    try {
      await track('liquidity_add_click', {
        pool_id: pool.id,
        pool_pair: pool.pair,
        pool_type: pool.type,
        tvl: pool.tvl.toString(),
        apr: pool.apr.toString(),
      });
    } catch (error) {
      console.log('Liquidity add tracking skipped');
    }
    
    toast({
      title: "Add Liquidity",
      description: `Opening liquidity form for ${pool.pair}...`,
    });
  };

  const handleViewPool = async (pool: Pool) => {
    try {
      await track('pool_view', {
        pool_id: pool.id,
        pool_pair: pool.pair,
        pool_type: pool.type,
      });
    } catch (error) {
      console.log('Pool view tracking skipped');
    }
    
    toast({
      title: "Pool Details",
      description: `Viewing details for ${pool.pair}`,
    });
  };

  const quickActions = [
    { 
      label: "Create Vault", 
      icon: Plus, 
      onClick: async () => {
        try {
          await track('vault_create_click', {});
        } catch (error) {
          console.log('Vault create tracking skipped');
        }
        toast({ title: "Create Vault", description: "Opening vault creation wizard..." });
      }
    },
    { 
      label: "Deposit", 
      icon: ArrowDownToLine, 
      onClick: async () => {
        try {
          await track('deposit_click', {});
        } catch (error) {
          console.log('Deposit tracking skipped');
        }
        toast({ title: "Deposit", description: "Select a vault to deposit into." });
      }
    },
    { 
      label: "Withdraw", 
      icon: ArrowUpFromLine, 
      onClick: async () => {
        try {
          await track('withdraw_click', {});
        } catch (error) {
          console.log('Withdraw tracking skipped');
        }
        toast({ title: "Withdraw", description: "Select a vault to withdraw from." });
      }
    },
    { 
      label: "Pools", 
      icon: LayoutGrid, 
      onClick: async () => {
        setShowPools(!showPools);
        try {
          await track('pools_toggle', { showing: (!showPools).toString() });
        } catch (error) {
          console.log('Pools toggle tracking skipped');
        }
      }
    },
  ];

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${signinBg.src})` }}
    >
      {/* Navigation */}
      <nav className="border-b-2 border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-3 items-center">
            {/* Logo */}
            <div>
              <Link href="/" className="text-2xl font-bold tracking-tight">
                ZeroG
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" className="font-medium border-2 border-border rounded-full px-6" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button className="bg-foreground text-background font-medium border-2 border-foreground rounded-full px-6" asChild>
                <Link href="/vault">Vault</Link>
              </Button>
              <Button variant="ghost" className="font-medium border-2 border-border rounded-full px-6" asChild>
                <Link href="/swap">Swap</Link>
              </Button>
              <Button variant="ghost" className="font-medium border-2 border-border rounded-full px-6" asChild>
                <Link href="/dashboard">Launch</Link>
              </Button>
            </div>

            {/* Wallet */}
            <div className="flex items-center justify-end gap-4">
            {isConnected ? (
              <>
                {petraWallet && (
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-border bg-muted/50 rounded-full">
                    <span className="text-sm font-mono font-semibold">{aptBalance} APT</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-border bg-card rounded-full">
                  {photonToken && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                      Photon
                    </span>
                  )}
                  <span className="text-sm font-mono font-medium">
                    {truncateAddress(displayAddress!)}
                  </span>
                </div>
              </>
            ) : (
              <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 border-2 border-foreground font-medium" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {/* My Positions */}
        <section className="mb-8">
          <MyPositions
            isConnected={isConnected}
            totalValue={totalValue}
            totalYield={totalYield}
            activePositions={activePositions}
          />
        </section>

        {/* Quick Actions & Vaults */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Vaults</h2>
            <div className="flex gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  onClick={action.onClick}
                  className="flex items-center gap-2 rounded-full border-2 border-border"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleVaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} onEnter={handleEnterVault} />
            ))}
          </div>
        </section>

        {/* Trading Pools Section - Always Visible */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Trading Pools</h2>
          <PoolsTable
            pools={samplePools}
            onAddLiquidity={handleAddLiquidity}
            onViewPool={handleViewPool}
          />
        </section>

        {/* Empty State for non-connected */}
        {!isConnected && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No positions yet — connect your wallet or deposit to a vault.
            </p>
            <Link href="/signin">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full border-2 border-foreground">
                Connect Wallet
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* Vault Modal */}
      <VaultModal
        vault={selectedVault}
        isOpen={!!selectedVault}
        onClose={() => setSelectedVault(null)}
        associatedPools={samplePools.slice(0, 3)}
      />
    </div>
  );
}
