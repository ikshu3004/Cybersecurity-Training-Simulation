/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React from 'react';
import { useOS } from '../context/OSContext';
import { ChevronLeft, Zap, Radio, ShieldAlert, Bug, Signal } from 'lucide-react';
import { AudioSettings } from '../types';

interface SettingsMenuProps {
    onBack: () => void;
}

// A specialized menu for managing audio settings with an industrial, retro aesthetic.
const SettingsMenu: React.FC<SettingsMenuProps> = ({ onBack }) => {
    /* --- Hooks & Configuration --- */
    const { audioSettings, updateAudioSetting } = useOS();

    const categories: { key: keyof AudioSettings, label: string, icon: any }[] = [
        { key: 'notifications', label: 'Notifications', icon: Zap },
        { key: 'systemTrack', label: 'System Track (IR)', icon: Radio },
        { key: 'ransomware', label: 'Ransomware', icon: ShieldAlert },
        { key: 'malware', label: 'Malware Spikes', icon: Bug },
        { key: 'network', label: 'Network Attacks', icon: Signal },
        { key: 'desktopNoise', label: 'Desktop Noise', icon: Radio },
        { key: 'kaliTrack', label: 'Kali Track', icon: Radio },
        { key: 'reportTrack', label: 'Report Track', icon: Zap },
    ];

    /* ==========================================================================
       RENDER RETURN
       ========================================================================== */
    return (
        <div className="w-full max-w-7xl px-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 max-h-[90vh]">
            {/* FNAF 3 Style Back Button */}
            <button
                onClick={onBack}
                className="self-start mb-4 text-green-500/60 hover:text-green-400 font-mono flex items-center gap-2 hover:underline decoration-green-500/30 underline-offset-8 transition-all hover:translate-x-[-4px]"
            >
                <ChevronLeft className="w-4 h-4" /> RETURN
            </button>

            {/* Settings Container with CRT Effect */}
            <div className="w-full bg-black/80 border-2 border-green-900/40 p-10 relative overflow-hidden group shadow-[0_0_30px_rgba(22,101,52,0.1)] flex flex-col">
                {/* Animated Scanlines for that FNAF 3 grit */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,4px_100%] animate-pulse" />

                <h2 className="text-2xl font-black text-green-500 mb-8 font-mono tracking-[0.3em] flex items-center gap-4 shrink-0">
                    <div className="w-2 h-8 bg-green-500 animate-pulse" />
                    AUDIO SUBSYSTEM
                </h2>

                <div className="grid grid-cols-2 gap-x-12 gap-y-5 relative z-10 overflow-y-auto pr-2 scrollbar-hide">
                    {categories.map((item) => (
                        <div key={item.key} className="group/row">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[11px] font-mono text-green-400/80 flex items-center gap-3 uppercase tracking-tighter group-hover/row:text-green-300 transition-colors">
                                    <item.icon size={14} className="text-green-600 group-hover/row:animate-pulse" />
                                    {item.label}
                                </label>
                                <span className="text-[9px] font-mono text-green-600 bg-green-950/30 px-1.5 py-0.5 border border-green-900/40">
                                    Level: {Math.round(audioSettings[item.key] * 100)}%
                                </span>
                            </div>

                            <div className="relative h-4 flex items-center">
                                {/* Custom FNAF 3 Industrial Slider */}
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={audioSettings[item.key]}
                                    onChange={(e) => updateAudioSetting(item.key, parseFloat(e.target.value))}
                                    className="w-full h-1 bg-green-950/50 appearance-none cursor-pointer border border-green-900/20 overflow-hidden
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black
                    [&::-webkit-slider-thumb]:shadow-[-100vw_0_0_100vw_rgba(34,197,94,0.4)]
                    hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Status text */}
                <div className="mt-10 pt-4 border-t border-green-900/30 flex justify-between items-center text-[10px] font-mono text-green-800 italic shrink-0">
                    <span>&gt; Driver: Realtek Generic Audio Gen 4</span>
                    <span className="animate-pulse">● Signal Stable</span>
                </div>
            </div>
        </div>
    );
};

export default SettingsMenu;
