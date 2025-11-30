'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useWalletContext } from "../wallet-provider";
import { usePhoton } from "@/hooks/usePhoton";
import signinBg from "@/assets/signin-bg.jpg";
import RewardsPanel from "@/components/RewardsPanel";

export default function Dashboard() {
  const { walletAddress, username, aptBalance, connectWallet, disconnectWallet, fetchAptBalance } = useWalletContext();
  const { track, walletAddress: photonWallet, logout: photonLogout, clientUserId } = usePhoton();
  const [mounted, setMounted] = useState(false);
  
  // Fix hydration by only rendering wallet address after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Debug logging
  console.log('Dashboard auth state:', { 
    petraWallet: walletAddress, 
    photonWallet: photonWallet, 
    clientUserId: clientUserId,
    isAuthenticated: !!walletAddress || !!photonWallet 
  });
  console.log('Raw photonWallet value:', photonWallet);
  console.log('Type:', typeof photonWallet);
  
  // User is authenticated if they have either a Petra wallet or Photon wallet
  const isAuthenticated = !!walletAddress || !!photonWallet;
  const displayAddress = walletAddress || photonWallet;
  const authMethod = walletAddress ? 'Petra Wallet' : 'Photon Wallet';

  // Track vault deposit
  const handleVaultDeposit = async () => {
    try {
      await track('vault_deposit', {
        amount: '100',
        token: 'APT',
      });
    } catch (error) {
      // Feature works without Photon tracking
      console.log('Vault deposit - Photon tracking skipped');
    }
    // Add your vault deposit logic here
  };

  // Track token launch
  const handleTokenLaunch = async () => {
    try {
      await track('token_launch', {
        token_name: 'MyToken',
        token_symbol: 'MTK',
      });
    } catch (error) {
      console.log('Token launch - Photon tracking skipped');
    }
    // Add your token launch logic here
  };

  // Track staking
  const handleStaking = async () => {
    try {
      await track('staking_start', {
        amount: '50',
        token: 'APT',
      });
    } catch (error) {
      console.log('Staking - Photon tracking skipped');
    }
    // Add your staking logic here
  };

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${signinBg.src})` }}
    >
      {/* Dashboard Navbar */}
      <nav className="border-b-2 border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo - Left */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold tracking-tight">
                ZeroG
              </Link>
            </div>

            {/* Center Navigation Buttons */}
            <div className="flex items-center justify-center gap-3 flex-1">
              <Button variant="ghost" className="font-medium border-2 border-border rounded-full px-5 h-10 whitespace-nowrap" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" className="font-medium border-2 border-border rounded-full px-5 h-10 whitespace-nowrap" asChild>
                <Link href="/vault">Vault</Link>
              </Button>
              <Button variant="ghost" className="font-medium border-2 border-border rounded-full px-5 h-10 whitespace-nowrap" asChild>
                <Link href="/swap">Swap</Link>
              </Button>
              <Button variant="ghost" className="font-medium border-2 border-border rounded-full px-5 h-10 whitespace-nowrap" asChild>
                <Link href="/marketplace">Marketplace</Link>
              </Button>
            </div>

            {/* Right Side: APT Balance & Wallet Address */}
            <div className="flex items-center justify-end gap-3 flex-shrink-0">
            {mounted && isAuthenticated ? (
              <>
                {/* APT Balance with Refresh (only for Petra wallet) */}
                {walletAddress && (
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-border bg-muted/50 rounded-full">
                    <span className="text-sm font-mono font-semibold">{aptBalance} APT</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => fetchAptBalance()}
                      title="Refresh balance"
                    >
                      ↻
                    </Button>
                  </div>
                )}

                {/* Wallet Address (Display Only) */}
                {displayAddress && (
                  <div className="px-4 py-2 border-2 border-border bg-background font-mono text-sm rounded-full flex items-center gap-2">
                    <span>{String(displayAddress).slice(0, 6)}...{String(displayAddress).slice(-4)}</span>
                    {photonWallet && (
                      <span className="text-xs text-muted-foreground">Photon</span>
                    )}
                  </div>
                )}

                {/* Disconnect Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="border-2 shadow-sm"
                  onClick={() => {
                    if (walletAddress) {
                      disconnectWallet();
                    }
                    if (photonWallet) {
                      photonLogout();
                    }
                  }}
                >
                  Disconnect
                </Button>
              </>
            ) : mounted ? (
              <Button
                variant="outline"
                size="sm"
                className="border-2 shadow-sm"
                onClick={connectWallet}
              >
                Connect Wallet
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      </nav>

      {/* Dashboard Content - Horizontal Layout */}
      <div className="container mx-auto px-6 py-8 max-w-[1600px]">
        {isAuthenticated ? (
          <div className="space-y-6">
            {/* Welcome Banner - Full Width */}
            <div className="border-4 border-border bg-background/90 backdrop-blur-sm p-6 shadow-lg">
              <h1 className="text-3xl font-bold">
                Welcome {username || (mounted && displayAddress ? `${String(displayAddress).slice(0, 6)}...${String(displayAddress).slice(-4)}` : 'Guest')}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your DeFi portfolio with ease
                {photonWallet && <span className="ml-2 text-primary font-semibold">🎮 Gamification Active</span>}
              </p>
            </div>

            {/* Row 1: Total Balance, Vault Deposits, Rewards Earned - Horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-2 border-border bg-background/90 backdrop-blur-sm p-6 shadow-md">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Balance</h3>
                <p className="text-3xl font-bold">{aptBalance} APT</p>
                <p className="text-xs text-muted-foreground mt-1">≈ ${(parseFloat(aptBalance) * 8.5).toFixed(2)} USD</p>
              </div>

              <div className="border-2 border-border bg-background/90 backdrop-blur-sm p-6 shadow-md">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Vault Deposits</h3>
                <p className="text-3xl font-bold">0.00 APT</p>
                <p className="text-xs text-muted-foreground mt-1">Start earning yield</p>
              </div>

              <div className="border-2 border-border bg-background/90 backdrop-blur-sm p-6 shadow-md">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Rewards Earned</h3>
                <p className="text-3xl font-bold">0.00 APT</p>
                <p className="text-xs text-muted-foreground mt-1">Claim anytime</p>
              </div>
            </div>

            {/* Row 2: Total Rewards (Rewards Panel) */}
            <div>
              <RewardsPanel />
            </div>

            {/* Row 3: Quick Actions */}
            <div className="border-2 border-border bg-background/90 backdrop-blur-sm p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="border-2 shadow-sm" 
                  size="lg"
                  onClick={handleVaultDeposit}
                >
                  Deposit to Vault
                </Button>
                <Button 
                  className="border-2 shadow-sm" 
                  size="lg" 
                  variant="outline"
                  onClick={handleTokenLaunch}
                >
                  Launch Token
                </Button>
                <Button 
                  className="border-2 shadow-sm" 
                  size="lg" 
                  variant="outline"
                  onClick={handleStaking}
                >
                  Start Staking
                </Button>
              </div>
            </div>

            {/* Row 4: Recent Activity */}
            <div className="border-2 border-border bg-background/90 backdrop-blur-sm p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity yet</p>
                <p className="text-sm mt-1">Your transactions will appear here</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="border-4 border-border bg-background/90 backdrop-blur-sm p-12 shadow-lg max-w-md">
              <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Please connect your Petra wallet to access the dashboard
              </p>
              <Button
                size="lg"
                className="border-2 shadow-sm"
                onClick={connectWallet}
              >
                Connect Petra Wallet
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
