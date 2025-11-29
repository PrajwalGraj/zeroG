'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Petra Wallet type declaration
declare global {
  interface Window {
    aptos?: {
      connect: () => Promise<{ address: string; publicKey: string }>;
      disconnect: () => Promise<void>;
      isConnected: () => Promise<boolean>;
      account: () => Promise<{ address: string; publicKey: string }>;
      network: () => Promise<string>;
    };
  }
}

interface WalletContextType {
  walletAddress: string | null;
  username: string | null;
  aptBalance: string;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  fetchAptBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [aptBalance, setAptBalance] = useState<string>("0");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const fetchAptBalance = async (address?: string) => {
    const targetAddress = address || walletAddress;
    if (!targetAddress) {
      console.log("Cannot fetch balance: walletAddress not available");
      return;
    }

    try {
      console.log("=== FETCHING APT BALANCE ===");
      console.log("Address:", targetAddress);
      
      // Try testnet first (since user has balance there)
      const networks = [
        { name: 'testnet', url: 'https://fullnode.testnet.aptoslabs.com/v1' }
      ];
      
      for (const network of networks) {
        try {
          console.log(`\n--- Trying ${network.name} ---`);
          
          // Try getting account info first to check if account exists
          const accountUrl = `${network.url}/accounts/${targetAddress}`;
          console.log("Checking if account exists:", accountUrl);
          
          const accountResponse = await fetch(accountUrl);
          if (accountResponse.ok) {
            const accountData = await accountResponse.json();
            console.log("Account data:", accountData);
            
            // Try to get CoinStore resource
            const url = `${network.url}/accounts/${targetAddress}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`;
            console.log("Fetching CoinStore from URL:", url);
            
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              }
            });
            
            console.log(`CoinStore status: ${response.status} ${response.statusText}`);

            if (response.ok) {
              const data = await response.json();
              console.log("CoinStore data:", JSON.stringify(data, null, 2));
              
              if (data?.data?.coin?.value) {
                const balance = data.data.coin.value;
                // Convert from Octas to APT (1 APT = 100,000,000 Octas)
                const aptAmount = (parseInt(balance) / 100000000).toFixed(4);
                console.log(`✅ SUCCESS! Found ${aptAmount} APT on ${network.name}`);
                setAptBalance(aptAmount);
                return; // Exit once we found the balance
              } else {
                console.log("Response structure unexpected:", data);
              }
            } else {
              const errorText = await response.text();
              console.log(`CoinStore error:`, errorText.substring(0, 200));
              
              // If CoinStore doesn't exist but account exists, it means 0 balance (uninitialized)
              console.log(`⚠️ Account exists on ${network.name} but CoinStore not initialized. Balance is 0 or account needs to receive first transaction.`);
            }
          } else {
            console.log(`Account doesn't exist on ${network.name}`);
          }
        } catch (err) {
          console.log(`Exception on ${network.name}:`, err);
          continue; // Try next network
        }
      }
      
      // If we get here, no network had the account
      console.log("\n❌ FAILED: Account not found on any network");
      console.log("Please check:");
      console.log("1. Is your wallet connected to testnet?");
      console.log("2. Does your wallet address match:", targetAddress);
      setAptBalance("0.0000");
    } catch (error) {
      console.error("Fatal error fetching APT balance:", error);
      setAptBalance("0.0000");
    }
  };

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Fetch APT balance when wallet is connected
  useEffect(() => {
    if (walletAddress) {
      fetchAptBalance();
    }
  }, [walletAddress]);

  const checkWalletConnection = async () => {
    try {
      if (window.aptos) {
        const isConnected = await window.aptos.isConnected();
        if (isConnected) {
          const account = await window.aptos.account();
          setWalletAddress(account.address);
          
          // Immediately fetch balance with the address
          fetchAptBalance(account.address);
          
          // Fetch username from Aptos Names Service or use address as fallback
          try {
            const nameResponse = await fetch(
              `https://www.aptosnames.com/api/mainnet/v1/primary-name/${account.address}`
            );
            if (nameResponse.ok) {
              const nameData = await nameResponse.json();
              setUsername(nameData.name || null);
            }
          } catch {
            setUsername(null);
          }
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const connectWallet = async () => {
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

      // Request connection to Petra wallet - this will trigger the popup
      const response = await window.aptos.connect();
      
      if (response.address) {
        setWalletAddress(response.address);
        
        // Immediately fetch balance
        fetchAptBalance(response.address);
        
        // Try to fetch username from Aptos Names Service
        try {
          const nameResponse = await fetch(
            `https://www.aptosnames.com/api/mainnet/v1/primary-name/${response.address}`
          );
          if (nameResponse.ok) {
            const nameData = await nameResponse.json();
            setUsername(nameData.name || null);
          }
        } catch {
          setUsername(null);
        }
        
        toast({
          title: "Wallet Connected!",
          description: `Connected to ${response.address.slice(0, 6)}...${response.address.slice(-4)}`,
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error("Error connecting to Petra wallet:", error);
      
      // Only show error if user didn't reject the connection
      if (error.message && !error.message.includes('User rejected')) {
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect to Petra wallet. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.aptos) {
        await window.aptos.disconnect();
        setWalletAddress(null);
        setUsername(null);
        setAptBalance("0");
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected",
        });
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        username,
        aptBalance,
        isConnecting,
        connectWallet,
        disconnectWallet,
        fetchAptBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
