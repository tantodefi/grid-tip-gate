'use client';

import { useEffect, useState } from 'react';
import { useUpProvider } from './upProvider';
import dynamic from 'next/dynamic';

// Dynamically import the XMTP client with no SSR
const XMTPClientComponent = dynamic(
    () => import('./XMTPClientComponent'),
    { ssr: false }
);

interface XMTPChatProps {
    isOpen: boolean;
    onClose: () => void;
}

export function XMTPChat({ isOpen, onClose }: XMTPChatProps) {
    const [mounted, setMounted] = useState(false);
    const { accounts, walletConnected } = useUpProvider();
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && !walletConnected) {
            setShowError(true);
            const timer = setTimeout(() => setShowError(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, walletConnected]);

    if (!isOpen || !mounted) return null;

    if (!walletConnected || !accounts.length) {
        return (
            <div className="fixed inset-0 w-screen h-screen bg-white z-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <h2 className="text-xl font-semibold mb-4">Connect Your Universal Profile</h2>
                    <p className="text-gray-600 mb-4">Please connect your Universal Profile to use the messenger.</p>
                    {showError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            No Universal Profile found. Please connect using the UP Browser extension.
                        </div>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 z-[60] bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close Messages"
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
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        );
    }

    return <XMTPClientComponent onClose={onClose} />;
} 