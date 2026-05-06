/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import {
    Shield, Lock, Globe, AlertTriangle, AlertOctagon,
    Activity, Radio, Terminal, XCircle, CheckCircle,
    Zap, Database, Users, FileText, ChevronRight, Slash,
    Cpu, HardDrive, Network
} from 'lucide-react';

interface IncidentDashboardProps {
    onResolve: () => void;
}

import { useOS } from '../../context/OSContext';
import { ReportedThreat } from '../../types';
import { SHIFT_CONFIGS } from '../../constants';

/* ==========================================================================
   HELPER COMPONENTS
   ========================================================================== */
/**
 * Displays the current in-game time based on the OS context.
 */
const GameClock = () => {
    const { gameState } = useOS();

    // Derived from Taskbar logic
    const shiftDuration = SHIFT_CONFIGS[gameState.currentDay - 1]?.durationRealTimeSecs || 480;
    // 8 game hours (9-5)
    // 1 game hour = duration / 8
    const totalGameMinutesPassed = Math.floor(gameState.elapsedTimeReal / (shiftDuration / (8 * 60)));
    const startMinutes = 9 * 60; // 540 minutes
    const currentTotalMinutes = startMinutes + totalGameMinutesPassed;

    let hours = Math.floor(currentTotalMinutes / 60);
    const minutes = currentTotalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';

    if (hours > 12) hours -= 12;

    const minStr = minutes.toString().padStart(2, '0');

    return (
        <>
            {hours}:{minStr} <span className="text-sm text-gray-500 ml-1">{ampm}</span>
        </>
    );
};

/* ==========================================================================
   CONSTANTS & CONFIG
   ========================================================================== */
// Financial costs for different remediation actions
const COSTS: Record<string, number> = {
    'QUARANTINE': 1000,
    'BLOCK_IP': 500,
    'ISOLATE_HOST': 5000,
    'PATCH': 2000,
    'SCAN': 100,
    'RESET_CREDS': 200,
    'REPORT': 0
};

const REQUIRED_ACTIONS: Record<string, string> = {
    'phishing': 'RESET_CREDS',
    'malware': 'QUARANTINE',
    'ransomware': 'ISOLATE_HOST',
    'ddos': 'BLOCK_IP',
    'network': 'BLOCK_IP'
};

/* ==========================================================================
   MAIN COMPONENT: IncidentDashboard
   ========================================================================== */
const IncidentDashboard: React.FC<IncidentDashboardProps> = ({ onResolve }) => {
    /* --- Hooks & Context State --- */
    const { reportedThreats, resolveThreat, isUnderAttack, gameState, updateShiftStats } = useOS();
    const { systemIntegrity: integrity, budget } = gameState.shiftStats;
    const [time, setTime] = useState(new Date());
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [selectedThreatId, setSelectedThreatId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    // Active threats are those not resolved
    const activeThreats = reportedThreats.filter(t => t.status !== 'resolved');

    // Derived state for active effects
    const hasMalware = activeThreats.some(t => t.type === 'malware');
    const hasRansomware = activeThreats.some(t => t.type === 'ransomware');

    // Auto-lock integrity based on threat count logic...
    // Removed strict auto-lock to allow gameplay (integrity drops on mistakes)

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    /* --- Remediation Logic --- */
    //Handles the execution of a security action (Quarantine, Patch, etc.).
    const handleAction = (action: string) => {
        const cost = COSTS[action] || 0;

        if (budget < cost) {
            setFeedback("INSUFFICIENT FUNDS");
            setTimeout(() => setFeedback(null), 2000);
            return;
        }

        updateShiftStats({ budget: budget - cost });
        setSelectedAction(action);

        // Validation Logic
        if (selectedThreatId) {
            const threat = activeThreats.find(t => t.id === selectedThreatId);
            if (threat) {
                const required = REQUIRED_ACTIONS[threat.type];

                if (required === action) {
                    // Success
                    setFeedback("THREAT NEUTRALIZED");
                    setTimeout(() => {
                        resolveThreat(selectedThreatId);
                        setSelectedThreatId(null);
                        setSelectedAction(null);
                        setFeedback(null);

                        // Check if all threats cleared
                        if (activeThreats.length <= 1) { // 1 because this one is about to be removed in next render cycle check usually, but safely
                            // If clean, maybe Integrity boost?
                            updateShiftStats({ systemIntegrity: Math.min(100, integrity + 5) });
                        }
                    }, 1000);
                } else {
                    // Failure
                    setFeedback("INEFFECTIVE ACTION: INTEGRITY COMPROMISED");
                    updateShiftStats({ systemIntegrity: Math.max(0, integrity - 10) });
                    setTimeout(() => setFeedback(null), 2000);
                }
            }
        } else {
            // Global actions (like Isolate Host for panic)
            if (action === 'ISOLATE_HOST' && hasRansomware) {
                onResolve(); // Panic button works for ransomware
            }
        }
    };

    /* --- Radar & UI Helpers --- */
    // Generates deterministic coordinates for a threat on the circular radar.
    const getRadarCoordinates = (id: string, index: number) => {
        // Use pseudo-random based on string char codes
        const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const angle = (seed % 360) * (Math.PI / 180);
        // Distance from center (10% to 40% radius) - ensure well inside circle
        const distance = 10 + (seed % 30);

        // Convert to percentage offsets from center (50, 50)
        // x = 50 + distance * cos(angle)
        // y = 50 + distance * sin(angle)
        const x = 50 + distance * Math.cos(angle);
        const y = 50 + distance * Math.sin(angle);

        return { x: `${x}%`, y: `${y}%` };
    };

    /* ==========================================================================
       RENDER LOGIC
       ========================================================================== */
    return (
        <div className="flex flex-col h-full bg-[#050505] text-cyan-500 font-mono overflow-hidden select-none relative">

            {/* Ransomware Tint Overlay */}
            {hasRansomware && (
                <div className="absolute inset-0 bg-red-950/30 pointer-events-none z-0 animate-pulse"></div>
            )}

            {/* --- VISUAL EFFECTS OVERLAY --- */}
            {hasMalware && (
                <div className="absolute inset-0 pointer-events-none z-0 opacity-20 overflow-hidden">
                    {/* Floating Matrix Code Effect (Simplified) */}
                    <div className="absolute top-10 left-1/4 text-xs text-green-500 animate-bounce">0x4F 0x9A NULL POINTER</div>
                    <div className="absolute bottom-20 right-1/4 text-xs text-green-500 animate-pulse">SYSTEM.ROOT(CORRUPT)</div>
                    <div className="absolute top-1/2 left-10 text-xs text-green-500 animate-[ping_3s_infinite]">INJECTING PAYLOAD...</div>
                </div>
            )}

            {/* Feedback Toast */}
            {feedback && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] bg-black/90 border border-white/20 px-6 py-3 rounded text-white font-bold tracking-widest shadow-2xl animate-in fade-in slide-in-from-top-4">
                    {feedback}
                </div>
            )}

            {/* --- DASHBOARD HEADER --- */}
            <div className="h-16 border-b border-cyan-900/50 bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0 relative overflow-hidden z-20">
                {/* Scanlines Effect Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>

                <div className="flex items-center gap-6 z-10">
                    {/* Budget/Stats */}
                    <div className="flex items-center gap-3 bg-green-900/10 border border-green-500/30 px-4 py-2 rounded clip-path-slant">
                        <Shield className="text-green-500" size={20} />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-green-500/70 leading-none">BUDGET</span>
                            <span className="text-lg font-bold text-green-400 leading-none">${budget.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-amber-900/10 border border-amber-500/30 px-4 py-2 rounded">
                        <Lock className="text-amber-500" size={20} />
                        <div className="flex flex-col w-32">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-amber-500/70 leading-none">INTEGRITY</span>
                                <span className={`text-xs font-bold leading-none ${integrity < 50 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>{integrity.toFixed(1)}%</span>
                            </div>
                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-amber-900/30 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${integrity < 30 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${integrity}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-blue-900/10 border border-blue-500/30 px-4 py-2 rounded">
                        <Globe className="text-blue-500" size={20} />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-blue-500/70 leading-none">REPUTATION</span>
                            <span className="text-lg font-bold text-blue-400 leading-none">STABLE</span>
                        </div>
                    </div>
                </div>

                <div className="z-10 bg-black/50 border border-white/10 px-4 py-2 rounded text-2xl font-bold tracking-widest text-gray-200">
                    <GameClock />
                </div>
            </div>

            {/* --- MAIN GRID --- */}
            <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden relative z-10">

                {/* --- LEFT PANEL: Alert Feed --- */}
                <div className="col-span-3 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                        <Activity size={18} />
                        <h3 className="font-bold tracking-wider">ALERT FEED</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-cyan-900">
                        {activeThreats.length === 0 ? (
                            <div className="text-gray-600 text-xs text-center py-8 italic border border-dashed border-gray-800 rounded">
                                NO ACTIVE THREATS DETECTED
                            </div>
                        ) : (
                            activeThreats.map((threat) => (
                                <div
                                    key={threat.id}
                                    onClick={() => setSelectedThreatId(threat.id)}
                                    className={`
                                        bg-red-950/20 border p-3 rounded relative overflow-hidden group hover:bg-red-950/30 transition-all cursor-pointer
                                        ${selectedThreatId === threat.id ? 'border-red-500 bg-red-900/10' : 'border-red-500/30'}
                                    `}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-red-400 font-bold text-xs">[{threat.type.toUpperCase()}]</span>
                                        <span className="text-red-500/50 text-[10px]">{new Date(threat.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="text-red-200 text-sm font-semibold mb-2">{threat.description.substring(0, 30)}...</div>
                                    <div className="text-red-400/70 text-xs font-mono space-y-0.5 uppercase">
                                        <div>Status: {threat.status}</div>
                                        <div>Severity: {threat.severity}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- CENTER PANEL: Threat Radar --- */}
                <div className="col-span-5 flex flex-col relative items-center justify-center">
                    {/* Top Labels */}
                    <div className="flex justify-between text-xs text-cyan-700/50 mb-4 font-bold tracking-widest w-full px-12">
                        <span>WD</span>
                        <span>MP</span>
                        <span>HE</span>
                    </div>

                    {/* Radar Container - Fixed Aspect Ratio & Clipping */}
                    <div className="relative w-[360px] h-[360px] rounded-full border border-cyan-900/30 bg-black/40 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)]" style={{ clipPath: 'circle(50% at 50% 50%)' }}>
                        {/* Radar Grid Rings */}
                        <div className="absolute inset-4 border border-cyan-900/30 rounded-full"></div>
                        <div className="absolute inset-16 border border-cyan-900/30 rounded-full"></div>
                        <div className="absolute inset-32 border border-cyan-900/30 rounded-full"></div>
                        <div className="absolute inset-[40%] border border-cyan-900/30 rounded-full"></div>

                        {/* Crosshairs */}
                        <div className="absolute w-full h-[1px] bg-cyan-900/30"></div>
                        <div className="absolute h-full w-[1px] bg-cyan-900/30"></div>

                        {/* Rotating Scan Line */}
                        <div className="absolute w-[100%] h-[100%] top-0 left-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(239,68,68,0.1)_90deg,transparent_90deg)] animate-[spin_4s_linear_infinite]"></div>
                        {/* Secondary faster scanner */}
                        <div className="absolute w-[90%] h-[90%] top-[5%] left-[5%] rounded-full border-t border-cyan-500/30 animate-[spin_2s_linear_infinite_reverse]"></div>

                        {/* Center Warning */}
                        {isUnderAttack ? (
                            <div className="absolute z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur border border-red-500/50 rounded-full w-32 h-32 animate-pulse">
                                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">THREAT LEVEL</span>
                                <span className="text-2xl font-black text-red-500">CRITICAL</span>
                            </div>
                        ) : (
                            <div className="absolute z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur border border-cyan-500/20 rounded-full w-24 h-24">
                                <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider">SYSTEM</span>
                                <span className="text-xl font-bold text-cyan-400">OK</span>
                            </div>
                        )}

                        {/* Threats as Interactive Dots */}
                        {activeThreats.map((threat, index) => {
                            const coords = getRadarCoordinates(threat.id, index);
                            const isSelected = selectedThreatId === threat.id;

                            return (
                                <button
                                    key={threat.id}
                                    onClick={() => setSelectedThreatId(threat.id)}
                                    className={`
                                        absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all z-30
                                        ${isSelected ? 'w-4 h-4 bg-white border-2 border-red-500 shadow-[0_0_15px_#fff]' : 'w-3 h-3 bg-red-500 hover:bg-red-400 hover:scale-125'}
                                    `}
                                    style={{ left: coords.x, top: coords.y }}
                                    title={`Threat: ${threat.type}`}
                                >
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] bg-black/80 px-1 rounded text-white whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                        {threat.id.substring(threat.id.length - 4)}
                                    </span>
                                    {isSelected && <span className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-75"></span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom Labels */}
                    <div className="flex justify-between text-xs text-cyan-700/50 mt-4 font-bold tracking-widest w-full px-12">
                        <span>340</span>
                        <span>NDD</span>
                        <span>NG</span>
                    </div>
                </div>

                {/* --- RIGHT PANEL: Remediation Controls --- */}
                <div className="col-span-4 flex flex-col gap-4">
                    {/* Stats Row with Cost Warning */}
                    <div className="flex justify-between gap-2">
                        <div className="bg-black/40 border border-white/10 p-2 rounded flex-1 text-center">
                            <div className="text-[10px] text-gray-500 uppercase">Active Threats</div>
                            <div className={`text-xl font-bold ${activeThreats.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {activeThreats.length}
                            </div>
                        </div>
                        <div className="bg-black/40 border border-white/10 p-2 rounded flex-1 text-center">
                            <div className="text-[10px] text-gray-500 uppercase">System Status</div>
                            <div className={`text-xl font-bold ${activeThreats.length > 0 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                                {activeThreats.length > 0 ? 'WARNING' : 'SECURE'}
                            </div>
                        </div>
                    </div>

                    {/* Main Remediation Section */}
                    {selectedThreatId ? (
                        <div className="border border-red-500/40 bg-red-900/10 rounded p-4 flex flex-col gap-4 h-full relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <h3 className="text-red-400 font-bold uppercase tracking-widest text-sm">Target Locked</h3>
                                <button onClick={() => setSelectedThreatId(null)} className="text-gray-500 hover:text-white"><XCircle size={14} /></button>
                            </div>

                            <div className="text-xs space-y-2 py-2">
                                <div className="flex justify-between"><span className="text-gray-500">ID:</span> <span className="text-white font-mono">{selectedThreatId}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="text-red-400 uppercase">{activeThreats.find(t => t.id === selectedThreatId)?.type}</span></div>
                                <div className="p-2 bg-black/50 rounded text-gray-400 italic">
                                    "{activeThreats.find(t => t.id === selectedThreatId)?.description}"
                                </div>
                            </div>

                            <div className="mt-2 text-[10px] text-gray-400 uppercase tracking-wider text-center border-t border-white/5 pt-2">
                                Recommended Protocol: <span className="text-cyan-400">{REQUIRED_ACTIONS[activeThreats.find(t => t.id === selectedThreatId)?.type || ''] || 'ANALYZING...'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button onClick={() => handleAction('QUARANTINE')} className="col-span-1 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-600 text-amber-200 py-2 rounded text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-colors group">
                                    <AlertTriangle size={14} /> QUARANTINE
                                    <span className="text-[8px] opacity-70 group-hover:text-white">COST: ${COSTS['QUARANTINE']}</span>
                                </button>
                                <button onClick={() => handleAction('BLOCK_IP')} className="col-span-1 bg-red-600/20 hover:bg-red-600/40 border border-red-600 text-red-200 py-2 rounded text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-colors group">
                                    <Slash size={14} /> BLOCK SOURCE
                                    <span className="text-[8px] opacity-70 group-hover:text-white">COST: ${COSTS['BLOCK_IP']}</span>
                                </button>

                                <button onClick={() => handleAction('PATCH')} className="col-span-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600 text-blue-200 py-2 rounded text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-colors group">
                                    <HardDrive size={14} /> PATCH VULN
                                    <span className="text-[8px] opacity-70 group-hover:text-white">COST: ${COSTS['PATCH']}</span>
                                </button>
                                <button onClick={() => handleAction('RESET_CREDS')} className="col-span-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-600 text-purple-200 py-2 rounded text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-colors group">
                                    <Users size={14} /> RESET CREDS
                                    <span className="text-[8px] opacity-70 group-hover:text-white">COST: ${COSTS['RESET_CREDS']}</span>
                                </button>

                                <button onClick={() => handleAction('SCAN')} className="col-span-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-600 text-cyan-200 py-2 rounded text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-colors group">
                                    <Activity size={14} /> DEEP SCAN
                                    <span className="text-[8px] opacity-70 group-hover:text-white">COST: ${COSTS['SCAN']}</span>
                                </button>

                                <button onClick={() => handleAction('ISOLATE_HOST')} className="col-span-2 bg-gradient-to-r from-red-900 to-red-800 border border-red-500 text-white py-3 rounded text-sm font-bold tracking-widest hover:scale-[1.02] transition-transform flex flex-col items-center shadow-lg shadow-red-900/50">
                                    <Shield size={16} className="mb-1" />
                                    <span>INITIATE TAKEDOWN</span>
                                    <span className="text-[8px] opacity-70 font-normal">COST: ${COSTS['ISOLATE_HOST']}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-blue-500/20 bg-blue-900/5 rounded p-4 flex flex-col gap-4 h-full relative overflow-hidden opacity-50 pointer-events-none grayscale">
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <span className="bg-black/80 px-4 py-2 border border-white/10 rounded text-xs text-gray-400">SELECT A TARGET ON RADAR</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 flex-1 mt-auto">
                                <div className="bg-white/5 h-12 rounded"></div>
                                <div className="bg-white/5 h-12 rounded"></div>
                                <div className="bg-white/5 h-12 rounded col-span-2"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncidentDashboard;
