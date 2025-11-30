'use client';

import { useWalletContext } from "../wallet-provider";
import { usePhoton } from "@/hooks/usePhoton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import signinBg from "@/assets/signin-bg.jpg";
import DataMarketplace from "@/components/DataMarketplace";

export default function MarketplacePage() {
  const { walletAddress, aptBalance, connectWallet, disconnectWallet } = useWalletContext();
  const { walletAddress: photonWallet, logout: photonLogout } = usePhoton();
  
  const isAuthenticated = !!walletAddress || !!photonWallet;
  const displayAddress = walletAddress || photonWallet;

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${signinBg.src})` }}
    >
      {/* Navbar */}
      <nav className="border-b-2 border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-3 items-center">
            {/* Logo - Left */}
            <div>
              <Link href="/" className="text-2xl font-bold tracking-tight">
                ZeroG
              </Link>
            </div>

            {/* Navigation - Center */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" className="font-medium border-2 border-border rounded-full px-6" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" className="font-medium border-2 border-border rounded-full px-6" asChild>
                <Link href="/vault">Vault</Link>
              </Button>
              <Button variant="ghost" className="font-medium border-2 border-border rounded-full px-6" asChild>
                <Link href="/marketplace">x402</Link>
              </Button>
            </div>

            {/* Wallet Info - Right */}
            <div className="flex items-center justify-end gap-4">
            {isAuthenticated ? (
              <>
                {walletAddress && (
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-border bg-muted/50 rounded-full">
                    <span className="text-sm font-mono font-semibold">{aptBalance} APT</span>
                  </div>
                )}

                <div className="px-4 py-2 border-2 border-border bg-background font-mono text-sm rounded-full flex items-center gap-2">
                  <span>{String(displayAddress).slice(0, 6)}...{String(displayAddress).slice(-4)}</span>
                  {photonWallet && (
                    <span className="text-xs text-muted-foreground">Photon</span>
                  )}
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  className="border-2 shadow-sm"
                  onClick={() => {
                    if (walletAddress) disconnectWallet();
                    if (photonWallet) photonLogout();
                  }}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-2 shadow-sm"
                onClick={connectWallet}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
      </nav>

      {/* Marketplace Content */}
      <div className="container mx-auto px-6 py-12">
        {isAuthenticated ? (
          <DataMarketplace />
        ) : (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center space-y-6 max-w-md">
              <div className="p-4 bg-background/95 backdrop-blur-sm border-4 border-border rounded-2xl">
                <h1 className="text-3xl font-bold mb-3">Connect Your Wallet</h1>
                <p className="text-muted-foreground mb-6">
                  Access premium DeFi pool analytics powered by Coinbase x402 Payment Protocol.
                </p>
                <Button
                  onClick={connectWallet}
                  className="border-4 shadow-lg"
                  size="lg"
                >
                  Connect Wallet
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
