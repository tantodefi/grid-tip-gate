'use client';

import { useEffect, useState } from 'react';
import { useUpProvider } from './upProvider';
import { Signer } from '@xmtp/xmtp-js';

interface XMTPClientComponentProps {
    onClose: () => void;
}

// Custom signer for Universal Profile
class UPSigner implements Signer {
    constructor(private provider: any, private address: string) {}

    async getAddress(): Promise<string> {
        return this.address;
    }

    async signMessage(message: string | ArrayLike<number>): Promise<string> {
        const messageArray = typeof message === 'string' 
            ? new TextEncoder().encode(message)
            : new Uint8Array(message);
        const messageHex = '0x' + Buffer.from(messageArray).toString('hex');
        const signature = await this.provider.request({
            method: 'personal_sign',
            params: [messageHex, this.address],
        });
        return signature;
    }
}

export default function XMTPClientComponent({ onClose }: XMTPClientComponentProps) {
    const { accounts, provider } = useUpProvider();
    const [client, setClient] = useState<any>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [currentConversation, setCurrentConversation] = useState<any>(null);
    const [newMessage, setNewMessage] = useState('');
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        const initXmtp = async () => {
            if (!provider || !accounts[0]) return;

            try {
                // Set up global polyfills
                if (typeof window !== 'undefined') {
                    const { Buffer } = await import('buffer/');
                    const process = await import('process/browser');
                    const util = await import('util/');
                    
                    Object.assign(window, {
                        Buffer,
                        process,
                        util,
                    });

                    // Add nodeCrypto to global scope
                    (globalThis as any).nodeCrypto = await import('crypto-browserify');
                }

                // Dynamically import XMTP client
                const { Client } = await import('@xmtp/xmtp-js');

                // Create a custom signer for Universal Profile
                const signer = new UPSigner(provider, accounts[0]);

                // Create the XMTP client with specific configuration
                const xmtp = await Client.create(signer, { 
                    env: 'production',
                    skipContactPublishing: true,
                    persistConversations: true
                });
                
                setClient(xmtp);

                // List conversations
                const convos = await xmtp.conversations.list();
                setConversations(convos);
            } catch (error) {
                console.error('Error initializing XMTP:', error);
                setShowError(true);
            }
        };

        if (accounts[0]) {
            initXmtp();
        }

        // Cleanup function
        return () => {
            localStorage.removeItem(`xmtp:keys:${accounts[0]}`);
        };
    }, [accounts, provider]);

    const loadMessages = async (conversation: any) => {
        if (!conversation) return;
        const msgs = await conversation.messages();
        setMessages(msgs);
        setCurrentConversation(conversation);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentConversation || !newMessage.trim()) return;

        try {
            await currentConversation.send(newMessage);
            setNewMessage('');
            // Reload messages
            await loadMessages(currentConversation);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="fixed inset-0 w-screen h-screen bg-white z-50 flex">
            {/* Sidebar with conversations */}
            <div className="w-1/4 border-r border-gray-200 p-4 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Conversations</h2>
                <div className="space-y-2">
                    {conversations.map((conversation, index) => (
                        <button
                            key={index}
                            onClick={() => loadMessages(conversation)}
                            className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 ${
                                currentConversation === conversation ? 'bg-gray-100' : ''
                            }`}
                        >
                            <p className="font-medium truncate">{conversation.peerAddress}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[60] bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
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

                {/* Messages area */}
                <div className="flex-1 p-4 overflow-y-auto">
                    {currentConversation ? (
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${
                                        message.senderAddress === accounts[0]
                                            ? 'justify-end'
                                            : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`max-w-[70%] p-3 rounded-lg ${
                                            message.senderAddress === accounts[0]
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100'
                                        }`}
                                    >
                                        <p>{message.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>

                {/* Message input */}
                {currentConversation && (
                    <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
} 