/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Map as MapIcon, RefreshCw, Crosshair, Play } from 'lucide-react';
import DynamicIcon from '../DynamicIcon';

interface Country {
    name: string;
    code: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
}

/* ==========================================================================
   CONSTANTS & DATA
   ========================================================================== */
// Global list of countries with their relative map coordinates.
const COUNTRIES: Country[] = [
    { name: 'United States', code: 'US', x: 25, y: 27 },
    { name: 'Canada', code: 'CA', x: 25, y: 15 },
    { name: 'Brazil', code: 'BR', x: 32, y: 56 },
    { name: 'United Kingdom', code: 'GB', x: 47.5, y: 18 },
    { name: 'France', code: 'FR', x: 48.5, y: 23 },
    { name: 'Germany', code: 'DE', x: 49, y: 20 },
    { name: 'Russia', code: 'RU', x: 70, y: 18 },
    { name: 'China', code: 'CN', x: 72, y: 35 },
    { name: 'India', code: 'IN', x: 67, y: 44 },
    { name: 'Australia', code: 'AU', x: 79, y: 65 },
    { name: 'South Africa', code: 'ZA', x: 53, y: 68 },
    { name: 'Japan', code: 'JP', x: 89, y: 32 },
    { name: 'Egypt', code: 'EG', x: 55, y: 38 },
    { name: 'Mexico', code: 'MX', x: 25, y: 42 },
];

const MAP_URL = "https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg";

import { useOS } from '../../context/OSContext';
import { WindowState } from '../../types';

interface FirewallDefenderProps {
    windowState?: WindowState;
}

/* ==========================================================================
   MAIN COMPONENT: FirewallDefender
   ========================================================================== */
const FirewallDefender: React.FC<FirewallDefenderProps> = ({ windowState }) => {
    /* --- Hooks & Context State --- */
    const { updateWindowData, triggerNetworkAttack, updateShiftStats } = useOS();
    const savedState = windowState?.data || {};

    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(savedState.gameOver ?? false);
    const [score, setScore] = useState(savedState.score ?? 0);
    const [lives, setLives] = useState(savedState.lives ?? 3);
    const [redZones, setRedZones] = useState<string[]>(savedState.redZones || []); // List of Country Codes
    const [currentRequest, setCurrentRequest] = useState<{ ip: string; country: Country } | null>(null);
    const [feedback, setFeedback] = useState<'allowed' | 'blocked' | 'missed' | null>(null);

    // Game Loop Timers
    const zoneTimerRef = useRef<number | null>(null);
    const requestTimerRef = useRef<number | null>(null);
    const decisionTimerRef = useRef<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(100); // Percentage for progress bar

    /* --- Effects --- */
    // Auto-pause if minimized
    useEffect(() => {
        if (windowState?.isMinimized && isPlaying) {
            stopGame();
        }
    }, [windowState?.isMinimized]);

    // Persistence
    useEffect(() => {
        const persist = () => {
            if (windowState?.id) {
                updateWindowData(windowState.id, {
                    score,
                    lives,
                    gameOver,
                    redZones
                });
                // Sync to global shift stats
                updateShiftStats({ firewallDefenderScore: score });
            }
        };
        const interval = setInterval(persist, 2000);
        return () => {
            clearInterval(interval);
            persist();
        };
    }, [score, lives, gameOver, redZones, windowState?.id, updateShiftStats]);

    /* --- Game Control Actions --- */
    // Start Game
    const startGame = () => {
        if (gameOver || (score === 0 && lives === 3)) {
            setScore(0);
            setLives(3);
            setGameOver(false);
        }

        setIsPlaying(true);

        if (redZones.length === 0) {
            updateRedZones();
        }

        if (!currentRequest) {
            nextRequest();
        }

        // Rotate Red Zones every 15 seconds
        if (zoneTimerRef.current) clearInterval(zoneTimerRef.current);
        zoneTimerRef.current = window.setInterval(() => {
            updateRedZones();
        }, 15000);
    };

    const stopGame = () => {
        setIsPlaying(false);
        if (zoneTimerRef.current) clearInterval(zoneTimerRef.current);
        if (requestTimerRef.current) clearTimeout(requestTimerRef.current);
        if (decisionTimerRef.current) clearInterval(decisionTimerRef.current);
    };

    // Logic
    /* --- Core Game Logic --- */
    const updateRedZones = () => {
        // Pick 4 random countries to be red zones
        const shuffled = [...COUNTRIES].sort(() => 0.5 - Math.random());
        const newZones = shuffled.slice(0, 4).map(c => c.code);
        setRedZones(newZones);
    };

    const nextRequest = () => {
        setFeedback(null);
        const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

        setCurrentRequest({
            ip: randomIP,
            country: randomCountry
        });

        // Reset Decision Timer
        setTimeLeft(100);
        if (decisionTimerRef.current) clearInterval(decisionTimerRef.current);

        // Decrease time left every 100ms
        const step = 2; // Speed of timeout
        decisionTimerRef.current = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    handleTimeout();
                    return 0;
                }
                return prev - step;
            });
        }, 100);
    };

    const handleTimeout = () => {
        if (decisionTimerRef.current) clearInterval(decisionTimerRef.current);
        setFeedback('missed');
        setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
                setGameOver(true);
                stopGame();
                triggerNetworkAttack();
            }
            return newLives;
        });
        // Delay before next request
        requestTimerRef.current = window.setTimeout(nextRequest, 1500);
    };

    const handleDecision = (action: 'allow' | 'block') => {
        if (!currentRequest || !isPlaying) return;
        if (decisionTimerRef.current) clearInterval(decisionTimerRef.current);

        const isRedZone = redZones.includes(currentRequest.country.code);

        let correct = false;
        let fatal = false;

        if (action === 'allow') {
            if (isRedZone) {
                fatal = true; // Allowed a threat
            } else {
                correct = true; // Allowed safe traffic
            }
        } else {
            // Block
            if (isRedZone) {
                correct = true; // Blocked a threat
            } else {
                // Blocked safe traffic - Penalty?
                correct = false; // Just wrong, lose a life maybe?
            }
        }

        if (fatal) {
            setGameOver(true);
            stopGame();
            triggerNetworkAttack();
        } else {
            if (correct) {
                setScore(s => s + 100);
                setFeedback('allowed'); // Re-using allowed visual for "Good Job"
            } else {
                setLives(l => {
                    const newLives = l - 1;
                    if (newLives <= 0) {
                        setGameOver(true);
                        stopGame();
                        triggerNetworkAttack();
                    }
                    return newLives;
                });
                setFeedback('blocked'); // Re-using blocked visual for "Bad Job"
            }
            requestTimerRef.current = window.setTimeout(nextRequest, 1000);
        }
    };

    useEffect(() => {
        return () => stopGame();
    }, []);

    /* ==========================================================================
       RENDER LOGIC
       ========================================================================== */
    return (
        <div className="flex h-full bg-[#0a0a0a] text-gray-200 font-mono select-none overflow-hidden relative">

            {/* --- MAP LAYER: Background visualization --- */}
            <div className="absolute inset-0 z-0 bg-[#050505] flex items-center justify-center p-4">
                {/* Fixed Aspect Ratio Map Container */}
                <div
                    className="relative w-full max-h-full"
                    style={{
                        aspectRatio: '2/1',
                        maxWidth: 'min(100%, calc(2 * 100vh))' // Ensures it fits both ways
                    }}
                >
                    {/* Map Image Background */}
                    <div
                        className="absolute inset-0 opacity-40 mix-blend-screen"
                        style={{
                            backgroundImage: `url(${MAP_URL})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            filter: 'invert(1) hue-rotate(180deg) contrast(1.5)'
                        }}
                    ></div>

                    {/* Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:40px_40px] [background-position:center] border-white/5 opacity-20"></div>

                    {/* Red Zones Rendering */}
                    {isPlaying && redZones.map(code => {
                        const country = COUNTRIES.find(c => c.code === code);
                        if (!country) return null;
                        return (
                            <div
                                key={code}
                                className="absolute w-[8%] h-[16%] rounded-full bg-red-500/20 blur-xl animate-pulse"
                                style={{
                                    left: `${country.x}%`,
                                    top: `${country.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping"></div>
                            </div>
                        );
                    })}

                    {/* Current Target Rendering */}
                    {isPlaying && currentRequest && (
                        <div
                            className="absolute"
                            style={{
                                left: `${currentRequest.country.x}%`,
                                top: `${currentRequest.country.y}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <div className="relative">
                                <Crosshair className={`w-6 h-6 sm:w-8 sm:h-8 ${redZones.includes(currentRequest.country.code) ? 'text-red-500' : 'text-blue-400'} animate-spin-slow`} />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-2 py-1 text-[10px] sm:text-xs border border-white/20 rounded z-20">
                                    {currentRequest.country.name}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- UI OVERLAY: Stats and Controls --- */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none">

                {/* Top Status Bar */}
                <div className="h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <DynamicIcon icon="/assets/Icons/firewall_defender_icon.png" className="text-emerald-500" size={24} />
                        <div>
                            <h1 className="text-lg font-bold leading-none">FIREWALL DEFENDER</h1>
                            <span className="text-xs text-emerald-500/70">GEOLOCATION FILTER ACTIVE</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 uppercase">Score</span>
                            <span className="text-xl font-mono text-emerald-400">{score.toString().padStart(6, '0')}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 uppercase">Integrity</span>
                            <div className="flex gap-1 mt-1">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className={`w-8 h-2 rounded-sm ${i < lives ? 'bg-emerald-500' : 'bg-gray-800'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Central Alert Area */}
                <div className="flex-1 flex items-center justify-center">
                    {gameOver && (
                        <div className="bg-black/90 border border-red-500/50 p-8 rounded-lg text-center backdrop-blur pointer-events-auto max-w-md animate-in zoom-in duration-300">
                            <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
                            <h2 className="text-3xl font-bold text-white mb-2">NETWORK COMPROMISED</h2>
                            <p className="text-gray-400 mb-6">You allowed a connection from a restricted red zone.</p>
                            <div className="text-2xl font-mono text-emerald-500 mb-8">FINAL SCORE: {score}</div>
                            <button
                                onClick={startGame}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded font-bold flex items-center gap-2 mx-auto transition-colors"
                            >
                                <RefreshCw size={18} /> REBOOT SYSTEM
                            </button>
                        </div>
                    )}

                    {!isPlaying && !gameOver && (
                        <div className="bg-black/90 border border-emerald-500/50 p-8 rounded-lg text-center backdrop-blur pointer-events-auto max-w-md">
                            <MapIcon size={64} className="mx-auto text-emerald-500 mb-4" />
                            <h2 className="text-3xl font-bold text-white mb-2">GEOLOCATION DEFENSE</h2>
                            <p className="text-gray-400 mb-6 text-sm">
                                Block connections from <span className="text-red-400 font-bold">RED ZONES</span>.<br />
                                Allow connections from safe zones.<br />
                                Red zones shift every 15 seconds.
                            </p>
                            <button
                                onClick={startGame}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded font-bold flex items-center gap-2 mx-auto transition-colors"
                            >
                                <Play size={18} /> {score > 0 ? 'RESUME SESSION' : 'INITIALIZE'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom Control Panel */}
                {isPlaying && (
                    <div className="bg-black/80 backdrop-blur-md border-t border-white/10 p-6 pointer-events-auto">
                        <div className="max-w-4xl mx-auto flex items-center gap-8">
                            {/* Incoming Request Info */}
                            <div className="flex-1 bg-[#111] border border-white/10 p-4 rounded flex items-center justify-between relative overflow-hidden">
                                {/* Timer Bar */}
                                <div className="absolute bottom-0 left-0 h-1 bg-emerald-900 w-full">
                                    <div
                                        className={`h-full transition-all duration-100 linear ${timeLeft < 30 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${timeLeft}%` }}
                                    ></div>
                                </div>

                                {currentRequest ? (
                                    <>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase mb-1">Incoming Connection</div>
                                            <div className="text-2xl font-mono text-white tracking-wider">{currentRequest.ip}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 uppercase mb-1">Origin</div>
                                            <div className="text-xl font-bold text-white flex items-center gap-2 justify-end">
                                                {currentRequest.country.name} <span className="text-xs px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">{currentRequest.country.code}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-500 w-full text-center italic">Scanning for traffic...</div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex gap-4">
                                <button
                                    disabled={!currentRequest}
                                    onClick={() => handleDecision('block')}
                                    className="w-32 h-20 bg-red-900/40 hover:bg-red-600 border border-red-600/50 text-red-200 hover:text-white rounded font-bold text-lg transition-all flex flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <XCircle size={24} /> BLOCK
                                </button>
                                <button
                                    disabled={!currentRequest}
                                    onClick={() => handleDecision('allow')}
                                    className="w-32 h-20 bg-emerald-900/40 hover:bg-emerald-600 border border-emerald-600/50 text-emerald-200 hover:text-white rounded font-bold text-lg transition-all flex flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <CheckCircle size={24} /> ALLOW
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Red Zone Warning Overlay */}
            {isPlaying && (
                <div className="absolute top-20 right-6 pointer-events-none">
                    <div className="bg-red-950/80 border border-red-500/30 p-4 rounded backdrop-blur max-w-xs">
                        <div className="flex items-center gap-2 text-red-400 font-bold mb-2 text-sm animate-pulse">
                            <AlertTriangle size={16} /> ACTIVE THREAT ZONES
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {redZones.map(code => {
                                const c = COUNTRIES.find(cnt => cnt.code === code);
                                return (
                                    <div key={code} className="bg-black/50 px-2 py-1 rounded text-xs text-red-200 flex justify-between">
                                        <span>{c?.name}</span>
                                        <span className="font-mono opacity-50">{code}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="h-0.5 bg-red-900/50 mt-3 w-full overflow-hidden">
                            <div className="h-full bg-red-500 animate-[width_15s_linear_infinite]" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FirewallDefender;