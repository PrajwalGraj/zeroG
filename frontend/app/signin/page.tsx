'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import signinBg from "@/assets/signin-bg.jpg";
import { useWalletContext } from "../wallet-provider";
import { usePhoton } from "@/hooks/usePhoton";
import { useRouter } from "next/navigation";
import { publicConfig } from "@/lib/config";

// Google Sign-In Script
declare global {
  interface Window {
    google?: any;
  }
}

export default function SignIn() {
  const [activeTab, setActiveTab] = useState<"photon" | "wallet">("photon");
  const { walletAddress, isConnecting, connectWallet } = useWalletContext();
  const { login: photonLogin, track, isLoading: photonLoading, walletAddress: photonWallet } = usePhoton();
  const router = useRouter();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (walletAddress || photonWallet) {
      console.log('User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [walletAddress, photonWallet, router]);

  // Extract referral code from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      console.log('📎 Referral code detected:', ref);
    }
  }, []);

  // Handle Google Sign-In callback (defined before useEffect)
  const handleGoogleCallback = async (response: any) => {
    try {
      const googleJWT = response.credential;
      console.log('Google sign-in received, JWT:', googleJWT?.substring(0, 20) + '...');
      
      // Decode JWT to get user info
      const base64Url = googleJWT.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      console.log('Google user info:', { sub: payload.sub, email: payload.email });
      
      // Login to Photon first to get wallet address
      const result = await photonLogin(googleJWT, payload.sub);
      console.log('Photon login result:', result);
      
      if (result && result.walletAddress) {
        // Process referral if referral code exists
        if (referralCode) {
          console.log('🎁 Processing referral for new user');
          try {
            const referralResponse = await fetch('/api/referral/process', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                referralCode: referralCode,
                clientUserId: result.walletAddress
              })
            });
            
            if (referralResponse.ok) {
              console.log('✅ Referral processed successfully');
            }
          } catch (error) {
            console.error('Referral processing failed:', error);
          }
        }
        
        // Redirect to dashboard
        console.log('Redirecting to dashboard with wallet:', result.walletAddress);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Initialize Google Sign-In when script is loaded
  useEffect(() => {
    const clientId = publicConfig.googleClientId;
    
    if (isGoogleLoaded && window.google && clientId) {
      console.log('Initializing Google Sign-In with client ID:', clientId.substring(0, 20) + '...');
      
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
      });

      const buttonDiv = document.getElementById('googleSignInButton');
      if (buttonDiv) {
        window.google.accounts.id.renderButton(
          buttonDiv,
          { 
            theme: 'outline', 
            size: 'large',
            width: 400,
            text: 'signin_with',
          }
        );
      }
    }
  }, [isGoogleLoaded, handleGoogleCallback]);

  // Handle Petra Wallet connection with Photon tracking
  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      // Only track if Photon is available (optional for wallet-only users)
      try {
        await track('wallet_connect', {
          wallet_type: 'Petra',
          timestamp: new Date().toISOString(),
        });
      } catch (trackError) {
        // Ignore tracking errors for wallet-only users
        console.log('Photon tracking skipped (not initialized)');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${signinBg.src})` }}
    >
      {/* Header */}
      <div className="w-full border-b-2 border-border bg-background py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">ZeroG</div>
          <Link 
            href="/" 
            className="text-sm font-medium hover:underline flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Sign In Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Sign In</h1>
            <p className="text-muted-foreground">
              Choose your preferred authentication method
            </p>
          </div>

          {/* Sign In Card */}
          <div className="bg-background border-4 border-border shadow-md relative">
            <div className="absolute -bottom-2 -right-2 w-full h-full bg-foreground -z-10" />
            
            <div className="p-8">
              {/* Tabs */}
              <div className="grid grid-cols-2 gap-0 mb-6 border-2 border-border">
                <button
                  onClick={() => setActiveTab("photon")}
                  className={`py-3 text-sm font-medium transition-colors border-r-2 border-border ${
                    activeTab === "photon"
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  Photon Login
                </button>
                <button
                  onClick={() => setActiveTab("wallet")}
                  className={`py-3 text-sm font-medium transition-colors ${
                    activeTab === "wallet"
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  Wallet Only
                </button>
              </div>

              {/* Photon Login Form */}
              {activeTab === "photon" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Wallet-less Sign In</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      No crypto wallet needed. Sign in with your Google account and start earning rewards!
                    </p>
                  </div>

                  {/* Google Sign-In Button */}
                  <div className="flex justify-center">
                    <div id="googleSignInButton"></div>
                  </div>

                  {photonLoading && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Connecting to Photon...</p>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        How it works
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                      <p>Sign in with Google - No wallet installation required</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">2</span>
                      </div>
                      <p>Earn rewards for every action you take</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">3</span>
                      </div>
                      <p>Connect a wallet later to claim your rewards</p>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground pt-4">
                    Already have a wallet? Switch to{" "}
                    <button 
                      onClick={() => setActiveTab("wallet")}
                      className="underline hover:text-foreground"
                    >
                      Wallet Only
                    </button>
                  </p>
                </div>
              )}

              {/* Wallet Only */}
              {activeTab === "wallet" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Petra wallet to get started
                  </p>

                  <button
                    onClick={handleWalletConnect}
                    disabled={isConnecting || !!walletAddress}
                    className="w-full py-3 px-4 font-medium text-background rounded-md border-2 border-border shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                    }}
                  >
                    {isConnecting ? "Connecting..." : walletAddress ? `Connected: ${String(walletAddress).slice(0, 6)}...${String(walletAddress).slice(-4)}` : "Connect Petra Wallet"}
                  </button>

                  {walletAddress && (
                    <Button 
                      className="w-full border-2 shadow-sm"
                      size="lg"
                      asChild
                    >
                      <Link href="/dashboard">Continue to Dashboard</Link>
                    </Button>
                  )}

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    New to Web3? No problem! Photon login requires no wallet setup.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
