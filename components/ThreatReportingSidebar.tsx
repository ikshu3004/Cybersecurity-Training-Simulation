/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import {
    AlertTriangle, Send, X, Shield, ChevronRight,
    FileWarning, Bug, Skull, Globe
} from 'lucide-react';
import { AttackType } from '../types';

interface ThreatOption {
    id: AttackType;
    label: string;
    icon: React.ComponentType<any>;
    color: string;
    description: string;
}

/* ==========================================================================
   CONSTANTS & CONFIGURATION
   ========================================================================== */
const THREAT_OPTIONS: ThreatOption[] = [
    {
        id: 'phishing',
        label: 'Phishing Attempt',
        icon: Globe,
        color: 'text-blue-400',
        description: 'Suspicious email, fake login page, or social engineering attempt.'
    },
    {
        id: 'malware',
        label: 'Malware / Virus',
        icon: Bug,
        color: 'text-amber-400',
        description: 'Unexpected system behavior, unknown file execution, or popup spam.'
    },
    {
        id: 'ransomware',
        label: 'Ransomware',
        icon: Skull,
        color: 'text-red-500',
        description: 'Files locked, encryption notices, or extensive system lockout.'
    },
    {
        id: 'network',
        label: 'Network Attack',
        icon: ActivityIcon,
        color: 'text-purple-400',
        description: 'Unauthorized data exfiltration, blank icons, or file upload popups.'
    }
];

/* ==========================================================================
   HELPER ICONS
   ========================================================================== */
function ActivityIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}

/* ==========================================================================
   MAIN COMPONENT: ThreatReportingSidebar
   ========================================================================== */
// A sidebar for reporting security threats, providing feedback on report accuracy.
const ThreatReportingSidebar: React.FC = () => {
    /* --- Hooks & Local State --- */
    const { reportThreat } = useOS();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedThreat, setSelectedThreat] = useState<AttackType | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportResult, setReportResult] = useState<'success' | 'failure' | null>(null);

    /* --- Event Handlers --- */
    // Submits the threat report with simulated network latency.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedThreat) return;

        setIsSubmitting(true);

        // Simulate network delay
        setTimeout(() => {
            const success = reportThreat({
                type: selectedThreat,
                description: description || "User reported suspicious activity.",
                severity: selectedThreat === 'ransomware' ? 'critical' : 'medium',
                status: 'pending'
            });

            setIsSubmitting(false);
            setReportResult(success ? 'success' : 'failure');

            // Reset after a moment
            setTimeout(() => {
                setReportResult(null);
                setIsOpen(false);
                setSelectedThreat(null);
                setDescription('');
            }, 3000);
        }, 1000);
    };

    /* ==========================================================================
       RENDER RETURN
       ========================================================================== */
    return (
        <>
            {/* Trigger Button (Right Edge) */}
            <div
                className={`fixed right-0 top-1/2 -translate-y-1/2 z-[5000] transition-transform duration-300 ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-red-900/80 hover:bg-red-800 text-white p-3 pr-4 rounded-l-xl border-l border-y border-red-500/50 backdrop-blur shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-2 group vertical-text"
                    style={{ writingMode: 'vertical-rl' }}
                >
                    <AlertTriangle className="rotate-90 group-hover:scale-110 transition-transform mb-2" size={20} />
                    <span className="font-bold tracking-widest text-xs uppercase rotate-180">Report Threat</span>
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[5000]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-96 bg-[#1a1a1a] border-l border-red-500/30 shadow-2xl z-[5001] transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-red-900/20 to-transparent">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 text-red-500">
                            <Shield size={24} />
                            <h2 className="text-xl font-bold tracking-tight">SECURITY ALERT</h2>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-gray-400 text-xs">
                        Report suspicious activity directly to the Incident Response Team.
                        False reports usage is monitored.
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700">
                    {!reportResult ? (
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Threat Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-300 uppercase tracking-wider block">1. Identify Threat Type</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {THREAT_OPTIONS.map((option) => (
                                        <div
                                            key={option.id}
                                            onClick={() => setSelectedThreat(option.id)}
                                            className={`
                                                relative p-4 rounded-lg border cursor-pointer transition-all group
                                                ${selectedThreat === option.id
                                                    ? 'bg-red-900/20 border-red-500'
                                                    : 'bg-[#252525] border-transparent hover:border-gray-600 hover:bg-[#2a2a2a]'
                                                }
                                            `}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded bg-black/40 ${option.color}`}>
                                                    <option.icon size={20} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-sm ${selectedThreat === option.id ? 'text-white' : 'text-gray-300'}`}>
                                                        {option.label}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                        {option.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedThreat === option.id && (
                                                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-300 uppercase tracking-wider block">2. Additional Details (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe what you observed..."
                                    className="w-full bg-[#0a0a0a] border border-gray-700 rounded p-3 text-sm text-gray-300 focus:border-red-500 focus:outline-none min-h-[100px] resize-none placeholder:text-gray-600"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!selectedThreat || isSubmitting}
                                className={`
                                    w-full py-4 rounded font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all
                                    ${!selectedThreat
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        : isSubmitting
                                            ? 'bg-red-900 text-red-300 cursor-wait'
                                            : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 active:translate-y-0.5'
                                    }
                                `}
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>Submit Report <Send size={16} /></>
                                )}
                            </button>
                        </form>
                    ) : reportResult === 'success' ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/50">
                                <Shield size={40} className="text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Report Logged</h3>
                                <p className="text-gray-400 text-sm max-w-[250px] mx-auto">
                                    Your secure report ID has been generated: <br /> <span className="font-mono text-green-400">#TR-{Math.floor(Math.random() * 10000)}</span>
                                </p>
                            </div>
                            <div className="bg-[#252525] p-4 rounded text-xs text-gray-500 border border-gray-800">
                                Status: <span className="text-amber-500">Pending Analysis</span> <br />
                                The Incident Response Team is reviewing your submission.
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/50">
                                <FileWarning size={40} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">False Positive</h3>
                                <p className="text-red-400 text-sm max-w-[250px] mx-auto">
                                    No active threat signature matches your report.
                                </p>
                            </div>
                            <div className="bg-[#252525] p-4 rounded text-xs text-gray-500 border border-gray-800">
                                Status: <span className="text-red-500">Rejected</span> <br />
                                Please verify your source before submitting again.
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#111] border-t border-white/5 text-[10px] text-gray-600 text-center font-mono">
                    SECURE CHANNEL // ENCRYPTED AES-256
                </div>
            </div>
        </>
    );
};

export default ThreatReportingSidebar;
