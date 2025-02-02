/**
 * ProfileSearch Component
 * 
 * A searchable interface for LUKSO Universal Profiles that allows users to search and select
 * blockchain addresses associated with profiles.
 * 
 * Features:
 * - Auto-search triggers when exactly 3 characters are entered
 * - Manual search available via Enter key
 * - Displays profile images with blockies fallback
 * - Shows profile name, full name, and address in results
 * 
 * @component
 * @param {Object} props
 * @param {(address: `0x${string}`) => void} props.onSelectAddress - Callback function triggered when a profile is selected
 */
'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { request, gql } from 'graphql-request';
import makeBlockie from 'ethereum-blockies-base64';
import { useUpProvider } from './upProvider';

const gqlQuery = gql`
  query MyQuery($id: String!) {
    search_profiles(args: { search: $id }) {
      name
      fullName
      id
      profileImages(
        where: { error: { _is_null: true } }
        order_by: { width: asc }
      ) {
        width
        src
        url
        verified
      }
    }
  }
`;

type Profile = {
  name?: string;
  id: string;
  fullName?: string;
  profileImages?: {
    width: number;
    src: string;
    url: string;
    verified: boolean;
  }[];
};

type SearchProps = {
  onSelectAddress: (address: `0x${string}`) => void;
};

export function ProfileSearch({ onSelectAddress }: SearchProps) {
  const { setIsSearching } = useUpProvider();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = useCallback(
    async (searchQuery: string, forceSearch: boolean = false) => {
      setQuery(searchQuery);

      if (searchQuery.length < 3) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      // Only search automatically for exactly 3 chars, or when forced (Enter pressed)
      if (searchQuery.length > 3 && !forceSearch) {
        return;
      }

      setLoading(true);
      try {
        const { search_profiles: data } = (await request(
          'https://envio.lukso-testnet.universal.tech/v1/graphql',
          gqlQuery,
          { id: searchQuery }
        )) as { search_profiles: Profile[] };

        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query, true);
    }
  };

  const handleSelectProfile = (profile: Profile) => {
    try {
      // The profile.id should be an Ethereum address
      const address = profile.id as `0x${string}`;
      onSelectAddress(address);
      setShowDropdown(false);
      setQuery('');
    } catch (error) {
      console.error('Invalid address:', error);
    }
  };

  const getProfileImage = (profile: Profile) => {
    if (profile.profileImages && profile.profileImages.length > 0) {
      const imageUrl = profile.profileImages[0].url || profile.profileImages[0].src;
      // Handle IPFS URLs
      const finalUrl = imageUrl.startsWith('ipfs://')
        ? `https://api.universalprofile.cloud/ipfs/${imageUrl.slice(7)}`
        : imageUrl;

      return (
        <Image
          src={finalUrl}
          alt={`${profile.name || profile.id} avatar`}
          width={40}
          height={40}
          className="mt-1 rounded-full flex-shrink-0 object-cover"
          onError={(e) => {
            // Fallback to blockie if image fails to load
            e.currentTarget.src = makeBlockie(profile.id);
          }}
        />
      );
    }

    return (
      <Image
        src={makeBlockie(profile.id)}
        alt={`${profile.name || profile.id} avatar`}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full flex-shrink-0"
      />
    );
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter 3 characters to search..."
          className="w-full p-2 border border-gray-300 rounded-md"
          disabled={loading}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-[180px] overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              className="w-full px-2 py-4 text-left hover:bg-gray-100 flex items-start gap-4 border-b border-gray-100 last:border-0 transition-colors"
              onClick={() => handleSelectProfile(result)}
            >
              {getProfileImage(result)}
              <div className="flex-1 min-w-0">
                {result.fullName && (
                  <div className="text-sm text-gray-600 truncate mt-0.5">
                    {result.fullName}
                  </div>
                )}
                <div className="text-sm text-gray-500 truncate">
                  {result.id}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
