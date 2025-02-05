/**
 * @component UpProvider
 * @description Context provider that manages Universal Profile (UP) wallet connections and state
 * for LUKSO blockchain interactions on Grid. It handles wallet connection status, account management, and chain
 * information while providing real-time updates through event listeners.
 *
 * @provides {UpProviderContext} Context containing:
 * - provider: UP-specific wallet provider instance
 * - client: Viem wallet client for blockchain interactions
 * - chainId: Current blockchain network ID
 * - accounts: Array of connected wallet addresses
 * - contextAccounts: Array of Universal Profile accounts
 * - walletConnected: Boolean indicating active wallet connection
 * - selectedAddress: Currently selected address for transactions
 * - isSearching: Loading state indicator
 */
'use client';

import { createClientUPProvider } from "@lukso/up-provider";
import { createWalletClient, custom } from "viem";
import { lukso } from "viem/chains";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isUniversalProfileExtension?: boolean;
    };
  }
}

interface UpProviderContext {
  provider: any;
  client: any;
  chainId: number;
  accounts: Array<`0x${string}`>;
  contextAccounts: Array<`0x${string}`>;
  walletConnected: boolean;
  selectedAddress: `0x${string}` | null;
  setSelectedAddress: (address: `0x${string}` | null) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  error: string | null;
}

const UpContext = createContext<UpProviderContext | undefined>(undefined);

export function useUpProvider() {
  const context = useContext(UpContext);
  if (!context) {
    throw new Error("useUpProvider must be used within a UpProvider");
  }
  return context;
}

interface UpProviderProps {
  children: ReactNode;
}

export function UpProvider({ children }: UpProviderProps) {
  const [provider, setProvider] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [chainId, setChainId] = useState<number>(0);
  const [accounts, setAccounts] = useState<Array<`0x${string}`>>([]);
  const [contextAccounts, setContextAccounts] = useState<Array<`0x${string}`>>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<`0x${string}` | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider and client
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initProvider = async () => {
      try {
        const upProvider = createClientUPProvider();
        
        // Simple check if provider is available
        if (!upProvider) {
          console.error("UP Provider not available");
          return;
        }

        setProvider(upProvider);

        const walletClient = createWalletClient({
          chain: lukso,
          transport: custom(upProvider),
        });

        setClient(walletClient);

        // Try to get initial accounts
        try {
          const addresses = await walletClient.getAddresses();
          if (addresses && addresses.length > 0) {
            setAccounts(addresses);
            setWalletConnected(true);
            setError(null);
          }
        } catch (accountError) {
          console.log("No accounts available yet");
        }

      } catch (err) {
        console.error("Provider initialization:", err);
      }
    };

    initProvider();
  }, []);

  useEffect(() => {
    if (!provider || !client) return;

    const handleAccountsChanged = async () => {
      try {
        const addresses = await client.getAddresses();
        setAccounts(addresses);
        setWalletConnected(addresses.length > 0);
        setError(null);
      } catch (error) {
        console.log("Error getting accounts:", error);
        setWalletConnected(false);
      }
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", (id: number) => setChainId(id));

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", (id: number) => setChainId(id));
    };
  }, [provider, client]);

  return (
    <UpContext.Provider
      value={{
        provider,
        client,
        chainId,
        accounts,
        contextAccounts,
        walletConnected,
        selectedAddress,
        setSelectedAddress,
        isSearching,
        setIsSearching,
        error
      }}
    >
      <div className="min-h-screen flex flex-col items-center justify-center">
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            <p>{error}</p>
          </div>
        )}
        {children}
      </div>
    </UpContext.Provider>
  );
} 