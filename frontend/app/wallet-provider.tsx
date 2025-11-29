'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { 
  AptosWalletAdapterProvider, 
  useWallet as useAptosWallet 
} from '@aptos-labs/wallet-adapter-react';
// 1. Updated Import: Added ClientConfig
import { Aptos, AptosConfig, Network, ClientConfig } from "@aptos-labs/ts-sdk";

// 2. 🔑 PASTE YOUR GEOMI/APTOS API KEY HERE
// Replace this string with the key you copied (e.g., "aptos_testnet_...")
const APTOS_API_KEY = "AG-FA7RJFEHAYCUYF84ANRRVSFEE5TGTB7ZV"; 

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

function WalletProviderContent({ children }: { children: React.ReactNode }) {
  const { account, connected, connect, disconnect, network } = useAptosWallet();
  const [username, setUsername] = useState<string | null>(null);
  const [aptBalance, setAptBalance] = useState<string>("0.00");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // 3. Updated Client Generator to use the API Key
  const getAptosClient = () => {
    const currentNetwork = network?.name?.toLowerCase() === 'mainnet' 
      ? Network.MAINNET 
      : Network.TESTNET;

    // Define the client config with your key
    const clientConfig: ClientConfig = {
      API_KEY: APTOS_API_KEY,
    };

    // Pass clientConfig into the AptosConfig
    return new Aptos(new AptosConfig({ 
      network: currentNetwork,
      clientConfig: clientConfig 
    }));
  };

  const fetchAptBalance = async () => {
    if (!account?.address) return;

    try {
      const aptos = getAptosClient(); // Uses the key now!
      
      const addressString = String(account.address);
      
      const result = await aptos.view({
        payload: {
          function: "0x1::coin::balance",
          typeArguments: ["0x1::aptos_coin::AptosCoin"],
          functionArguments: [addressString],
        },
      });

      const balanceInOctas = Number(result[0]);
      const formattedBalance = (balanceInOctas / 100_000_000).toFixed(2);
      
      console.log(`✅ Balance: ${formattedBalance} APT`);
      setAptBalance(formattedBalance);

    } catch (error) {
      console.error("Error fetching balance:", error);
      setAptBalance("0.00");
    }
  };

  const fetchUsername = async (address: string | any) => {
    try {
        const aptos = getAptosClient(); // Uses the key now!
        const addressString = String(address);
        const name = await aptos.ans.getPrimaryName({
            address: addressString,
        });
        if (name) setUsername(name);
    } catch (error) {
      setUsername(null);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      await connect('Petra' as any); 
    } catch (error: any) {
      console.error("Failed to connect:", error);
      toast({
        title: "Connection Failed",
        description: error?.message || "Could not connect to Petra",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
      setUsername(null);
      setAptBalance("0.00");
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  useEffect(() => {
    if (connected && account?.address) {
      fetchAptBalance();
      fetchUsername(account.address);
    } else {
      setAptBalance("0.00");
      setUsername(null);
    }
  }, [connected, account, network]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress: account?.address ? String(account.address) : null,
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

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = [new PetraWallet()];

  return (
    <AptosWalletAdapterProvider wallets={wallets} autoConnect={true}>
      <WalletProviderContent>{children}</WalletProviderContent>
    </AptosWalletAdapterProvider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}