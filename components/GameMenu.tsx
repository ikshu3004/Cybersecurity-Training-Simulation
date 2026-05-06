/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useState } from 'react';
import { Shield, Users, Play, Settings, Search, ChevronLeft, Terminal } from 'lucide-react';
import { useOS } from '../context/OSContext';
import SettingsMenu from './SettingsMenu';

interface GameMenuProps {
    onStartGame: (day?: number) => void;
    onStartForensic?: (day: 3 | 4 | 5) => void;
    isResumable?: boolean;
}

type MenuStateInput = 'SINGLE_PLAYER' | 'SETTINGS';

/* ==========================================================================
   MAIN COMPONENT: GameMenu
   ========================================================================== */
// The primary entry point menu for the game simulation.
const GameMenu: React.FC<GameMenuProps> = ({ onStartGame, onStartForensic, isResumable = false }) => {
    /* --- Hooks & Context State --- */
    let menuStateContext, setMenuStateContext;
    try {
        const os = useOS();
        menuStateContext = os.menuState;
        setMenuStateContext = os.setMenuState;
    } catch (e) {
    }

    const [localMenuState, setLocalMenuState] = useState<MenuStateInput>('SINGLE_PLAYER');

    const menuState = menuStateContext || localMenuState;
    const setMenuState = setMenuStateContext || setLocalMenuState;

    // Common button base style
    const btnStyle = "group relative w-full max-w-md p-4 mb-4 border border-green-500/30 bg-black/60 hover:bg-green-900/20 text-green-400 font-mono text-lg uppercase tracking-widest transition-all duration-300 hover:border-green-400 hover:shadow-[0_0_15px_rgba(74,222,128,0.2)] flex items-center justify-between overflow-hidden";

    const [showDaySelector, setShowDaySelector] = useState(false);
    const [showForensicSelector, setShowForensicSelector] = useState(false);

    /* ==========================================================================
       SUB-RENDERING FUNCTIONS
       ========================================================================== */
    // Renders the Single Player sub-menu with Day and Forensic selectors.
    const renderSinglePlayerMenu = () => (
        <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-right-8 duration-500">
            {(showDaySelector || showForensicSelector) && (
                <button
                    onClick={() => {
                        if (showDaySelector) setShowDaySelector(false);
                        else if (showForensicSelector) setShowForensicSelector(false);
                    }}
                    className="self-start mb-8 text-green-500/60 hover:text-green-400 font-mono flex items-center gap-2 hover:underline decoration-green-500/30 underline-offset-4"
                >
                    <ChevronLeft className="w-4 h-4" /> BACK
                </button>
            )}

            {!showDaySelector && !showForensicSelector ? (
                <>
                    <button
                        onClick={() => {
                            if (isResumable) {
                                onStartGame(); // Resume
                            } else {
                                setShowDaySelector(true);
                            }
                        }}
                        className={btnStyle}
                    >
                        <span className="flex items-center gap-3">
                            <Play className="w-5 h-5 group-hover:fill-green-400" />
                            {isResumable ? "Resume Shift" : "Start Shift"}
                        </span>
                        <div className="absolute inset-0 bg-green-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
                    </button>

                    <button
                        className={btnStyle}
                        onClick={() => setShowForensicSelector(true)}
                    >
                        <span className="flex items-center gap-3">
                            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Forensic Inspection
                        </span>
                        <div className="absolute inset-0 bg-green-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
                    </button>


                    <button
                        className={btnStyle}
                        onClick={() => setMenuState('SETTINGS')}
                    >
                        <span className="flex items-center gap-3">
                            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" />
                            Settings
                        </span>
                    </button>
                </>
            ) : showDaySelector ? (
                <div className="w-full max-w-md animate-in zoom-in-95 duration-300">
                    <h3 className="text-green-400 font-mono text-center mb-6 uppercase tracking-widest border-b border-green-500/30 pb-2">Select Shift Day</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5].map(day => (
                            <button
                                key={day}
                                onClick={() => {
                                    onStartGame(day);
                                }}
                                className="border border-green-500/30 bg-black/60 hover:bg-green-900/20 text-green-400 font-mono p-4 uppercase transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-2 group"
                            >
                                <span className="text-2xl font-bold group-hover:text-white">DAY {day}</span>
                                <span className="text-[10px] text-green-500/50">
                                    {day === 1 ? "Standard Patrol" :
                                        day === 2 ? "Network Noise" :
                                            day === 3 ? "Malware Spikes" :
                                                day === 4 ? "Ransomware Risk" : "NIGHTMARE"}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md animate-in zoom-in-95 duration-300">
                    <h3 className="text-blue-400 font-mono text-center mb-6 uppercase tracking-widest border-b border-blue-500/30 pb-2">Select Forensic Case</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {[3, 4, 5].map(day => (
                            <button
                                key={day}
                                onClick={() => {
                                    if (onStartForensic) onStartForensic(day as any);
                                }}
                                className="border border-blue-500/30 bg-black/60 hover:bg-blue-900/20 text-blue-400 font-mono p-4 uppercase transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-2 group"
                            >
                                <span className="text-2xl font-bold group-hover:text-white">DAY {day}</span>
                                <span className="text-[8px] text-blue-500/50">EVIDENCE</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    /* ==========================================================================
       RENDER RETURN
       ========================================================================== */
    return (
        <div className="w-full h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center z-[99999]">
            {/* Background Matrix-like effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] pointer-events-none" />

            {/* Content */}
            <div className={`relative z-10 w-full px-6 flex flex-col items-center transition-all duration-500 ${menuState === 'SETTINGS' ? 'max-w-7xl' : 'max-w-2xl'}`}>
                <div className="mb-16 text-center">
                    <div className="flex items-center justify-center gap-4 text-green-500 mb-4 animate-pulse">
                        <Terminal className="w-12 h-12" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-800 tracking-tighter mb-2 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                        CYBERSECURITY
                    </h1>
                    <h2 className="text-xl md:text-2xl font-bold text-green-500/80 tracking-[0.5em]">
                        TRAINING SIMULATOR
                    </h2>
                </div>

                {menuState === 'SINGLE_PLAYER' && renderSinglePlayerMenu()}
                {menuState === 'SETTINGS' && (
                    <SettingsMenu onBack={() => setMenuState('SINGLE_PLAYER')} />
                )}
            </div>

            {/* Footer / Status Bar */}
            <div className="absolute bottom-0 w-full border-t border-green-900/30 bg-black/80 p-2 flex justify-between items-center px-6 text-[10px] text-green-600/50 font-mono">
                <span>STATUS: ONLINE</span>
                <span>SECURE_NODE: ACTIVE</span>
            </div>
        </div>
    );
};

export default GameMenu;
