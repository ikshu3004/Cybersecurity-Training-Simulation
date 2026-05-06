/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import {
    ArrowLeft, ArrowRight, RotateCw, Lock, Shield, Server,
    Eye, Menu, AlertTriangle, Search, Map, Crosshair,
    User, CreditCard, Calendar, Clock, FileText, Settings,
    Globe, Terminal, BookOpen, Layers, Zap, CheckCircle2,
    Activity, ShieldAlert, ShieldCheck, ChevronRight
} from 'lucide-react';
import { WindowState } from '../../types';
import IncidentDashboard from './IncidentDashboard';

interface BrowserProps {
    windowState?: WindowState;
}

/* ==========================================================================
   UTILITY FUNCTIONS
   ========================================================================== */
// Generates a string representing the current pay period (last 7 days).
const getPayPeriod = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit' };
    return `${lastWeek.toLocaleDateString('en-US', options)} - ${today.toLocaleDateString('en-US', options)}, ${today.getFullYear()}`;
};

/* ==========================================================================
   MAIN COMPONENT: CorpBrowser
   ========================================================================== */
const CorpBrowser: React.FC<BrowserProps> = ({ windowState }) => {
    /* --- Hook & Context State --- */
    const { isUnderAttack, setAttackState, gameState } = useOS();
    const { accumulatedPay } = gameState;
    const [urlInput, setUrlInput] = useState(windowState?.data?.url || "https://intranet.corp.sec/dashboard");
    const [currentUrl, setCurrentUrl] = useState(windowState?.data?.url || "https://intranet.corp.sec/dashboard");

    if (isUnderAttack) {
        return <IncidentDashboard onResolve={() => setAttackState(false)} />;
    }
    const [activeTab, setActiveTab] = useState<'home' | 'nist' | 'email' | 'games' | 'payroll' | 'hr' | 'maintenance' | 'agenda' | 'firewall'>('home');

    /* --- Effects --- */
    // Handle URL changes from outside (when user clicks a link in mail)
    useEffect(() => {
        if (windowState?.data?.url) {
            setUrlInput(windowState.data.url);
            setCurrentUrl(windowState.data.url);
        }
    }, [windowState?.data?.url]);

    /* --- URL & Navigation Logic --- */
    const isPhishing = currentUrl.toLowerCase().includes('suspicious-link.com') ||
        currentUrl.toLowerCase().includes('hacker-infrastructure.xyz') ||
        currentUrl.toLowerCase().includes('security-verification-portal.net') ||
        windowState?.data?.type === 'phishing';

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentUrl(urlInput);
    };

    const navigateTo = (url: string) => {
        setUrlInput(url);
        setCurrentUrl(url);
    };

    /* ==========================================================================
       PAGE RENDERING FUNCTIONS
       ========================================================================== */

    // Renders the NIST Cybersecurity Framework educational content.
    const renderNistContent = () => (
        <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-800/50 pb-6">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Layers className="text-blue-400" size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">NIST Cybersecurity Framework</h2>
                    <p className="text-gray-400 mt-1">Foundational strategies mapped to your active duties.</p>
                </div>
            </div>

            <p className="text-gray-300 mb-10 text-lg leading-relaxed bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl">
                The <span className="text-blue-400 font-semibold">National Institute of Standards and Technology (NIST)</span> Framework is your operational playbook. As a Tier 1 Operator, understanding how your tools map to these five pillars is the difference between a secure perimeter and a catastrophic breach.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {[
                    { title: 'IDENTIFY', color: 'blue', icon: Search, desc: "Map the attack surface.", detail: "Scan logs and monitor active sessions before the first packet drops." },
                    { title: 'PROTECT', color: 'purple', icon: ShieldCheck, desc: "Deploy safeguards.", detail: "Use Firewall Defense to establish choke points and deflect incoming malformed payloads." },
                    { title: 'DETECT', color: 'yellow', icon: Activity, desc: "Spot anomalies.", detail: "Watch the Firewall Defender map for Red Zone activity indicating a live vector." },
                    { title: 'RESPOND', color: 'orange', icon: ShieldAlert, desc: "Neutralize threats.", detail: "Isolate affected nodes via Incident Dashboard immediately upon a confirmed hit." },
                    { title: 'RECOVER', color: 'green', icon: RotateCw, desc: "Restore services.", detail: "Clear caches, reboot nodes, and ensure the network integrity reports 100%." }
                ].map((step, i) => (
                    <div key={i} className="bg-[#1a1a1f] rounded-2xl overflow-hidden border border-white/5 flex flex-col h-full hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all group">
                        <div className={`bg-${step.color}-600/20 p-6 flex justify-center items-center backdrop-blur-md relative overflow-hidden border-b border-${step.color}-500/30`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent group-hover:opacity-50 transition-all opacity-80" />
                            <step.icon className={`text-${step.color}-400 relative z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_currentColor]`} size={36} />
                        </div>
                        <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-[#1f1f26] to-[#121217]">
                            <h3 className="font-bold text-white mb-1 tracking-wide">{step.title}</h3>
                            <p className="text-sm text-gray-300 font-medium mb-3">{step.desc}</p>
                            <div className="mt-auto pt-3 border-t border-white/5">
                                <p className="text-xs text-gray-500 leading-relaxed">{step.detail}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Renders the Email Security and Phishing awareness module.
    const renderEmailSecurityContent = () => (
        <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-800/50 pb-6">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                    <AlertTriangle className="text-red-400" size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Social Engineering & Phishing</h2>
                    <p className="text-gray-400 mt-1">Identify and neutralize human-layer attacks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Eye className="text-blue-400" /> Threat Identifiers
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-[#1a1a1f] rounded-xl border border-red-500/20 relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                <div className="p-2 bg-red-500/10 rounded-lg shrink-0">
                                    <Globe size={20} className="text-red-400" />
                                </div>
                                <div>
                                    <strong className="text-white block mb-1">Domain Spoofing</strong>
                                    <span className="text-gray-400 text-sm leading-relaxed">Look for slight variations: <span className="text-red-300 font-mono text-xs">@c0rp.net</span> instead of <span className="text-green-300 font-mono text-xs">@corp.net</span>. Attackers register similar sounding domains to trick operators on fast shifts.</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-[#1a1a1f] rounded-xl border border-yellow-500/20 relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                                <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
                                    <Zap size={20} className="text-yellow-400" />
                                </div>
                                <div>
                                    <strong className="text-white block mb-1">False Urgency</strong>
                                    <span className="text-gray-400 text-sm leading-relaxed">"URGENT: Password Expiry" or "Immediate Action Required". Attackers use fear and urgency to bypass logical reasoning. Verify through internal channels.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f1015] p-6 rounded-2xl border border-gray-800 flex flex-col relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl z-0" />
                    <h3 className="text-xl font-bold text-white mb-4 z-10 flex items-center gap-2">
                        <Terminal size={20} className="text-gray-400" /> Header Analysis Tool
                    </h3>
                    <div className="bg-black/80 backdrop-blur-md p-5 rounded-xl font-mono text-sm border border-gray-800/50 flex-1 z-10 shadow-inner">
                        <div className="text-gray-500 mb-3">// LIVE SCAN: SUSPICIOUS_EMAIL_042.eml</div>
                        <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row"><span className="text-blue-400 w-32 shrink-0">Return-Path:</span> <span className="text-red-400 break-all">&lt;bounce-832@hacker-infrastructure.xyz&gt;</span></div>
                            <div className="flex flex-col sm:flex-row"><span className="text-blue-400 w-32 shrink-0">Received:</span> <span className="text-gray-300 break-all">from unknown (45.12.99.1)</span></div>
                            <div className="flex flex-col sm:flex-row"><span className="text-blue-400 w-32 shrink-0">Date:</span> <span className="text-gray-300 break-all">Thu, 30 Oct 2025 14:22:01 +0000</span></div>
                            <div className="flex flex-col sm:flex-row"><span className="text-blue-400 w-32 shrink-0">X-Mailer:</span> <span className="text-gray-300 break-all">PHP/7.4.3 Scripts</span></div>
                            <div className="mt-4 pt-4 border-t border-gray-800">
                                <span className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded inline-flex items-center gap-2 font-bold text-xs"><AlertTriangle size={14} /> X-CORP-SCANNER: MALICIOUS PAYLOAD DETECTED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Renders the Tactical Operation Guides (Firewall manuals).
    const renderManualsContent = () => (
        <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-800/50 pb-6">
                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <BookOpen className="text-green-400" size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Tactical Operation Guides</h2>
                    <p className="text-gray-400 mt-1">Authorized technical manuals for active network defense.</p>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-gradient-to-br from-[#1a1c23] to-[#121318] border border-gray-700/50 rounded-2xl p-8 shadow-xl relative overflow-hidden group hover:border-red-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full blur-2xl group-hover:bg-red-500/20 transition-colors z-0" />
                    <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
                        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <Shield className="text-red-500" size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Firewall Defense (Node Intercept)</h3>
                            <div className="bg-red-500/10 text-red-400 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 border border-red-500/20 shadow-sm">CRITICAL SYSTEM</div>
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                Our bespoke grid-based firewall intercept system. When the network is swarmed, you must manually route filters to block compromised packets before they hit the core.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400 bg-black/40 p-5 rounded-xl border border-gray-800">
                                <li className="flex items-center gap-2.5"><ChevronRight size={16} className="text-red-500 shrink-0" /> Deploy nodes on high-traffic lanes.</li>
                                <li className="flex items-center gap-2.5"><ChevronRight size={16} className="text-red-500 shrink-0" /> Upgrade nodes to boost decryption speed.</li>
                                <li className="flex items-center gap-2.5"><ChevronRight size={16} className="text-red-500 shrink-0" /> Never let the core integrity drop to 0%.</li>
                                <li className="flex items-center gap-2.5"><ChevronRight size={16} className="text-red-500 shrink-0" /> Watch your bandwidth budget.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a1c23] to-[#121318] border border-gray-700/50 rounded-2xl p-8 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full blur-2xl group-hover:bg-emerald-500/20 transition-colors z-0" />
                    <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
                        <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <Map className="text-emerald-500" size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Firewall Defender (Global Optics)</h3>
                            <div className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 border border-emerald-500/20 shadow-sm">TACTICAL SYSTEM</div>
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                Geographic threat intelligence module. Attackers route through global proxies; this system visualizes incoming connections on a world map in real-time.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400 bg-black/40 p-5 rounded-xl border border-gray-800">
                                <li className="flex items-center gap-2.5"><ChevronRight size={16} className="text-emerald-500" /> Identify Red Zones (active threats).</li>
                                <li className="flex items-center gap-2.5"><ChevronRight size={16} className="text-emerald-500" /> Click rapidly to sever malicious connections.</li>
                                <li className="flex items-center gap-2.5"><ChevronRight size={16} className="text-emerald-500" /> Ignore green/internal traffic.</li>
                                <li className="flex items-center gap-2.5"><ChevronRight size={16} className="text-emerald-500" /> Prevent global saturation.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a1c23] to-[#121318] border border-gray-700/50 rounded-2xl p-8 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full blur-2xl group-hover:bg-blue-500/20 transition-colors z-0" />
                    <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
                        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <Lock className="text-blue-500" size={32} />
                        </div>
                        <div className="w-full">
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Network Access Policy</h3>
                            <div className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 border border-blue-500/20 shadow-sm">SECURITY DIRECTIVE</div>
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                Strict guidelines apply to all external and internal connective infrastructure. Unauthorized network connections represent an immediate critical vulnerability indicator.
                            </p>

                            <div className="bg-black/60 rounded-xl border border-gray-800 p-5 mb-4 shadow-inner">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-blue-500" /> Authorized Connectivity
                                </h4>
                                <div className="space-y-4 font-mono text-sm">
                                    <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                                        <span className="text-gray-500">PRIMARY NETWORK:</span>
                                        <span className="text-white font-bold bg-blue-500/20 px-3 py-1 rounded shadow-sm">CorpNet_Secure</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                                        <span className="text-gray-500">FAILOVER NETWORK:</span>
                                        <span className="text-white font-bold bg-blue-500/20 px-3 py-1 rounded shadow-sm">CorpDR</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-gray-500">GLOBAL PASSPHRASE:</span>
                                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20 shadow-sm cursor-text select-all">Corp@2026</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-red-500/10 p-4 rounded-xl border border-red-500/20 mt-4 shadow-inner">
                                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-200/80 leading-relaxed font-medium">
                                    <strong className="text-red-400 block mb-1">ZERO TOLERANCE POLICY:</strong>
                                    Any networks not explicitly listed above are strictly prohibited. Connecting to an unauthorized SSID is an immediate violation of operational guidelines and constitutes critical system exposure.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Renders the main Corporate Intranet Dashboard.
    const renderDashboard = () => (
        <div className="animate-in fade-in duration-700 pb-12">
            <div className="relative h-[360px] bg-[#050508] flex flex-col items-center justify-center overflow-hidden shrink-0 border-b border-white/5 shadow-2xl">
                {/* Modern subtle grids and glows */}
                <div className="absolute inset-0 bg-[#0a0a0c] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent z-10"></div>

                {/* Dynamic animated blobs */}
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] animate-pulse pointer-events-none mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

                <div className="relative z-20 text-center px-4 mt-6">
                    <div className="inline-flex items-center gap-2.5 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full text-xs font-medium text-blue-300 mb-8 font-mono shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        <Activity size={14} className="text-blue-400" /> STATUS: SECURE <span className="text-gray-500 mx-1">|</span> DEPLOYMENT ACTIVE
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl">
                        CORP<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-300">.SEC</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto tracking-wide">
                        Global Operational Security & Training Portal
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto pt-16 px-8 relative z-30 -mt-10 mb-12">
                <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-8 ml-2 opacity-80 flex items-center gap-3">
                    <div className="w-8 h-px bg-gray-700"></div>
                    Secure Modules & Intelligence
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div onClick={() => { setActiveTab('nist'); navigateTo('https://intranet.corp.sec/nist'); }} className="bg-[#121318]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all cursor-pointer group shadow-2xl relative overflow-hidden flex flex-col h-full transform hover:-translate-y-1 duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-4 bg-blue-500/10 rounded-2xl w-fit mb-6 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors shadow-inner">
                            <ShieldAlert size={32} className="text-blue-400 group-hover:scale-110 group-hover:text-blue-300 transition-all duration-300 drop-shadow-[0_0_8px_currentColor]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Frameworks</h3>
                        <p className="text-gray-400 text-sm leading-relaxed flex-1">Master the 5 pillars of the NIST framework that dictate every protocol and reaction in the field.</p>
                        <div className="mt-8 flex items-center text-blue-400 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            Access Module <ArrowRight size={16} className="ml-1.5" />
                        </div>
                    </div>

                    <div onClick={() => { setActiveTab('email'); navigateTo('https://intranet.corp.sec/threat-detection'); }} className="bg-[#121318]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all cursor-pointer group shadow-2xl relative overflow-hidden flex flex-col h-full transform hover:-translate-y-1 duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-4 bg-red-500/10 rounded-2xl w-fit mb-6 border border-red-500/20 group-hover:bg-red-500/20 transition-colors shadow-inner">
                            <Crosshair size={32} className="text-red-400 group-hover:scale-110 group-hover:text-red-300 transition-all duration-300 drop-shadow-[0_0_8px_currentColor]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Threat Detection</h3>
                        <p className="text-gray-400 text-sm leading-relaxed flex-1">Learn to identify high-sophistication phishing attempts and inspect malicious mail headers.</p>
                        <div className="mt-8 flex items-center text-red-400 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            Access Module <ArrowRight size={16} className="ml-1.5" />
                        </div>
                    </div>

                    <div onClick={() => { setActiveTab('games'); navigateTo('https://intranet.corp.sec/tactical-operations'); }} className="bg-[#121318]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all cursor-pointer group shadow-2xl relative overflow-hidden flex flex-col h-full transform hover:-translate-y-1 duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit mb-6 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors shadow-inner">
                            <Server size={32} className="text-emerald-400 group-hover:scale-110 group-hover:text-emerald-300 transition-all duration-300 drop-shadow-[0_0_8px_currentColor]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Tactical Operations</h3>
                        <p className="text-gray-400 text-sm leading-relaxed flex-1">Classified blueprints and operational manuals for the Firewall Defense and Defender systems.</p>
                        <div className="mt-8 flex items-center text-emerald-400 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            Access Module <ArrowRight size={16} className="ml-1.5" />
                        </div>
                    </div>

                    <div onClick={() => { setActiveTab('hr'); navigateTo('https://intranet.corp.sec/hr-portal'); }} className="bg-[#121318]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all cursor-pointer group shadow-2xl relative overflow-hidden flex flex-col h-full transform hover:-translate-y-1 duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-4 bg-purple-500/10 rounded-2xl w-fit mb-6 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors shadow-inner">
                            <User size={32} className="text-purple-400 group-hover:scale-110 group-hover:text-purple-300 transition-all duration-300 drop-shadow-[0_0_8px_currentColor]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">HR Portal</h3>
                        <p className="text-gray-400 text-sm leading-relaxed flex-1">Operator engagement, timesheets, and mandatory corporate documentation reviews.</p>
                        <div className="mt-8 flex items-center text-purple-400 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            Access Module <ArrowRight size={16} className="ml-1.5" />
                        </div>
                    </div>

                    <div onClick={() => { setActiveTab('maintenance'); navigateTo('https://intranet.corp.sec/maintenance'); }} className="bg-[#121318]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-orange-500/50 hover:bg-white/10 transition-all cursor-pointer group shadow-2xl relative overflow-hidden flex flex-col h-full transform hover:-translate-y-1 duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-4 bg-orange-500/10 rounded-2xl w-fit mb-6 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors shadow-inner">
                            <Zap size={32} className="text-orange-400 group-hover:scale-110 group-hover:text-orange-300 transition-all duration-300 drop-shadow-[0_0_8px_currentColor]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Maint. Schedule</h3>
                        <p className="text-gray-400 text-sm leading-relaxed flex-1">Track topology updates, core IDS rebuilds, and node downtime windows.</p>
                        <div className="mt-8 flex items-center text-orange-400 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            Access Module <ArrowRight size={16} className="ml-1.5" />
                        </div>
                    </div>

                    <div onClick={() => { setActiveTab('agenda'); navigateTo('https://intranet.corp.sec/meetings/agenda'); }} className="bg-[#121318]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all cursor-pointer group shadow-2xl relative overflow-hidden flex flex-col h-full transform hover:-translate-y-1 duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-4 bg-cyan-500/10 rounded-2xl w-fit mb-6 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors shadow-inner">
                            <BookOpen size={32} className="text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all duration-300 drop-shadow-[0_0_8px_currentColor]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Ops Agenda</h3>
                        <p className="text-gray-400 text-sm leading-relaxed flex-1">Confidential internal operations briefing, attacker profiling, and incident review.</p>
                        <div className="mt-8 flex items-center text-cyan-400 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            Access Module <ArrowRight size={16} className="ml-1.5" />
                        </div>
                    </div>

                    <div onClick={() => { setActiveTab('firewall'); navigateTo('https://intranet.corp.sec/ops/firewall'); }} className="bg-[#121318]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all cursor-pointer group shadow-2xl relative overflow-hidden flex flex-col h-full transform hover:-translate-y-1 duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-4 bg-indigo-500/10 rounded-2xl w-fit mb-6 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors shadow-inner">
                            <Settings size={32} className="text-indigo-400 group-hover:scale-110 group-hover:text-indigo-300 transition-all duration-300 drop-shadow-[0_0_8px_currentColor]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Tech Specs</h3>
                        <p className="text-gray-400 text-sm leading-relaxed flex-1">Deep inspection arrays, schematic configurations, and firewall node specs.</p>
                        <div className="mt-8 flex items-center text-indigo-400 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            Access Module <ArrowRight size={16} className="ml-1.5" />
                        </div>
                    </div>

                    <div onClick={() => { setActiveTab('payroll'); navigateTo('https://intranet.corp.sec/payroll'); }} className="bg-[#121318]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-yellow-500/50 hover:bg-white/10 transition-all cursor-pointer group shadow-2xl relative overflow-hidden flex flex-col h-full transform hover:-translate-y-1 duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-4 bg-yellow-500/10 rounded-2xl w-fit mb-6 border border-yellow-500/20 group-hover:bg-yellow-500/20 transition-colors shadow-inner">
                            <CreditCard size={32} className="text-yellow-400 group-hover:scale-110 group-hover:text-yellow-300 transition-all duration-300 drop-shadow-[0_0_8px_currentColor]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Payroll & HR</h3>
                        <p className="text-gray-400 text-sm leading-relaxed flex-1">Access your accumulated hazard pay, digital deposits, and current corporate benefits.</p>
                        <div className="mt-8 flex items-center text-yellow-400 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            Access Module <ArrowRight size={16} className="ml-1.5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Renders the Human Resources and Personnel management portal.
    const renderHrPortal = () => (
        <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-800/50 pb-6">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <User className="text-purple-400" size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">HR & Operator Engagement</h2>
                    <p className="text-gray-400 mt-1">Personnel management and company protocols.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#121318] p-8 rounded-3xl border border-white/5 shadow-xl hover:border-blue-500/30 transition-colors">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3"><Calendar className="text-blue-400 p-2 bg-blue-500/10 rounded-lg" size={32} /> Performance Reviews</h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">Q3 Operator Assessments are open. Incident response times will account for 40% of the final rating metric. Deadline is EOD Friday.</p>
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/25">Start Self-Assessment</button>
                </div>
                <div className="bg-[#121318] p-8 rounded-3xl border border-white/5 shadow-xl hover:border-emerald-500/30 transition-colors">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3"><Clock className="text-emerald-400 p-2 bg-emerald-500/10 rounded-lg" size={32} /> Time Tracking</h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">All shifts must be logged through the internal tracker. Overtime during active incidents is automatically aggregated.</p>
                    <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-emerald-500/25">View Timesheet</button>
                </div>
            </div>

            <div className="bg-gradient-to-br from-[#121318] to-[#0d0e12] p-8 rounded-3xl border border-gray-800/50 shadow-inner">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-gray-500" size={20} /> Corporate Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['Employee Handbook 2024', 'Benefits Summary', 'Vacation Policy', 'Incident NDA', 'Hardware Request Form'].map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 cursor-pointer transition-all group shadow-sm hover:shadow-md">
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{doc}</span>
                            <div className="p-2 bg-white/5 rounded-full group-hover:bg-blue-500/20 transition-colors">
                                <FileText size={14} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Renders the Payroll and Compensation details page.
    const renderPayroll = () => (
        <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-10 border-b border-gray-800/50 pb-6">
                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <CreditCard className="text-green-400" size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Payroll & Compensation</h2>
                    <p className="text-gray-400 mt-1">Financial records and direct deposits.</p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-[#1c1d24] to-[#121318] p-10 rounded-3xl border border-gray-700/50 mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-bl-[100px] blur-3xl z-0" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 relative z-10 gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-400 mb-2 uppercase tracking-wide text-xs">Current Pay Period</h3>
                        <p className="text-green-400 font-mono bg-green-500/10 px-4 py-1.5 rounded-lg inline-flex items-center gap-2 border border-green-500/20"><Calendar size={14} /> {getPayPeriod()}</p>
                    </div>
                    <div className="text-left md:text-right bg-black/60 p-5 rounded-2xl border border-gray-800 backdrop-blur-md min-w-[220px] shadow-inner">
                        <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">Net Deposit</p>
                        <div className="text-5xl font-black text-white">${accumulatedPay.toLocaleString()}<span className="text-gray-500 text-3xl">.00</span></div>
                    </div>
                </div>

                <div className="space-y-3 border-t border-gray-800/50 pt-8 relative z-10">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-gray-300 font-medium text-sm">Federal & State Tax</span>
                        <span className="text-red-400 font-mono">-$120.00</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl border border-transparent border-b border-gray-800 pb-8 mb-8">
                        <span className="text-gray-400 text-sm">Comprehensive Security Benefits</span>
                        <span className="text-red-400 font-mono">-$500.00</span>
                    </div>
                </div>
            </div>
            <p className="text-xs text-gray-500 text-center italic">If you notice payment discrepancies during hazard pay periods, contact Ops Management via the secure terminal.</p>
        </div>
    );

    // Renders the System Configuration and Maintenance schedule.
    const renderMaintenance = () => (
        <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-800/50 pb-6">
                <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                    <Zap className="text-orange-400" size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">System Configuration & Maintenance</h2>
                    <p className="text-gray-400 mt-1">Scheduled topology updates and downtime windows.</p>
                </div>
            </div>

            <div className="space-y-4">
                {[
                    { date: 'Tonight, 02:00 AM', system: 'Core IDS Cluster Rebuild', status: 'Approved', type: 'High Priority', color: 'orange' },
                    { date: 'Oct 18, 11:00 PM', system: 'VPN Gateway Auth Patch', status: 'Pending Review', type: 'Normal', color: 'blue' },
                    { date: 'Oct 22, 01:00 AM', system: 'Internal Mail Server Purge', status: 'Scheduled', type: 'Critical', color: 'red' }
                ].map((item, i) => (
                    <div key={i} className="bg-[#121318] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:border-gray-500/30 transition-all shadow-md group">
                        <div className="flex items-center gap-5">
                            <div className={`p-3 bg-${item.color}-500/10 rounded-xl text-${item.color}-500 shadow-inner block shrink-0`}>
                                <Server size={24} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white mb-1 tracking-tight">{item.system}</div>
                                <div className="text-sm text-gray-400 flex items-center gap-2 font-mono"><Clock size={14} className="text-gray-500" /> {item.date}</div>
                            </div>
                        </div>
                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-white/5 md:border-none">
                            <span className={`text-[10px] px-3 py-1.5 rounded-md font-extrabold uppercase tracking-widest ${item.type === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : item.type === 'High Priority' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                {item.type}
                            </span>
                            <div className="text-xs text-gray-500 mt-2 font-medium bg-black/30 px-2 py-1 rounded inline-block">{item.status}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Renders the Internal Operations Briefing (Confidential Agenda).
    const renderAgenda = () => (
        <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#15161A] p-12 rounded-[2.5rem] border border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600" />

                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest border border-red-500/20 shadow-sm">
                        <Lock size={12} /> CONFIDENTIAL - EYES ONLY
                    </div>
                    <h2 className="text-4xl font-bold text-white font-serif tracking-tight">Internal Operations Briefing</h2>
                    <p className="text-gray-500 text-sm mt-4 font-mono">SESSION ID: 0x992B.A4 // CLEARANCE: TIER-1</p>
                </div>

                <div className="space-y-12 text-gray-300 relative">
                    <div className="absolute left-[20px] top-6 bottom-6 w-px bg-gradient-to-b from-blue-500/50 via-gray-700 to-transparent" />

                    {[
                        { title: 'Recent Incident Review', desc: 'Post-mortem on the packet flood attempt from Oct 12. Analysis of ingress points and vector payloads. Attacker profiling indicates state-sponsored activity from APT-44.' },
                        { title: 'Firewall Upgrade Rollout', desc: 'Timeline for the "Firewall Defense" V4 module deployment. Shift assignments for network isolation tasks during the 4-hour hot-swap window.' },
                        { title: 'NIST Compliance Gap Analysis', desc: 'Addressing critical weaknesses in our \'Recover\' phase protocols. Mandating new encrypted backup rotations and cold-storage offsite delivery.' }
                    ].map((item, idx) => (
                        <div key={idx} className="relative pl-14 group">
                            <div className="absolute left-[14px] top-2 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] ring-4 ring-[#15161A] group-hover:bg-cyan-400 transition-colors" />
                            <h4 className="text-xl font-bold text-white mb-3 tracking-tight">{idx + 1}. {item.title}</h4>
                            <p className="text-base text-gray-400 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Renders the Technical Specifications for Firewall systems.
    const renderFirewallSpec = () => (
        <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-10 border-b border-gray-800/50 pb-6">
                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <Settings className="text-indigo-400" size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Ops Tech Spec: Firewall-V4</h2>
                    <p className="text-gray-400 mt-1">Hardware schematics and logic implementation.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#1c1f2e] to-[#12131a] p-8 rounded-3xl border border-blue-500/20 shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-colors">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-3 relative z-10"><Server size={24} className="p-1 bg-blue-500/10 rounded-md" /> Module A: Packet Filter</h3>
                        <p className="text-sm text-gray-400 leading-relaxed relative z-10 font-medium">Standard heuristic analysis unit. Designed to slice through malformed payloads with exceptional throughput. Low latency, cost-effective deployment across the edge.</p>
                    </div>

                    <div className="bg-gradient-to-br from-[#26162a] to-[#14121a] p-8 rounded-3xl border border-purple-500/20 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-3 relative z-10"><Terminal size={24} className="p-1 bg-purple-500/10 rounded-md" /> Module B: Deep Inspector</h3>
                        <p className="text-sm text-gray-400 leading-relaxed relative z-10 font-medium">Layer 7 deep packet inspection array. Slower, but capable of ripping open TLS traffic to find obscured payloads. Highly resource-heavy, deploy strategically.</p>
                    </div>
                </div>

                <div className="bg-[#0b0c0f] p-8 rounded-3xl border border-gray-800 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-800/80 pb-6">
                        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest font-bold">// System config schema</p>
                        <div className="flex gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.4)]"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.4)]"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                        </div>
                    </div>
                    <pre className="text-emerald-400/90 font-mono text-sm overflow-x-auto flex-1 leading-relaxed custom-scrollbar">
                        {`{
  "firewall_id": "FW-DELTA-01",
  "status": "ONLINE_SECURE",
  "nodes": [
    { 
      "type": "FILTER", 
      "range": 120, 
      "opt_mode": "AGGRESSIVE" 
    },
    { 
      "type": "INSPECTOR", 
      "range": 350 
    },
    { 
      "type": "TLS_CRACK", 
      "slowdown": 0.4,
      "decrypt_speed": "MAX"
    }
  ],
  "path_integrity": 100.0,
  "auto_start": true,
  "kill_switch": null
}`}
                    </pre>
                </div>
            </div>
        </div>
    );

    /* --- Page Routing Logic --- */
    const renderPageContent = () => {
        const url = currentUrl.toLowerCase();

        if (url.includes('/hr-portal') || activeTab === 'hr') return renderHrPortal();
        if (url.includes('/payroll') || activeTab === 'payroll') return renderPayroll();
        if (url.includes('/maintenance') || activeTab === 'maintenance') return renderMaintenance();
        if (url.includes('/meetings/agenda') || activeTab === 'agenda') return renderAgenda();
        if (url.includes('/ops/firewall') || activeTab === 'firewall') return renderFirewallSpec();

        // Training dashboard tabs
        if (activeTab === 'nist' || url.includes('/nist')) return renderNistContent();
        if (activeTab === 'email' || url.includes('/threat-detection')) return renderEmailSecurityContent();
        if (activeTab === 'games' || url.includes('/tactical-operations')) return renderManualsContent();

        return renderDashboard();
    };

    /* --- Main Layout Render --- */
    return (
        <div className="flex flex-col h-full bg-[#0a0a0c] text-gray-200 font-sans shadow-2xl overflow-hidden rounded-b-xl border border-gray-800/50">
            {/* Minimalist Corporate Browser Chrome */}
            <div className="bg-[#121318] p-2 flex items-center space-x-3 border-b border-gray-800/80 shrink-0 select-none relative z-50">
                <div className="flex space-x-1 pl-2">
                    <div className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer group"><ArrowLeft size={16} className="text-gray-500 group-hover:text-white" /></div>
                    <div className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer group"><ArrowRight size={16} className="text-gray-500 group-hover:text-white" /></div>
                    <div className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer group" onClick={() => setCurrentUrl(urlInput)}><RotateCw size={14} className="text-gray-500 group-hover:text-white" /></div>
                </div>

                <form onSubmit={handleUrlSubmit} className="flex-1 bg-[#09090b] rounded-xl px-4 py-2 text-sm flex items-center border border-gray-800 shadow-inner focus-within:border-blue-500/40 focus-within:ring-1 focus-within:ring-blue-500/40 transition-all">
                    {isPhishing ? <ShieldAlert size={16} className="text-red-500 mr-3" /> : <Lock size={16} className="text-emerald-500 mr-3" />}
                    <input
                        className="bg-transparent border-none outline-none text-gray-200 w-full placeholder-gray-700 font-medium"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Enter intranet URL..."
                        spellCheck="false"
                    />
                </form>

                <div className="flex items-center gap-1.5 px-3 border-l border-gray-800">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 mr-2 cursor-pointer hover:bg-blue-500/20 transition-colors">
                        <User size={14} className="text-blue-400" />
                    </div>
                    <div className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer group text-gray-500"><Settings size={18} className="group-hover:text-white" /></div>
                    <div className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer group text-gray-500"><Menu size={18} className="group-hover:text-white" /></div>
                </div>
            </div>

            {isPhishing ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#130606] text-white p-12 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden h-full">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-[#130606] to-[#130606] z-0" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515630278258-407f6ce22299?auto=format&fit=crop&q=80')] opacity-5 bg-cover mix-blend-overlay" />

                    <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
                        <div className="bg-red-500/10 p-8 rounded-full mb-8 shadow-[0_0_60px_rgba(239,68,68,0.2)] border border-red-500/30 relative backdrop-blur-md">
                            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-50" />
                            <AlertTriangle size={72} className="text-red-500 relative z-10 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-red-600 drop-shadow-xl">CRITICAL BREACH</h1>
                        <p className="text-xl text-red-200/70 mb-10 font-medium leading-relaxed max-w-xl">
                            A malicious payload was executed. Credentials compromised. Your session activity has been strictly logged and frozen.
                        </p>

                        <div className="w-full bg-black/80 p-6 rounded-2xl border border-red-500/40 text-left font-mono text-sm shadow-2xl backdrop-blur-xl mb-12">
                            <p className="text-red-500 mb-4 font-bold border-b border-red-500/30 pb-3 flex items-center gap-2"><Terminal size={16} /> // FORENSIC AUDIT TRAIL</p>
                            <div className="space-y-3 pl-2 border-l-2 border-red-500/30">
                                <p className="text-gray-300"><span className="text-gray-500 w-28 inline-block">VECTOR IP:</span> <span className="text-red-400">192.168.x.x (SPOOFED)</span></p>
                                <p className="text-gray-300"><span className="text-gray-500 w-28 inline-block">TARGET URL:</span> {currentUrl}</p>
                                <p className="text-gray-300"><span className="text-gray-500 w-28 inline-block">ACTION:</span> Auto-execution of credential harvester</p>
                                <p className="text-gray-300"><span className="text-gray-500 w-28 inline-block">STATUS:</span> <span className="bg-red-500 text-white px-2 py-0.5 rounded animate-pulse font-bold ml-1">COMPROMISED</span></p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigateTo("https://intranet.corp.sec/dashboard")}
                            className="bg-white text-red-900 px-10 py-4 rounded-xl font-black hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:translate-y-0"
                        >
                            ACKNOWLEDGE & SECURE
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Internal Navigation Sub-header */}
                    <div className="bg-[#0f1015]/95 backdrop-blur-xl border-b border-gray-800 px-6 pt-4 flex space-x-10 text-sm font-bold shrink-0 relative z-40 overflow-x-auto">
                        {[
                            { id: 'home', label: 'Dashboard', icon: Globe, path: '/dashboard' },
                            { id: 'nist', label: 'NIST', icon: ShieldCheck, path: '/nist' },
                            { id: 'email', label: 'Threat Det', icon: Crosshair, path: '/threat-detection' },
                            { id: 'games', label: 'Tactics', icon: Server, path: '/tactical-operations' },
                            { id: 'hr', label: 'HR', icon: User, path: '/hr-portal' },
                            { id: 'maintenance', label: 'Maint.', icon: Zap, path: '/maintenance' },
                            { id: 'agenda', label: 'Agenda', icon: BookOpen, path: '/meetings/agenda' },
                            { id: 'firewall', label: 'Specs', icon: Settings, path: '/ops/firewall' },
                            { id: 'payroll', label: 'Payroll', icon: CreditCard, path: '/payroll' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id as any); navigateTo(`https://intranet.corp.sec${tab.path}`); }}
                                className={`pb-4 border-b-[3px] transition-all flex items-center gap-2.5 whitespace-nowrap ${(activeTab === tab.id && (tab.id !== 'home' || currentUrl.includes('/dashboard')))
                                    ? 'border-blue-500 text-blue-400 shadow-[inset_0_-1px_0_0_rgba(59,130,246,0.3)]'
                                    : 'border-transparent text-gray-500 hover:text-gray-200 hover:border-gray-600'
                                    }`}
                            >
                                <tab.icon size={16} className={(activeTab === tab.id && (tab.id !== 'home' || currentUrl.includes('/dashboard'))) ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'text-gray-600'} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Viewport */}
                    <div className="flex-1 overflow-y-auto bg-[#0a0a0c] relative custom-scrollbar">
                        {renderPageContent()}

                        {/* Minimal Footer */}
                        <div className="text-center py-6 text-gray-600 text-[10px] font-mono border-t border-gray-800/80 bg-[#050508] shrink-0 uppercase tracking-widest mt-auto">
                            &copy; 2026 Corp.Sec Solutions &middot; Authorized Personnel Only &middot; Network Monitoring Active
                        </div>
                    </div>
                </>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #050508; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 4px; border: 2px solid #050508; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #374151; }
            `}} />
        </div>
    );
};

export default CorpBrowser;