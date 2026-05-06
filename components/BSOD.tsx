/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useEffect, useState } from 'react';
import { useOS } from '../context/OSContext';
import { RotateCcw } from 'lucide-react';

/* ==========================================================================
   MAIN COMPONENT: BSOD
   ========================================================================== */
const BSOD: React.FC = () => {
    /* --- Hooks & Context State --- */
    const { gameState, resetSession } = useOS();
    const [progress, setProgress] = useState(0);

    /* --- Helper: Threat Details & Stop Codes --- */
    // Maps the crash reason to a technical stop code and educational description.
    const getStopCodeAndDetails = (reason?: string) => {
        if (!reason) return {
            code: "CRITICAL_INTEGRITY_FAILURE",
            title: "Unknown Threat",
            description: "System Integrity compromised due to unhandled exceptions.",
            action: "System Reboot"
        };

        if (reason.includes("Ransomware")) return {
            code: "ERR_RANSOMWARE_ENCRYPTION_COMPLETE",
            title: "Ransomware Infection",
            description: "Locally executed ransomware has begun encrypting the master file table (MFT) and attached network drives. The primary objective is extortion via denial of access.",
            action: "ISOLATE HOST immediately to sever the infected node from the network, preventing lateral movement of the worm."
        };

        if (reason.includes("Network Exfiltration")) return {
            code: "ERR_CRITICAL_DATA_LOSS_DETECTED",
            title: "Data Exfiltration",
            description: "An unauthorized external actor has bypassed firewall protocols and established a reverse shell. They are actively packaging and exfiltrating proprietary data to an external server.",
            action: "BLOCK SOURCE via the firewall immediately to sever the unauthorized connection and stop data loss."
        };

        if (reason.includes("Malware")) return {
            code: "ERR_KERNEL_MALWARE_INFECTION",
            title: "Malware Infection",
            description: "A malicious payload has achieved persistence in the system root and is modifying registry keys or injecting code into legitimate processes to disrupt operations.",
            action: "QUARANTINE the specific process or file immediately to halt execution before the payload replicates."
        };

        if (reason.includes("Phishing")) return {
            code: "ERR_UNAUTHORIZED_ACCESS_BREACH",
            title: "Credential Compromise (Phishing)",
            description: "A user has interacted with a deceptive link or payload, resulting in their authentication cookies or plaintext credentials being harvested by a threat actor.",
            action: "RESET CREDS immediately to invalidate any stolen session tokens or passwords before lateral access is achieved."
        };

        return {
            code: "CRITICAL_INTEGRITY_FAILURE",
            title: "Multiple Overlapping Threats",
            description: "System Integrity compromised due to an overwhelming number of unmitigated cyber threats overloading incident response capacity.",
            action: "Execute complete incident response protocols according to the company playbook."
        };
    };

    const crashData = getStopCodeAndDetails(gameState.systemCrash?.reason);

    /* --- Effects & Progress Simulation --- */
    // Simulates the percentage collection for the classic BSOD look
    useEffect(() => {
        if (progress < 100) {
            const timer = setTimeout(() => {
                setProgress(p => Math.min(100, p + Math.floor(Math.random() * 15) + 5));
            }, Math.random() * 800 + 200);
            return () => clearTimeout(timer);
        }
    }, [progress]);

    /* ==========================================================================
       RENDER RETURN
       ========================================================================== */
    return (
        <div className="fixed inset-0 z-[99999] bg-[#0078D7] text-white flex flex-col justify-center px-8 md:px-24 py-16 font-sans select-none overflow-hidden h-screen w-screen">
            <h1 className="text-8xl md:text-[140px] mb-8 font-light leading-none">:(</h1>
            <div className="text-2xl md:text-4xl font-light leading-snug max-w-5xl mb-6">
                Your system ran into a fatal problem and needs to restart. We're just collecting some error info, and then we'll restart for you.
            </div>
            <div className="text-2xl md:text-3xl font-light mb-12">
                {progress}% complete
            </div>

            <div className="flex items-start gap-4 mt-8">
                {/* QR Code placeholder */}
                <div className="bg-white p-2 shrink-0">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=GAME_OVER" alt="QR" className="w-20 h-20 md:w-28 md:h-28" />
                </div>
                <div className="text-sm md:text-base space-y-3 pt-1 font-light flex flex-col justify-center">
                    <p>For more information about this issue and possible fixes, visit https://windows.com/stopcode</p>
                    <div className="bg-black/20 p-4 border-l-4 border-white/50 mt-2 mb-2">
                        <p className="font-bold text-lg mb-2">{crashData.title}</p>
                        <p className="opacity-90 leading-relaxed mb-3 text-sm md:text-base">{crashData.description}</p>
                        <p className="font-semibold text-yellow-300">Required Action: {crashData.action}</p>
                    </div>
                    <p className="font-mono mt-2">Stop code: {crashData.code}</p>
                </div>
            </div>

            {progress === 100 && (
                <div className="absolute bottom-16 right-16 animate-in fade-in zoom-in duration-1000">
                    <button
                        onClick={() => resetSession(true)}
                        className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/30 px-6 py-4 rounded backdrop-blur transition-all active:scale-95 cursor-pointer text-xl shadow-2xl font-semibold"
                    >
                        <RotateCcw size={24} />
                        Return to Main Menu
                    </button>
                </div>
            )}
        </div>
    );
};

export default BSOD;
