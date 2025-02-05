'use client';

import '@/styles/globals.scss';
import { Inter } from "next/font/google";
import { useState } from 'react';
import { SwapModal } from '@/components/SwapModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { UpProvider, useUpProvider } from '@/components/upProvider';
import { DM3Wrapper } from '@/components/DM3Wrapper';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { Chain } from 'wagmi/chains';

const inter = Inter({ subsets: ["latin"] });

// Define LUKSO chain
const lukso: Chain = {
  id: 42,
  name: 'LUKSO',
  network: 'lukso',
  nativeCurrency: {
    decimals: 18,
    name: 'LYX',
    symbol: 'LYX',
  },
  rpcUrls: {
    public: { http: ['https://lukso.rpc.thirdweb.com'] },
    default: { http: ['https://lukso.rpc.thirdweb.com'] },
  },
  blockExplorers: {
    default: { name: 'LUKSO Explorer', url: 'https://explorer.execution.mainnet.lukso.network' },
  },
} as const;

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [lukso],
  [publicProvider()]
);

// Set up wagmi config
const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

function AppContent({ children }: { children: React.ReactNode }) {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const [rocketXApiKey, setRocketXApiKey] = useState('ef2a9aef-8286-47c1-9067-9098e542232a');
  const { selectedAddress, setSelectedAddress } = useUpProvider();

  return (
    <>
      {/* Top Right Buttons */}
      <div className="fixed top-4 right-4 z-40 flex gap-2">
        {/* Message Button */}
        <button
          onClick={() => setShowMessenger(true)}
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors rounded-full p-3 shadow-lg"
          aria-label="Open Messages"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors rounded-full p-3 shadow-lg"
          aria-label="Open Settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        {/* Swap Button */}
        <button
          onClick={() => setIsSwapModalOpen(true)}
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors rounded-full p-3 shadow-lg"
          aria-label="Open Swap"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      {/* DM3 Messenger */}
      <DM3Wrapper 
        isOpen={showMessenger}
        onClose={() => setShowMessenger(false)}
      />

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onApiKeyChange={setRocketXApiKey}
        onAddressSelect={setSelectedAddress}
        currentApiKey={rocketXApiKey}
        currentAddress={selectedAddress}
      />

      {/* Swap Modal */}
      <SwapModal 
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        rocketXApiKey={rocketXApiKey}
      />

      {children}
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiConfig config={config}>
          <UpProvider>
            <AppContent>{children}</AppContent>
          </UpProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
