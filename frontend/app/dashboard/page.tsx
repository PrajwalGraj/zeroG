'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useWallet } from "../wallet-provider";
import signinBg from "@/assets/signin-bg.jpg";

export default function Dashboard() {
  const { walletAddress, username, aptBalance, connectWallet, disconnectWallet, fetchAptBalance } = useWallet();

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${signinBg.src})` }}
    >
      {/* Dashboard Navbar */}
      <nav className="border-b-2 border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tight">
            zeroG
          </Link>

          {/* Center Navigation Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="font-medium" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" className="font-medium" asChild>
              <Link href="/dashboard">Vault</Link>
            </Button>
            <Button variant="ghost" className="font-medium" asChild>
              <Link href="/dashboard">Launch</Link>
            </Button>
          </div>

          {/* Right Side: APT Balance & Wallet Address */}
          <div className="flex items-center gap-4">
            {walletAddress ? (
              <>
                {/* APT Balance with Refresh */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-border bg-muted/50">
                  <span className="text-sm font-mono font-semibold">{aptBalance} APT</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={fetchAptBalance}
                    title="Refresh balance"
                  >
                    ↻
                  </Button>
                </div>

                {/* Wallet Address (Display Only) */}
                <div className="px-4 py-2 border-2 border-border bg-background font-mono text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>

                {/* Disconnect Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="border-2 shadow-sm"
                  onClick={disconnectWallet}
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
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-12">
        {walletAddress ? (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="border-4 border-border bg-background/90 backdrop-blur-sm p-8 shadow-lg relative">
              <h1 className="text-4xl font-bold mb-2">
                Welcome {username || (walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Guest')}!
              </h1>
              <p className="text-muted-foreground">
                Manage your DeFi portfolio with ease
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border-2 border-border bg-background/90 backdrop-blur-sm p-6 shadow-md">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Balance</h3>
                <p className="text-3xl font-bold">{aptBalance} APT</p>
              </div>

              <div className="border-2 border-border bg-background/90 backdrop-blur-sm p-6 shadow-md">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Vault Deposits</h3>
                <p className="text-3xl font-bold">0.00 APT</p>
              </div>

              <div className="border-2 border-border bg-background/90 backdrop-blur-sm p-6 shadow-md">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Rewards Earned</h3>
                <p className="text-3xl font-bold">0.00 APT</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-2 border-border bg-background/90 backdrop-blur-sm p-8 shadow-md">
              <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Button className="border-2 shadow-sm" size="lg">
                  Deposit to Vault
                </Button>
                <Button className="border-2 shadow-sm" size="lg" variant="outline">
                  Launch Token
                </Button>
                <Button className="border-2 shadow-sm" size="lg" variant="outline">
                  Swap Tokens
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="border-2 border-border bg-background/90 backdrop-blur-sm p-8 shadow-md">
              <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
              <div className="text-center py-12 text-muted-foreground">
                <p>No recent activity yet</p>
                <p className="text-sm mt-2">Your transactions will appear here</p>
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
