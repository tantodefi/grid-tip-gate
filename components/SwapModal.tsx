import { useState } from 'react';

interface SwapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SwapModal({ isOpen, onClose }: SwapModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="relative w-full h-full max-w-4xl mx-auto flex flex-col">
                {/* Close button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                {/* RocketX Widget */}
                <div className="flex-1 bg-white rounded-lg shadow-xl overflow-hidden">
                    <iframe 
                        height="100%" 
                        width="100%" 
                        src="https://widget.rocketx.exchange/swap/ETHEREUM.ethereum/LUKSO.lukso-token-2/1?rx_p=1&rx_t=dark&rx_p_c=ECF335&rx_k=ef2a9aef-8286-47c1-9067-9098e542232a"
                        className="w-full h-full"
                    />
                </div>
            </div>
        </div>
    );
} 