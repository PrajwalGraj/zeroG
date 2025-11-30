'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePhoton } from '@/hooks/usePhoton';
import { useToast } from '@/hooks/use-toast';
import {
  Copy,
  Check,
  Gift,
  Users,
  TrendingUp,
  Sparkles,
  Twitter,
  Send,
  BarChart3,
  Droplet,
  PartyPopper
} from 'lucide-react';

interface RewardData {
  referralRewards: number;
  liquidityRewards: number;
  signupBonus: number;
  referralCount: number;
}

export default function RewardsPanel() {
  const { walletAddress: photonWallet } = usePhoton();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<RewardData>({
    referralRewards: 0,
    liquidityRewards: 0,
    signupBonus: 0,
    referralCount: 0
  });
  const [copied, setCopied] = useState(false);
  const [rewardAnimation, setRewardAnimation] = useState(false);
  const previousRewardsRef = useRef<RewardData | null>(null);

  const referralLink = photonWallet 
    ? `${window.location.origin}/signin?ref=${photonWallet}`
    : '';

  // Fetch rewards
  useEffect(() => {
    const fetchRewards = async () => {
      if (!photonWallet) return;

      try {
        const response = await fetch(`/api/rewards/fetch?clientUserId=${photonWallet}`);
        const data = await response.json();
        
        if (data.success) {
          const newRewards = data.data;
          
          // Check for new rewards and show popup (after state update)
          if (previousRewardsRef.current) {
            const prevRewards = previousRewardsRef.current;
            
            if (newRewards.referralRewards > prevRewards.referralRewards) {
              const earnedAmount = newRewards.referralRewards - prevRewards.referralRewards;
              toast({
                title: "🎉 Referral Reward Earned!",
                description: `You earned ${earnedAmount} ZRG for referring a new user!`,
                duration: 5000,
              });
              setRewardAnimation(true);
              setTimeout(() => setRewardAnimation(false), 1000);
            }
            
            if (newRewards.signupBonus > prevRewards.signupBonus) {
              const earnedAmount = newRewards.signupBonus - prevRewards.signupBonus;
              toast({
                title: "🎊 Welcome Bonus!",
                description: `You received ${earnedAmount} ZRG signup bonus!`,
                duration: 5000,
              });
              setRewardAnimation(true);
              setTimeout(() => setRewardAnimation(false), 1000);
            }
            
            if (newRewards.liquidityRewards > prevRewards.liquidityRewards) {
              const earnedAmount = newRewards.liquidityRewards - prevRewards.liquidityRewards;
              toast({
                title: "💧 Liquidity Reward!",
                description: `You earned ${earnedAmount} ZRG for providing liquidity!`,
                duration: 5000,
              });
              setRewardAnimation(true);
              setTimeout(() => setRewardAnimation(false), 1000);
            }
          }
          
          // Update refs and state
          previousRewardsRef.current = newRewards;
          setRewards(newRewards);
        }
      } catch (error) {
        console.error('Error fetching rewards:', error);
      }
    };

    fetchRewards();
    const interval = setInterval(fetchRewards, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [photonWallet, toast]);

  const totalRewards = rewards.referralRewards + rewards.liquidityRewards + rewards.signupBonus;

  const copyToClipboard = async () => {
    if (referralLink) {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnTwitter = () => {
    const text = `Join me on ZeroG and earn 50 ZRG tokens! 🚀\n\nI'm earning rewards for DeFi activities. You get 50 ZRG when you sign up!\n\n`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank');
  };

  const shareOnTelegram = () => {
    const text = `Join me on ZeroG and earn 50 ZRG tokens! 🚀 ${referralLink}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Total Rewards Card */}
      <Card className={`border-4 border-border bg-gradient-to-br from-primary/5 to-background p-6 transition-all ${rewardAnimation ? 'scale-105 shadow-2xl' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg border-2 border-primary/20">
              <Sparkles className={`w-6 h-6 text-primary ${rewardAnimation ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Rewards</div>
              <div className={`text-3xl font-bold ${rewardAnimation ? 'animate-pulse' : ''}`}>
                {totalRewards} ZRG
              </div>
            </div>
          </div>
          <Badge className="border-2 bg-primary/10 text-primary border-primary/20 text-lg px-4 py-2">
            🎁 Active
          </Badge>
        </div>

        {/* Rewards Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-lg border-2 border-border">
            <Gift className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-bold">{rewards.referralRewards}</div>
            <div className="text-xs text-muted-foreground">Referrals</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg border-2 border-border">
            <Droplet className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-bold">{rewards.liquidityRewards}</div>
            <div className="text-xs text-muted-foreground">Liquidity</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg border-2 border-border">
            <Sparkles className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <div className="text-lg font-bold">{rewards.signupBonus}</div>
            <div className="text-xs text-muted-foreground">Signup</div>
          </div>
        </div>
      </Card>

      {/* Referral Card */}
      <Card className="border-4 border-border bg-background p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Referral Program</h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg border-2 border-border">
            <div className="text-sm text-muted-foreground mb-2">Your Referral Link</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 bg-background border-2 border-border rounded font-mono text-sm"
              />
              <Button
                size="sm"
                onClick={copyToClipboard}
                className="border-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-2 gap-2"
              onClick={shareOnTwitter}
            >
              <Twitter className="w-4 h-4" />
              Share on X
            </Button>
            <Button
              variant="outline"
              className="border-2 gap-2"
              onClick={shareOnTelegram}
            >
              <Send className="w-4 h-4" />
              Share on Telegram
            </Button>
          </div>

          <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="font-bold mb-1">Earn More ZRG!</div>
                <div className="text-sm text-muted-foreground">
                  You earn <span className="font-bold text-primary">150 ZRG</span>, they get <span className="font-bold text-primary">50 ZRG</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-2 border-border">
            <span className="text-sm font-medium">Successful Referrals</span>
            <Badge className="border-2 bg-background">
              {rewards.referralCount} Users
            </Badge>
          </div>
        </div>
      </Card>

      {/* Platform Stats */}
      <Card className="border-4 border-border bg-gradient-to-br from-muted/50 to-background p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Platform Stats</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">2.5M+</div>
            <div className="text-xs text-muted-foreground">ZRG Distributed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">15K+</div>
            <div className="text-xs text-muted-foreground">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">$50M+</div>
            <div className="text-xs text-muted-foreground">Total Volume</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
