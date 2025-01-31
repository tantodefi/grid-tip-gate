/**
 * A component that facilitates LYX token transfers to a specified LUKSO address.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.selectedAddress] - Optional hex address of the donation recipient.
 *                                          If not provided, uses the first address from context.
 * 
 * Features:
 * - Amount validation (${minAmount}-${maxAmount} LYX)
 * - Integration with UP Browser wallet
 * - Recipient profile display using LuksoProfile
 * - Real-time amount validation
 * - Whitelist tracking for donors
 * 
 * @requires useUpProvider - Hook for UP Browser wallet integration
 * @requires LuksoProfile - Component for displaying LUKSO profile information
 * @requires viem - For handling blockchain transactions
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseUnits } from 'viem';
import { useUpProvider } from './upProvider';
import { LuksoProfile } from './LuksoProfile';
import { ERC725 } from '@erc725/erc725.js';
import erc725schema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';

const minAmount = 0.42;
const maxAmount = 1000;
const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';
const RPC_ENDPOINT = 'https://lukso.rpc.thirdweb.com';

interface WhitelistedUser {
  address: string;
  name?: string;
  imgUrl?: string;
}

interface DonateProps {
  selectedAddress?: `0x${string}` | null;
}

interface LSP3ProfileData {
  LSP3Profile: {
    name?: string;
    profileImage?: Array<{
      url: string;
    }>;
  };
}

interface ERC725Response {
  value: LSP3ProfileData;
}

export function Donate({ selectedAddress }: DonateProps) {
  const { client, accounts, contextAccounts, walletConnected } =
    useUpProvider();
  const [amount, setAmount] = useState<number>(minAmount);
  const [error, setError] = useState('');
  const [recipientAddress, setRecipientAddress] = useState<`0x${string}` | null | undefined>(selectedAddress);
  const [whitelistedUsers, setWhitelistedUsers] = useState<WhitelistedUser[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    setRecipientAddress(selectedAddress);
  }, [selectedAddress]);

  const effectiveRecipientAddress = recipientAddress || contextAccounts[0];

  const validateAmount = useCallback((value: number) => {
    if (value < minAmount) {
      setError(`Amount must be at least ${minAmount} LYX.`);
    } else if (value > maxAmount) {
      setError(`Amount cannot exceed ${maxAmount} LYX.`);
    } else {
      setError('');
    }
    setAmount(value);
  }, []);

  useEffect(() => {
    validateAmount(amount);
  }, [amount, validateAmount]);

  const fetchProfileData = async (address: string): Promise<WhitelistedUser> => {
    try {
      const config = {
        ipfsGateway: IPFS_GATEWAY,
        jsonRpcVersion: '2.0',
        timeout: 30000
      };

      const provider = new ERC725(erc725schema, address as `0x${string}`, RPC_ENDPOINT, config);
      const fetchedData = await provider.fetchData('LSP3Profile') as ERC725Response;

      if (fetchedData?.value?.LSP3Profile) {
        const profile = fetchedData.value.LSP3Profile;
        return {
          address,
          name: profile.name || undefined,
          imgUrl: profile.profileImage?.[0]?.url
            ? profile.profileImage[0].url.replace('ipfs://', IPFS_GATEWAY)
            : undefined
        };
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    return { address };
  };

  const sendToken = async () => {
    if (!client || !walletConnected || !amount || !effectiveRecipientAddress || !accounts[0]) return;
    
    setIsProcessing(true);
    try {
      const tx = await client.sendTransaction({
        account: accounts[0] as `0x${string}`,
        to: effectiveRecipientAddress as `0x${string}`,
        value: parseUnits(amount.toString(), 18),
      });

      // After successful transaction, add donor to whitelist and grant access
      const donorProfile = await fetchProfileData(accounts[0]);
      setWhitelistedUsers(prev => {
        // Check if user is already whitelisted
        if (!prev.some(user => user.address.toLowerCase() === accounts[0].toLowerCase())) {
          return [...prev, donorProfile];
        }
        return prev;
      });
      setHasAccess(true);
    } catch (error) {
      console.error('Transaction failed:', error);
      setError('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOnInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseFloat(e.target.value);
      validateAmount(value);
    },
    [validateAmount]
  );

  return (
    <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-6">
      <div className="rounded-xl">
        <div className="flex flex-row items-center justify-center gap-2">
          <LuksoProfile address={effectiveRecipientAddress} hasAccess={hasAccess} />
        </div>
      </div>

      {/* Amount Input and Donate Button Section */}
      <div className="flex gap-2">
        <div className="flex-1">
          <lukso-input
            value={minAmount.toString()}
            type="number"
            min={minAmount}
            max={maxAmount}
            onInput={handleOnInput}
            is-full-width
            is-disabled={!walletConnected || isProcessing}
            className="mt-2"
          ></lukso-input>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <lukso-button
          onClick={sendToken}
          variant="primary"
          size="medium"
          className="mt-2"
          disabled={!walletConnected || isProcessing}
        >
          {isProcessing ? "Processing..." : `Donate ${amount} LYX`}
        </lukso-button>
      </div>

      {/* Whitelisted Users Section */}
      {whitelistedUsers.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Whitelisted Donors</h3>
          <div className="space-y-4">
            {whitelistedUsers.map((user) => (
              <div key={user.address} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                {user.imgUrl && (
                  <lukso-card
                    variant="profile"
                    profile-url={user.imgUrl}
                    shadow="small"
                    border-radius="small"
                    width={40}
                    height={40}
                  />
                )}
                <div>
                  <lukso-username
                    name={user.name || ''}
                    address={user.address}
                    size="medium"
                    max-width="200"
                    prefix="@"
                  ></lukso-username>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
