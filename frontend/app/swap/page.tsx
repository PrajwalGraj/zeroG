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

/**
 * Testnet Token Address Mapping (MUST match backend)
 */
const TOKEN_ADDRESSES_TESTNET: Record<string, string> = {
  APT: "0x1::aptos_coin::AptosCoin",
  USDC:
    "0x27e28c972a63b8c58887cf07dc2d7309f5306baae8f39fa996ba8e70ef58533::asset::USDC",
  USDT:
    "0xd2e0bd1a70ffb4053db9cb38ddb8bfdcb84ce8b063a492819e93915e6a9ef5ac::asset::USDT",
};

/**
 * Token List for UI
 */
const TOKENS = [
  { symbol: 'APT', name: 'Aptos', price: 8.45, logo: 'https://cryptologos.cc/logos/aptos-apt-logo.png' },
  { symbol: 'USDC', name: 'USD Coin', price: 1.00, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  { symbol: 'USDT', name: 'Tether', price: 1.00, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
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

  /**
   * Dropdown auto-close
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node))
        setShowFromDropdown(false);

      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node))
        setShowToDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Auto preview output based on mock rate
   */
  useEffect(() => {
    if (!fromAmount || isNaN(Number(fromAmount))) {
      setToAmount('');
      return;
    }
    const rate = fromToken.price / toToken.price;
    setToAmount((Number(fromAmount) * rate).toFixed(6));
  }, [fromAmount, fromToken, toToken]);

  /**
   * Swap token positions
   */
  const handleSwapTokens = () => {
    const tempT = fromToken;
    const tempA = fromAmount;

    setFromToken(toToken);
    setToToken(tempT);

    setFromAmount(toAmount);
    setToAmount(tempA);
  };

  /**
   * REAL Thala testnet swap logic
   */
  const handleSwap = async () => {
    if (!isAuthenticated) {
      alert("Connect wallet first!");
      return;
    }

    if (!fromAmount || Number(fromAmount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    setIsSwapping(true);
    try {
      // 🔵 THALA QUOTE CALL (Mock mode ON for now)
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/thala/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromSymbol: fromToken.symbol,
          toSymbol: toToken.symbol,
          amount: Number(fromAmount),
          minOut: 0,
          mock: true  // keep mock on until we switch to real Thala testnet
        }),
      });


      const data = await res.json();
      console.log("THALA RESPONSE:", data);

      if (!res.ok || !data.txData) {
        throw new Error(data.error || "Backend did not return txData");
      }

      // 🔵 DETECT WALLET
      const wallet = (window as any).aptos;
      if (!wallet) throw new Error("No Aptos-compatible wallet detected");

      // 🔵 SIGN TESTNET TX
      const tx = await wallet.signAndSubmitTransaction(data.txData);
      const txHash = tx.hash || tx.transactionHash || JSON.stringify(tx);

      alert("Swap submitted! TX Hash:\n" + txHash);

      // Analytics
      await track("swap_complete", {
        from: fromToken.symbol,
        to: toToken.symbol,
        amount: fromAmount,
        txHash,
      });

      setFromAmount('');
      setToAmount('');
    } catch (err: any) {
      console.error("Swap failed:", err);
      alert("Swap failed: " + err.message);
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
      {/* ---------------- NAVBAR ---------------- */}
      <nav className="border-b-2 border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-3 items-center">

            <div>
              <Link href="/" className="text-2xl font-bold tracking-tight">ZeroG</Link>
            </div>

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
                <Button variant="outline" size="sm" className="border-2 shadow-sm" onClick={connectWallet}>
                  Connect Wallet
                </Button>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* ---------------- SWAP BOX ---------------- */}
      <div className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-lg border-4 border-border bg-background/95 backdrop-blur-sm p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-6">Swap Tokens</h1>

          {isAuthenticated ? (
            <div className="space-y-4">

              {/* FROM */}
              <TokenSelector
                label="From"
                token={fromToken}
                tokens={TOKENS}
                showDropdown={showFromDropdown}
                dropdownRef={fromDropdownRef}
                setShowDropdown={setShowFromDropdown}
                onSelect={setFromToken}
                amount={fromAmount}
                setAmount={setFromAmount}
                readOnly={false}
                valueUSD={fromValueUSD}
              />

              {/* Swap Icon */}
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

              {/* TO */}
              <TokenSelector
                label="To"
                token={toToken}
                tokens={TOKENS}
                showDropdown={showToDropdown}
                dropdownRef={toDropdownRef}
                setShowDropdown={setShowToDropdown}
                onSelect={setToToken}
                amount={toAmount}
                readOnly={true}
                valueUSD={toValueUSD}
              />

              {/* Rate Info */}
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

              {/* SWAP BUTTON */}
              <Button
                className="w-full h-14 text-lg font-bold border-4 shadow-lg"
                size="lg"
                onClick={handleSwap}
                disabled={!fromAmount || isSwapping}
              >
                {isSwapping ? 'Swapping...' : 'Swap'}
              </Button>

            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">Connect your wallet to start swapping tokens</p>
              <Button onClick={connectWallet} className="border-2">Connect Wallet</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/**
 * Token Selector Component
 */
function TokenSelector({
  label,
  token,
  tokens,
  showDropdown,
  dropdownRef,
  setShowDropdown,
  onSelect,
  amount,
  setAmount,
  readOnly,
  valueUSD
}: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="border-4 border-border bg-muted/50 p-4 space-y-3">

        {/* Dropdown + Amount Input */}
        <div className="flex items-center justify-between">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 text-xl font-bold bg-transparent outline-none cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img src={token.logo} className="w-6 h-6 rounded-full" />
              <span>{token.symbol}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 border-4 border-border bg-background shadow-xl z-50 max-h-64 overflow-y-auto">
                {tokens.map((t: any) => (
                  <button
                    key={t.symbol}
                    onClick={() => {
                      onSelect(t);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                  >
                    <img src={t.logo} className="w-5 h-5 rounded-full" />
                    <div className="flex-1">
                      <div className="font-bold">{t.symbol}</div>
                      <div className="text-xs text-muted-foreground">{t.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount && setAmount(e.target.value)}
            readOnly={readOnly}
            className="text-right text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
          />
        </div>

        {/* Token USD Value */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{token.name}</span>
          <span>${valueUSD}</span>
        </div>

        <div className="text-xs text-muted-foreground">Price: ${token.price}</div>
      </div>
    </div>
  );
}
