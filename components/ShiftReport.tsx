/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { CheckCircle, AlertTriangle, ArrowRight, ShieldCheck, TrendingDown, Landmark, Activity } from 'lucide-react';

/* ==========================================================================
   HELPER COMPONENTS
   ========================================================================== */
// A utility component that animates a numeric value from its current state to a target value.
const RollingNumber: React.FC<{ value: number; prefix?: string; suffix?: string; duration?: number }> = ({ value, prefix = "", suffix = "", duration = 1000 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTimestamp: number | null = null;
        const startValue = displayValue;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (value - startValue) + startValue);
            setDisplayValue(current);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [value]);

    return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

/* ==========================================================================
   MAIN COMPONENT: ShiftReport
   ========================================================================== */
// Displays the results of the completed security shift, including stats and paycheck.
const ShiftReport: React.FC = () => {
    /* --- Hooks & Context State --- */
    const { gameState, startShift, resetSession } = useOS();
    const { currentDay, shiftStats, accumulatedPay } = gameState;

    const isDay5 = currentDay === 5;

    /* --- Logic & Calculations --- */
    // Recalculate values for display (mirroring OSContext logic for visual consistency)
    const basePay = 120;
    const minigameBonus = shiftStats.networkBreachOccurred ? 0 : (shiftStats.firewallDefenderScore / 10) + (shiftStats.firewallDefenseScore / 5);

    const integrityPenalty = (100 - shiftStats.systemIntegrity);
    const falsePositivePenalty = shiftStats.falsePositives * 5;
    const totalPenalty = integrityPenalty + falsePositivePenalty;

    const totalShiftPay = Math.max(0, basePay + minigameBonus - totalPenalty);

    const handleNextShift = () => {
        if (isDay5) {
            resetSession(true);
        } else {
            startShift(currentDay + 1);
        }
    };

    /* ==========================================================================
       RENDER RETURN
       ========================================================================== */
    return (
        <div className="absolute inset-0 z-[9999] bg-black/95 text-white flex flex-col items-center justify-center font-mono animate-in fade-in duration-700 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-800 p-8 rounded-xl shadow-[0_0_50px_rgba(0,112,243,0.2)] relative overflow-hidden">
                {/* Header Decoration */}
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${isDay5 ? 'from-yellow-500 via-amber-200 to-yellow-500' : 'from-blue-600 via-purple-500 to-blue-600'}`}></div>

                {isDay5 ? (
                    <div className="mb-6 flex flex-col items-center">
                        <Landmark size={48} className="text-yellow-500 mb-2 animate-bounce" />
                        <h1 className="text-5xl font-black mb-1 text-center tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 uppercase">Weekly Paycheck</h1>
                        <p className="text-center text-amber-500/70 text-sm uppercase tracking-widest font-bold">Payroll Dept. Disbursement</p>
                    </div>
                ) : (
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold mb-1 text-center tracking-tight text-blue-400 uppercase">Shift {currentDay} Report</h1>
                        <p className="text-center text-gray-500 text-sm uppercase tracking-widest">Corp.Sec Trainee Evaluation</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-8">
                    {/* Stats */}
                    <div className="bg-black/40 p-4 rounded-lg border border-gray-800/50 flex flex-col items-center justify-center group hover:border-blue-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1 text-gray-500 text-[10px] uppercase font-bold">
                            <CheckCircle size={12} className="text-green-500" /> Handled
                        </div>
                        <div className="text-3xl font-black text-white group-hover:scale-110 transition-transform">
                            <RollingNumber value={shiftStats.threatsHandled} />
                        </div>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg border border-gray-800/50 flex flex-col items-center justify-center group hover:border-red-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1 text-gray-500 text-[10px] uppercase font-bold">
                            <Activity size={12} className="text-red-500" /> Encountered
                        </div>
                        <div className="text-3xl font-black text-white group-hover:scale-110 transition-transform">
                            <RollingNumber value={shiftStats.threatsEncountered} />
                        </div>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg border border-gray-800/50 flex flex-col items-center justify-center group hover:border-yellow-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1 text-gray-500 text-[10px] uppercase font-bold">
                            <AlertTriangle size={12} className="text-yellow-500" /> False Pos.
                        </div>
                        <div className="text-3xl font-black text-white group-hover:scale-110 transition-transform">
                            <RollingNumber value={shiftStats.falsePositives} />
                        </div>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg border border-gray-800/50 flex flex-col items-center justify-center group hover:border-emerald-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1 text-gray-500 text-[10px] uppercase font-bold text-center">
                            <ShieldCheck size={12} className="text-blue-500" /> Final Integrity
                        </div>
                        <div className="text-3xl font-black text-white group-hover:scale-110 transition-transform">
                            <RollingNumber value={shiftStats.systemIntegrity} suffix="%" />
                        </div>
                    </div>
                </div>

                <div className="bg-black/20 rounded-xl p-6 border border-gray-800/30 mb-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 uppercase tracking-wider">Base Shift Rate</span>
                            <span className="text-white font-bold tracking-tighter">$120.00</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex flex-col">
                                <span className={`${shiftStats.networkBreachOccurred ? 'text-red-500/50 line-through' : 'text-gray-400'} uppercase tracking-wider flex items-center gap-2`}>
                                    <ShieldCheck size={14} className={shiftStats.networkBreachOccurred ? 'text-red-500' : 'text-emerald-500'} />
                                    Minigame Bonus
                                </span>
                                {shiftStats.networkBreachOccurred && (
                                    <span className="text-[10px] text-red-500 uppercase font-black italic">Breach Detected - Bonus Waived</span>
                                )}
                            </div>
                            <span className={`${shiftStats.networkBreachOccurred ? 'text-red-500 line-through' : 'text-emerald-400'} font-bold`}>
                                <RollingNumber value={minigameBonus} prefix="+" suffix=".00" />
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <TrendingDown size={14} className="text-red-500" />
                                Threat & Integrity Penalties
                            </span>
                            <span className="text-red-400 font-bold">
                                <RollingNumber value={totalPenalty} prefix="-" suffix=".00" />
                            </span>
                        </div>

                        <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                            <span className="text-lg font-black text-white uppercase tracking-tighter">Day Net Earnings</span>
                            <span className="text-3xl font-black text-emerald-500 tracking-tighter">
                                <RollingNumber value={totalShiftPay} prefix="$" suffix=".00" />
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-widest mb-1 italic">Total Account Balance</span>
                        <div className={`text-5xl font-black tracking-tighter ${isDay5 ? 'text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'text-white'}`}>
                            <RollingNumber value={accumulatedPay} prefix="$" suffix=".00" duration={2000} />
                        </div>
                    </div>

                    <button
                        onClick={handleNextShift}
                        className={`group relative overflow-hidden font-black py-4 px-12 rounded-lg flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl ${isDay5
                            ? 'bg-gradient-to-r from-yellow-600 to-amber-700 text-white'
                            : 'bg-white text-black hover:bg-gray-100'
                            }`}
                    >
                        {isDay5 ? (
                            <>Claim Paycheck <Landmark size={20} className="group-hover:rotate-12 transition-transform" /></>
                        ) : (
                            <>Begin Next Shift <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                        <div className="absolute top-0 -left-[100%] group-hover:left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 skew-x-12"></div>
                    </button>

                    {!isDay5 && (
                        <button
                            onClick={() => resetSession(false)}
                            className="text-gray-600 hover:text-gray-400 text-xs uppercase underline tracking-widest transition-colors"
                        >
                            Return to Main Menu
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShiftReport;
