'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useWalletContext } from "../wallet-provider";
import { usePhoton } from "@/hooks/usePhoton";
import signinBg from "@/assets/signin-bg.jpg";
import { ArrowDownUp, ChevronDown } from "lucide-react";

// Mock token list - in production, fetch from API
const TOKENS = [
  { 
    symbol: 'APT', 
    name: 'Aptos', 
    price: 8.45,
    logo: 'https://cryptologos.cc/logos/aptos-apt-logo.png'
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    price: 1.00,
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
  },
  { 
    symbol: 'USDT', 
    name: 'Tether', 
    price: 1.00,
    logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
  },
  { 
    symbol: 'WETH', 
    name: 'Wrapped Ethereum', 
    price: 2245.50,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  { 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    price: 43250.00,
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
  },
];

export default function Swap() {
  const { walletAddress, aptBalance, connectWallet, disconnectWallet } = useWalletContext();
  const { track, walletAddress: photonWallet, logout: photonLogout } = usePhoton();
  
  const isAuthenticated = !!walletAddress || !!photonWallet;
  const displayAddress = walletAddress || photonWallet;

  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  
  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node)) {
        setShowToDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate exchange rate and to amount
  useEffect(() => {
    if (fromAmount && !isNaN(Number(fromAmount))) {
      const exchangeRate = fromToken.price / toToken.price;
      const calculated = (Number(fromAmount) * exchangeRate).toFixed(6);
      setToAmount(calculated);
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!fromAmount || !isAuthenticated) return;
    
    setIsSwapping(true);
    try {
      // Track swap event in Photon
      await track('swap_complete', {
        from_token: fromToken.symbol,
        to_token: toToken.symbol,
        from_amount: fromAmount,
        to_amount: toAmount,
        timestamp: new Date().toISOString(),
      });

      // Simulate swap processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}!`);
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setIsSwapping(false);
    }
  };

  const fromValueUSD = fromAmount ? (Number(fromAmount) * fromToken.price).toFixed(2) : '0.00';
  const toValueUSD = toAmount ? (Number(toAmount) * toToken.price).toFixed(2) : '0.00';

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
                <Link href="/swap">Swap</Link>
              </Button>
              <Button variant="ghost" className="font-medium border-2 border-border rounded-full px-6" asChild>
                <Link href="/dashboard">Launch</Link>
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

      {/* Swap Content */}
      <div className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-lg border-4 border-border bg-background/95 backdrop-blur-sm p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-6">Swap Tokens</h1>
          
          {isAuthenticated ? (
            <div className="space-y-4">
              {/* From Token */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">From</label>
                <div className="border-4 border-border bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="relative" ref={fromDropdownRef}>
                      <button
                        onClick={() => setShowFromDropdown(!showFromDropdown)}
                        className="flex items-center gap-2 text-xl font-bold bg-transparent outline-none cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img 
                          src={fromToken.logo} 
                          alt={fromToken.symbol}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/24'; }}
                        />
                        <span>{fromToken.symbol}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {showFromDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-48 border-4 border-border bg-background shadow-xl z-50 max-h-64 overflow-y-auto">
                          {TOKENS.map(token => (
                            <button
                              key={token.symbol}
                              onClick={() => {
                                setFromToken(token);
                                setShowFromDropdown(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                            >
                              <img 
                                src={token.logo} 
                                alt={token.symbol}
                                className="w-5 h-5 rounded-full"
                                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/20'; }}
                              />
                              <div className="flex-1">
                                <div className="font-bold">{token.symbol}</div>
                                <div className="text-xs text-muted-foreground">{token.name}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      className="text-right text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>{fromToken.name}</span>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                    <span>${fromValueUSD}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Price: ${fromToken.price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-4 border-border bg-background hover:bg-muted h-12 w-12"
                  onClick={handleSwapTokens}
                >
                  <ArrowDownUp className="h-5 w-5" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">To</label>
                <div className="border-4 border-border bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="relative" ref={toDropdownRef}>
                      <button
                        onClick={() => setShowToDropdown(!showToDropdown)}
                        className="flex items-center gap-2 text-xl font-bold bg-transparent outline-none cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img 
                          src={toToken.logo} 
                          alt={toToken.symbol}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/24'; }}
                        />
                        <span>{toToken.symbol}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {showToDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-48 border-4 border-border bg-background shadow-xl z-50 max-h-64 overflow-y-auto">
                          {TOKENS.map(token => (
                            <button
                              key={token.symbol}
                              onClick={() => {
                                setToToken(token);
                                setShowToDropdown(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                            >
                              <img 
                                src={token.logo} 
                                alt={token.symbol}
                                className="w-5 h-5 rounded-full"
                                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/20'; }}
                              />
                              <div className="flex-1">
                                <div className="font-bold">{token.symbol}</div>
                                <div className="text-xs text-muted-foreground">{token.name}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="0.0"
                      value={toAmount}
                      readOnly
                      className="text-right text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 cursor-default"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>{toToken.name}</span>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                    <span>${toValueUSD}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Price: ${toToken.price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Exchange Rate */}
              {fromAmount && (
                <div className="border-2 border-border bg-muted/30 p-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Exchange Rate:</span>
                    <span className="font-mono font-semibold">
                      1 {fromToken.symbol} = {(fromToken.price / toToken.price).toFixed(6)} {toToken.symbol}
                    </span>
                  </div>
                </div>
              )}

              {/* Swap Button */}
              <Button
                className="w-full h-14 text-lg font-bold border-4 shadow-lg"
                size="lg"
                onClick={handleSwap}
                disabled={!fromAmount || isSwapping || !isAuthenticated}
              >
                {isSwapping ? 'Swapping...' : 'Swap'}
              </Button>

              {/* Info */}
              <div className="text-xs text-muted-foreground text-center pt-2">
                Prices are updated in real-time. Gas fees may apply.
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">
                Connect your wallet to start swapping tokens
              </p>
              <Button
                onClick={connectWallet}
                className="border-2"
              >
                Connect Wallet
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
