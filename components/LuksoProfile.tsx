/**
 * LuksoProfile Component - Renders a profile card for a LUKSO Universal Profile from the web-components library using ERC725js library
 * 
 * This component fetches and displays profile information from a LUKSO Universal Profile,
 * including the profile image, background image, and full name. It uses the ERC725js library
 * to fetch profile metadata from the blockchain.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.address - The LUKSO Universal Profile address to fetch data from
 * 
 * @remarks
 * - Uses the LUKSO testnet RPC endpoint
 * - Falls back to a default avatar if no profile image is found
 * - Handles loading states and error cases gracefully
 */

import { useEffect, useState } from 'react';
import { ERC725 } from '@erc725/erc725.js';
import erc725schema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';
import { useUpProvider } from './upProvider';

// Add TypeScript declarations for LUKSO
declare global {
    interface Window {
        lukso?: {
            request: (args: { method: string; params?: any[] }) => Promise<any>;
        };
    }
}

// Constants for the IPFS gateway and RPC endpoint for the LUKSO mainnet
const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';
const RPC_ENDPOINT = 'https://lukso.rpc.thirdweb.com';
const DEFAULT_ADDRESS = '0x8008D993631C94B5CE00e102D9a55C9d0eb099cB'; //set the address for tip recipient
const MINIMUM_DONATION = 0.42;

interface LuksoProfileProps {
    address?: string;
    hasAccess?: boolean;
}

export function LuksoProfile({ address: _, hasAccess = false }: LuksoProfileProps) {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const { setIsSearching, isSearching } = useUpProvider();
    useEffect(() => {
        if (isSearching) setIsSearching(false);
    }, [isSearching, setIsSearching]);
    const [profileData, setProfileData] = useState<{
        imgUrl: string;
        fullName: string;
        background: string;
        profileAddress: string;
        isLoading: boolean;
    }>({
        imgUrl: 'https://tools-web-components.pages.dev/images/sample-avatar.jpg',
        fullName: 'Loading...',
        background: 'https://tools-web-components.pages.dev/images/sample-background.jpg',
        profileAddress: DEFAULT_ADDRESS,
        isLoading: true,
    });

    useEffect(() => {
        async function fetchProfileImage() {
            setProfileData(prev => ({ ...prev, isLoading: true }));

            try {
                console.log('Attempting to connect to LUKSO mainnet:', RPC_ENDPOINT);
                const config = { 
                    ipfsGateway: IPFS_GATEWAY,
                    jsonRpcVersion: '2.0',
                    timeout: 30000 // 30 seconds timeout
                };
                
                const provider = new ERC725(erc725schema, DEFAULT_ADDRESS, RPC_ENDPOINT, config);
                console.log('Provider initialized, fetching profile data...');
                
                const fetchedData = await provider.fetchData('LSP3Profile');
                console.log('Profile data fetched:', fetchedData);

                if (
                    fetchedData?.value &&
                    typeof fetchedData.value === 'object' &&
                    'LSP3Profile' in fetchedData.value
                ) {
                    const profileImagesIPFS = fetchedData.value.LSP3Profile.profileImage;
                    const fullName = fetchedData.value.LSP3Profile.name;
                    const profileBackground = fetchedData.value.LSP3Profile.backgroundImage;

                    setProfileData({
                        fullName: fullName || 'Unknown',
                        imgUrl: profileImagesIPFS?.[0]?.url
                            ? profileImagesIPFS[0].url.replace('ipfs://', IPFS_GATEWAY)
                            : 'https://tools-web-components.pages.dev/images/sample-avatar.jpg',
                        background: profileBackground?.[0]?.url
                            ? profileBackground[0].url.replace('ipfs://', IPFS_GATEWAY)
                            : '',
                        profileAddress: DEFAULT_ADDRESS,
                        isLoading: false,
                    });
                }
            } catch (error: any) {
                console.error('Detailed error fetching profile:', {
                    message: error.message,
                    endpoint: RPC_ENDPOINT,
                    address: DEFAULT_ADDRESS
                });
                setProfileData(prev => ({
                    ...prev,
                    fullName: 'Error loading profile',
                    profileAddress: DEFAULT_ADDRESS,
                    isLoading: false,
                }));
            }
        }

        fetchProfileImage();
    }, []);

    

    // Donation handling moved to Donate component

    const ProtectedContent = () => (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">🎉 Protected Content Unlocked!</h2>
            <p className="text-lg mb-4">Thank you for your support! Be early to <a href="https://basedup.world/" className="text-blue-500">basedup.world 🔵</a></p>
            <iframe src="https://tokenterminal.com/explorer/" className="w-full h-96"></iframe>
        </div>
    );

    return (
        <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl font-bold mb-4">Welcome to Tip Gate</h1>
            
            {!hasAccess ? (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-lg">Tip {MINIMUM_DONATION} LYX to see gated content</p>
                    {/* <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            min={MINIMUM_DONATION}
                            step="0.01"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(Number(e.target.value))}
                            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isProcessing}
                        />
                        <lukso-button
                            onClick={handleDonation}
                            variant="primary"
                            size="small"
                            class={isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                            {isProcessing ? "Processing..." : walletAddress ? "Donate" : "Connect & Donate"}
                        </lukso-button>
                    </div> */}
                    {walletAddress !== null && (
                        <p className="text-sm text-gray-600">Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                    )}
                    <lukso-card
                        variant="profile"
                        background-url={profileData.background}
                        profile-url={profileData.imgUrl}
                        shadow="small"
                        border-radius="small"
                        width={300}
                        height={200}
                    >
                        <div slot="content" className="flex flex-col items-center">
                            {!profileData.isLoading && (
                                <div className="pb-4">
                                    <lukso-username
                                        name={profileData.fullName}
                                        address={profileData.profileAddress}
                                        size="large"
                                        max-width="200"
                                        prefix="@"
                                    ></lukso-username>
                                </div>
                            )}
                        </div>
                    </lukso-card>
                </div>
            ) : (
                <ProtectedContent />
            )}
        </div>
    );
} 
