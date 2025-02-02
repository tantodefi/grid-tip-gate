import { ProfileSearch } from './ProfileSearch';
import { useState, useEffect } from 'react';
import { LuksoProfile } from './LuksoProfile';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApiKeyChange: (key: string) => void;
    onAddressSelect: (address: `0x${string}`) => void;
    currentApiKey?: string;
    currentAddress?: `0x${string}` | null;
}

export function SettingsPanel({ 
    isOpen, 
    onClose, 
    onApiKeyChange, 
    onAddressSelect,
    currentApiKey = '',
    currentAddress = null
}: SettingsPanelProps) {
    const [tempApiKey, setTempApiKey] = useState(currentApiKey);
    const [tempAddress, setTempAddress] = useState<`0x${string}` | null>(currentAddress);
    const [showSuccess, setShowSuccess] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Reset temp values when panel opens
    useEffect(() => {
        if (isOpen) {
            setTempApiKey(currentApiKey);
            setTempAddress(currentAddress);
            setHasChanges(false);
            setShowSuccess(false);
        }
    }, [isOpen, currentApiKey, currentAddress]);

    // Check for changes
    useEffect(() => {
        const apiKeyChanged = tempApiKey !== currentApiKey;
        const addressChanged = tempAddress !== currentAddress;
        setHasChanges(apiKeyChanged || addressChanged);
    }, [tempApiKey, tempAddress, currentApiKey, currentAddress]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (tempApiKey !== currentApiKey) {
            onApiKeyChange(tempApiKey);
        }
        if (tempAddress !== currentAddress && tempAddress !== null) {
            onAddressSelect(tempAddress);
        }
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
        }, 1500);
    };

    const handleAddressSelect = (address: `0x${string}`) => {
        setTempAddress(address);
    };

    const handleClearAddress = () => {
        setTempAddress(null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="relative w-full h-full max-w-4xl mx-auto flex flex-col">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden h-full">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-semibold">Settings</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Default Profile</h3>
                            <ProfileSearch onSelectAddress={handleAddressSelect} />
                            {tempAddress && tempAddress !== currentAddress && (
                                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-green-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-green-600">New profile selected</span>
                                        </div>
                                        <button
                                            onClick={handleClearAddress}
                                            className="text-gray-500 hover:text-gray-700 text-sm"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="mt-3">
                                        <LuksoProfile address={tempAddress} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">RocketX API Key</h3>
                                <a 
                                    href="https://app.rocketx.exchange/partner" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Get API key here
                                </a>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter your RocketX API key"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={tempApiKey}
                                onChange={(e) => setTempApiKey(e.target.value)}
                            />
                            {tempApiKey && tempApiKey !== currentApiKey && (
                                <p className="mt-2 text-sm text-green-600">
                                    ✓ New API key entered
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            {showSuccess ? (
                                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-md flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Settings saved successfully!
                                </div>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    className={`px-4 py-2 rounded-md ${
                                        hasChanges
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    } transition-colors`}
                                    disabled={!hasChanges}
                                >
                                    Save Changes
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 