'use client';

import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network, ClientConfig } from '@aptos-labs/ts-sdk';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Unlock, 
  TrendingUp, 
  DollarSign, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  BarChart3,
  Coins,
  ExternalLink
} from 'lucide-react';

// Initialize Aptos client with API key
const APTOS_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY || "";
const clientConfig: ClientConfig = APTOS_API_KEY ? { API_KEY: APTOS_API_KEY } : {};
const aptosConfig = new AptosConfig({ 
  network: Network.TESTNET,
  clientConfig 
});
const aptos = new Aptos(aptosConfig);

interface PoolData {
  score: number;
  risk: string;
  tvl: string;
  apy: string;
  volume24h: string;
  fees24h: string;
  impermanentLoss: string;
  liquidityDepth: string;
  priceImpact: string;
  weeklyReturn: string;
  monthlyReturn: string;
  sharpeRatio: string;
  maxDrawdown: string;
  transactionHash?: string;
}

interface Pool {
  id: string;
  name: string;
  description: string;
  icon1: string;
  icon2: string;
}

const MOCK_POOLS: Pool[] = [
  {
    id: "APT-USDC",
    name: "APT-USDC",
    description: "High liquidity stablecoin pair",
    icon1: "💎",
    icon2: "💵"
  },
  {
    id: "MOJO-APT",
    name: "MOJO-APT",
    description: "Emerging token with high yields",
    icon1: "🚀",
    icon2: "💎"
  },
  {
    id: "CAKE-APT",
    name: "CAKE-APT",
    description: "High risk, high reward DeFi pair",
    icon1: "🍰",
    icon2: "💎"
  }
];

export default function DataMarketplace() {
  const { signAndSubmitTransaction, connected, account } = useWallet();
  
  const [unlockedPools, setUnlockedPools] = useState<Record<string, PoolData>>({});
  const [loadingPools, setLoadingPools] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const unlockData = async (poolAddress: string) => {
    if (!connected || !account) {
      setErrors(prev => ({ ...prev, [poolAddress]: "Please connect your wallet first" }));
      return;
    }

    setLoadingPools(prev => ({ ...prev, [poolAddress]: true }));
    setErrors(prev => ({ ...prev, [poolAddress]: "" }));

    try {
      console.log(`🔍 [x402] Step 1: Requesting data for ${poolAddress} without payment`);
      
      // Step 1: Initial request without payment
      const initialResponse = await fetch('/api/pool-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolAddress })
      });

      // Step 2: Server returns 402 Payment Required
      if (initialResponse.status === 402) {
        const paymentInfo = await initialResponse.json();
        console.log('💳 [x402] Step 2: Payment required - Server responded with 402');
        console.log('💰 Payment details:', paymentInfo.payment);

        // Step 3: Execute on-chain payment
        console.log(`📤 [x402] Step 3: Sending ${paymentInfo.payment.cost} APT to ${paymentInfo.payment.recipient}`);
        
        const transaction = await signAndSubmitTransaction({
          data: {
            function: "0x1::aptos_account::transfer",
            functionArguments: [
              paymentInfo.payment.recipient, 
              paymentInfo.payment.costOctas.toString()
            ],
          }
        });

        console.log(`✅ [x402] Payment TX submitted: ${transaction.hash}`);

        // Wait for transaction confirmation
        console.log('⏳ [x402] Waiting for transaction confirmation...');
        await aptos.waitForTransaction({
          transactionHash: transaction.hash
        });

        console.log('✅ [x402] Transaction confirmed on-chain');

        // Small delay for blockchain state propagation
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 4: Retry with X-PAYMENT header (x402 protocol)
        console.log('🔓 [x402] Step 4: Retrying request with X-PAYMENT header');
        
        const paymentPayload = JSON.stringify({
          transactionHash: transaction.hash,
          amount: paymentInfo.payment.costOctas,
          recipient: paymentInfo.payment.recipient,
          currency: "APT",
          network: "Aptos Testnet"
        });

        const dataResponse = await fetch('/api/pool-score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-PAYMENT': paymentPayload  // x402 protocol header
          },
          body: JSON.stringify({ poolAddress })
        });

        // Step 5: Server verifies payment and returns data
        if (dataResponse.ok) {
          const result = await dataResponse.json();
          console.log('✅ [x402] Step 5: Payment verified! Premium data unlocked');
          console.log('📊 Data:', result.data);
          
          setUnlockedPools(prev => ({
            ...prev,
            [poolAddress]: result.data
          }));
        } else {
          const error = await dataResponse.json();
          throw new Error(error.message || 'Payment verification failed');
        }

      } else if (initialResponse.ok) {
        // Data already unlocked
        const result = await initialResponse.json();
        setUnlockedPools(prev => ({
          ...prev,
          [poolAddress]: result.data
        }));
      } else {
        const error = await initialResponse.json();
        throw new Error(error.message || 'API request failed');
      }

    } catch (error: any) {
      console.error('❌ [x402] Error:', error);
      setErrors(prev => ({ 
        ...prev, 
        [poolAddress]: error.message || 'Failed to unlock data. Please try again.' 
      }));
    } finally {
      setLoadingPools(prev => ({ ...prev, [poolAddress]: false }));
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border-2 border-primary/20">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">x402 Data Marketplace</h2>
            <p className="text-sm text-muted-foreground">
              Premium DeFi analytics powered by Coinbase x402 Payment Protocol
            </p>
          </div>
        </div>
      </div>

      {/* x402 Protocol Info Banner */}
      <Card className="border-4 border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1 space-y-2">
            <h3 className="font-bold flex items-center gap-2">
              x402 Payment Protocol
              <a 
                href="https://github.com/coinbase/x402" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Learn More
              </a>
            </h3>
            <p className="text-sm text-muted-foreground">
              Each pool&apos;s premium analytics costs <span className="font-bold text-primary">0.1 APT</span>. 
              Using the x402 protocol: Server responds with 402 Payment Required → You pay on-chain → 
              Request retries with X-PAYMENT header → Server verifies & unlocks data.
            </p>
          </div>
        </div>
      </Card>

      {/* Pool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_POOLS.map((pool) => {
          const isUnlocked = !!unlockedPools[pool.id];
          const isLoading = loadingPools[pool.id];
          const error = errors[pool.id];
          const data = unlockedPools[pool.id];

          return (
            <Card 
              key={pool.id} 
              className="border-4 border-border bg-background overflow-hidden"
            >
              {/* Pool Header */}
              <div className="p-6 border-b-4 border-border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{pool.icon1}</span>
                    <span className="text-2xl">{pool.icon2}</span>
                  </div>
                  {isUnlocked ? (
                    <Unlock className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">{pool.name}</h3>
                <p className="text-sm text-muted-foreground">{pool.description}</p>
              </div>

              {/* Pool Data - Blurred if locked */}
              <div className="p-6 space-y-4">
                <div className={`space-y-4 ${!isUnlocked ? 'blur-sm select-none pointer-events-none' : ''}`}>
                  {/* Risk Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Risk Score</span>
                    <span className={`text-2xl font-bold ${data ? getScoreColor(data.score) : ''}`}>
                      {data?.score || '85'}
                    </span>
                  </div>

                  {/* Risk Level */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Risk Level</span>
                    <Badge className={`border-2 ${data ? getRiskColor(data.risk) : 'bg-muted text-muted-foreground'}`}>
                      <span className="flex items-center gap-1">
                        {data && getRiskIcon(data.risk)}
                        {data?.risk || 'Medium'}
                      </span>
                    </Badge>
                  </div>

                  {/* TVL */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Total Value Locked
                    </span>
                    <span className="font-bold">{data?.tvl || '$5.2M'}</span>
                  </div>

                  {/* APY */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      APY
                    </span>
                    <span className="font-bold text-green-500">{data?.apy || '24.5%'}</span>
                  </div>

                  {/* Premium Analytics */}
                  {isUnlocked && data && (
                    <div className="pt-4 border-t-2 border-border space-y-3">
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Premium Analytics
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2 bg-muted/50 rounded border-2 border-border">
                          <div className="text-muted-foreground mb-1">24h Volume</div>
                          <div className="font-bold">{data.volume24h}</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded border-2 border-border">
                          <div className="text-muted-foreground mb-1">24h Fees</div>
                          <div className="font-bold">{data.fees24h}</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded border-2 border-border">
                          <div className="text-muted-foreground mb-1">IL Risk</div>
                          <div className="font-bold">{data.impermanentLoss}</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded border-2 border-border">
                          <div className="text-muted-foreground mb-1">Price Impact</div>
                          <div className="font-bold">{data.priceImpact}</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded border-2 border-border">
                          <div className="text-muted-foreground mb-1">Weekly Return</div>
                          <div className="font-bold text-green-500">{data.weeklyReturn}</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded border-2 border-border">
                          <div className="text-muted-foreground mb-1">Sharpe Ratio</div>
                          <div className="font-bold">{data.sharpeRatio}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {!isUnlocked && (
                  <Button
                    className="w-full border-4 shadow-sm"
                    onClick={() => unlockData(pool.id)}
                    disabled={isLoading || !connected}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing Payment...
                      </>
                    ) : !connected ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Connect Wallet to Unlock
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-2" />
                        Unlock with x402 (0.1 APT)
                      </>
                    )}
                  </Button>
                )}

                {/* Success Badge */}
                {isUnlocked && data?.transactionHash && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 border-2 border-green-500/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-bold text-green-500">Unlocked via x402</span>
                    </div>
                    <a
                      href={`https://explorer.aptoslabs.com/txn/${data.transactionHash}?network=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Payment TX
                    </a>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border-2 border-red-500/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                    <span className="text-xs text-red-500">{error}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Stats Footer */}
      <Card className="border-4 border-border bg-muted/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {Object.keys(unlockedPools).length}
            </div>
            <div className="text-sm text-muted-foreground">Pools Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {(Object.keys(unlockedPools).length * 0.1).toFixed(1)} APT
            </div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {MOCK_POOLS.length}
            </div>
            <div className="text-sm text-muted-foreground">Available Pools</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
