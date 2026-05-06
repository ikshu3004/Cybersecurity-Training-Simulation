/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { Lock, Signal, SignalHigh, SignalLow } from 'lucide-react';

interface NetworkPopupProps {
    onClose: () => void;
}

// A popup interface for managing WiFi connections and simulating network attacks.
const NetworkPopup: React.FC<NetworkPopupProps> = () => {
    /* --- Hooks & Local State --- */
    const { availableNetworks, networkState, connectToNetwork, disconnect } = useOS();
    const [selectedSSID, setSelectedSSID] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // Attempts to connect to the selected network with simulated delay.
    const handleConnect = () => {
        if (!selectedSSID) return;

        setIsConnecting(true);
        setError(null);

        // Simulate network delay
        setTimeout(() => {
            const result = connectToNetwork(selectedSSID, password);
            setIsConnecting(false);

            if (result.success) {
                setPassword('');
            } else {
                setError(result.message || 'Connection failed');
            }
        }, 1500);
    };

    /* --- UI Helpers --- */
    const getSignalIcon = (strength: number) => {
        if (strength > 80) return <SignalHigh size={16} />;
        if (strength > 50) return <Signal size={16} />;
        return <SignalLow size={16} />;
    };

    /* ==========================================================================
       RENDER RETURN
       ========================================================================== */
    return (
        <div
            className="absolute bottom-12 right-2 w-80 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 text-white rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200 z-[200]"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="p-4 bg-[#252525]/50 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-semibold text-sm">Networks</h3>
                {/* Airplane mode toggle acting as placeholder */}
                <div className="flex gap-2">
                    {/* ... */}
                </div>
            </div>

            {/* Network List */}
            <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1">
                {availableNetworks.map((net) => {
                    const isSelected = selectedSSID === net.ssid;
                    const isConnected = networkState.isConnected && networkState.ssid === net.ssid;

                    return (
                        <div
                            key={net.ssid}
                            className={`flex flex-col p-2 rounded cursor-pointer transition-colors ${isSelected || isConnected ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            onClick={() => {
                                if (isConnected) return; // Already connected
                                setSelectedSSID(net.ssid);
                                setPassword('');
                                setError(null);
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-gray-300">
                                    {getSignalIcon(net.strength)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{net.ssid}</div>
                                    {isConnected && <div className="text-xs text-green-400">Connected, secured</div>}
                                    {isSelected && !isConnected && <div className="text-xs text-gray-400">Secured</div>}
                                </div>
                                {net.isLocked && <Lock size={14} className="text-gray-500" />}
                            </div>

                            {/* Connection Controls (Expand if selected) */}
                            {isSelected && !isConnected && (
                                <div className="mt-3 pl-7 pr-2 space-y-2 animate-in slide-in-from-top-2 fade-in duration-150">
                                    {/* Auto-connect checkbox mock */}
                                    <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                        <input type="checkbox" className="rounded bg-white/10 border-gray-600" />
                                        Connect automatically
                                    </label>

                                    {/* Password Input */}
                                    {(net.isLocked || net.type === 'spoofed') && (
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter network security key"
                                            className="w-full bg-[#101010] border-b-2 border-gray-600 focus:border-blue-500 outline-none text-sm px-2 py-1 transition-colors"
                                            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                                        />
                                    )}

                                    {/* Actions */}
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedSSID(null); }}
                                            className="px-4 py-1.5 bg-[#333] hover:bg-[#444] text-xs rounded transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleConnect(); }}
                                            disabled={isConnecting}
                                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isConnecting ? 'Verifying...' : 'Connect'}
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="text-red-400 text-xs mt-1 animate-pulse">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Disconnect Button if Connected */}
                            {isConnected && (
                                <div className="mt-2 pl-7 flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Properties</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); disconnect(); }}
                                        className="px-4 py-1.5 bg-[#333] hover:bg-[#444] text-xs rounded transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#151515] border-t border-white/5 flex justify-between text-xs text-blue-400 underline cursor-pointer">
                <span>Network & Internet settings</span>
                <span>Change adapter options</span>
            </div>
        </div>
    );
};

export default NetworkPopup;
