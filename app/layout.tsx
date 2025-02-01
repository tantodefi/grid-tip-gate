'use client';

import '@/styles/globals.scss';
import { Inter } from "next/font/google";
import { useState } from 'react';
import { SwapModal } from '@/components/SwapModal';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Swap Button */}
        <button
          onClick={() => setIsSwapModalOpen(true)}
          className="fixed top-4 right-4 z-40 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors rounded-full p-3 shadow-lg"
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

        {/* Swap Modal */}
        <SwapModal 
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
        />

        {children}
      </body>
    </html>
  );
}
