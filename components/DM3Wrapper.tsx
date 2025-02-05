'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useUpProvider } from './upProvider';

const DM3 = dynamic(
  () => import('@dm3-org/dm3-messenger-widget').then((mod) => mod.DM3),
  { ssr: false }
);

interface DM3WrapperProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DM3Wrapper({ isOpen, onClose }: DM3WrapperProps) {
    const [mounted, setMounted] = useState(false);
    const { accounts, walletConnected, provider, client } = useUpProvider();
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

    const config = {
        userEnsSubdomain: process.env.NEXT_PUBLIC_USER_ENS_SUBDOMAIN as string,
        addressEnsSubdomain: process.env.NEXT_PUBLIC_ADDR_ENS_SUBDOMAIN as string,
        resolverBackendUrl: process.env.NEXT_PUBLIC_RESOLVER_BACKEND as string,
        profileBaseUrl: process.env.NEXT_PUBLIC_PROFILE_BASE_URL as string,
        defaultDeliveryService: process.env.NEXT_PUBLIC_DEFAULT_DELIVERY_SERVICE as string,
        backendUrl: process.env.NEXT_PUBLIC_BACKEND as string,
        chainId: '1',
        defaultServiceUrl: process.env.NEXT_PUBLIC_DEFAULT_SERVICE as string,
        ethereumProvider: {
            request: provider?.request?.bind(provider),
            on: provider?.on?.bind(provider),
            removeListener: provider?.removeListener?.bind(provider),
            selectedAddress: accounts[0],
            isMetaMask: false,
            isUniversalProfileExtension: true,
            networkVersion: '1'
        },
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
        publicVapidKey: process.env.NEXT_PUBLIC_PUBLIC_VAPID_KEY as string,
        nonce: process.env.NEXT_PUBLIC_NONCE as string,
        defaultContact: 'help.dm3.eth',
        showAlways: true,
        hideFunction: undefined, 
        showContacts: true,
        theme: undefined, 
        signInImage: undefined,
        siwe: undefined,
        // siwe: {
        //     domain: window.location.host,
        //     uri: window.location.origin,
        //     address: accounts[0],
        //     statement: "Sign this message to access DM3 Messenger",
        //     version: "1",
        //     chainId: 1,
        //     nonce: Math.random().toString(36).slice(2),
        //     issuedAt: new Date().toISOString()
        // },
        network: 'mainnet',
        mainnetProvider: {
            request: provider?.request?.bind(provider),
            on: provider?.on?.bind(provider),
            removeListener: provider?.removeListener?.bind(provider),
            selectedAddress: accounts[0],
            isMetaMask: false,
            isUniversalProfileExtension: true,
            networkVersion: '1'
        }
    };

    return (
        <div className="fixed inset-0 w-screen h-screen bg-white z-50">
            {/* Close button */}
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

            {/* DM3 Widget */}
            <div className="w-full h-full">
                <DM3 {...(config as any)} />
            </div>
        </div>
    );
} 