'use client';

// Petra Wallet type declaration
declare global {
  interface Window {
    aptos?: {
      connect: () => Promise<{ address: string; publicKey: string }>;
      disconnect: () => Promise<void>;
      isConnected: () => Promise<boolean>;
      account: () => Promise<{ address: string; publicKey: string }>;
    };
  }
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import signinBg from "@/assets/signin-bg.jpg";
import { useToast } from "@/hooks/use-toast";

export default function SignIn() {
  const [activeTab, setActiveTab] = useState<"photon" | "wallet">("photon");
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const connectPetraWallet = async () => {
    setIsConnecting(true);
    try {
      // Check if Petra wallet is installed
      if (!window.aptos) {
        toast({
          title: "Petra Wallet Not Found",
          description: "Please install Petra Wallet extension to continue.",
          variant: "destructive",
        });
        // Open Petra installation page
        window.open("https://petra.app/", "_blank");
        setIsConnecting(false);
        return;
      }

      // Request connection to Petra wallet
      const response = await window.aptos.connect();
      
      if (response.address) {
        setWalletAddress(response.address);
        toast({
          title: "Wallet Connected!",
          description: `Connected to ${response.address.slice(0, 6)}...${response.address.slice(-4)}`,
        });
      }
    } catch (error: any) {
      console.error("Error connecting to Petra wallet:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Petra wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
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
          <div className="text-2xl font-bold tracking-tight">zeroG</div>
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
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userId" className="font-semibold mb-2 block">
                      User ID
                    </Label>
                    <Input
                      id="userId"
                      placeholder="Enter your user ID"
                      className="border-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="font-semibold mb-2 block">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="border-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="name" className="font-semibold mb-2 block">
                      Name (Optional)
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      className="border-2"
                    />
                  </div>

                  <Button 
                    className="w-full border-2 shadow-sm"
                    size="lg"
                  >
                    Login with Photon
                  </Button>

                  <div className="text-center text-sm text-muted-foreground my-4">
                    Or connect your wallet
                  </div>

                  <button
                    onClick={connectPetraWallet}
                    disabled={isConnecting || !!walletAddress}
                    className="w-full py-3 px-4 font-medium text-background rounded-md border-2 border-border shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                    }}
                  >
                    {isConnecting ? "Connecting..." : walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Petra Wallet"}
                  </button>
                </div>
              )}

              {/* Wallet Only */}
              {activeTab === "wallet" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Petra wallet to get started
                  </p>

                  <button
                    onClick={connectPetraWallet}
                    disabled={isConnecting || !!walletAddress}
                    className="w-full py-3 px-4 font-medium text-background rounded-md border-2 border-border shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                    }}
                  >
                    {isConnecting ? "Connecting..." : walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Petra Wallet"}
                  </button>

                  <Button 
                    className="w-full border-2 shadow-sm"
                    size="lg"
                  >
                    Continue to Dashboard
                  </Button>

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
