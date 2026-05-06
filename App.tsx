/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React from 'react';
import { OSProvider, useOS } from './context/OSContext';
import { APPS, WALLPAPER_URL } from './constants';
import DesktopIcon from './components/DesktopIcon';
import Window from './components/Window';
import Taskbar from './components/Taskbar';
import StartMenu from './components/StartMenu';
import NotificationToast from './components/NotificationToast';
import IncidentDashboard from './components/apps/IncidentDashboard';
import ThreatReportingSidebar from './components/ThreatReportingSidebar';
import GameMenu from './components/GameMenu';
import ShiftReport from './components/ShiftReport';
import KaliDesktop from './components/KaliDesktop';
import WelcomeOverlay from './components/WelcomeOverlay';
import FileUploadPopup from './components/FileUploadPopup';
import NetworkErrorDialog from './components/NetworkErrorDialog';
import BSOD from './components/BSOD';
import { Activity, Monitor, ShieldAlert } from 'lucide-react';

/* ==========================================================================
   HELPER COMPONENT: MalwareVisuals
   ========================================================================== */
// Renders visual artifacts and glitch effects when the system is compromised by malware.
const MalwareVisuals: React.FC = () => {
  const { isMalwareCompromised } = useOS();
  const [showPrompts, setShowPrompts] = React.useState(false);
  const [filePos, setFilePos] = React.useState({ x: 50, y: 50 });
  const [isVisible, setIsVisible] = React.useState(false);

  // Teleporting file effect
  React.useEffect(() => {
    if (!isMalwareCompromised) {
      setIsVisible(false);
      setShowPrompts(false);
      return;
    }

    // Initial position
    setFilePos({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10
    });
    setIsVisible(true);

    const promptTimeout = setTimeout(() => {
      setShowPrompts(true);
    }, 15000);

    return () => {
      clearTimeout(promptTimeout);
    };
  }, [isMalwareCompromised]);

  const handleIconClick = () => {
    // Moves only when clicked
    setFilePos({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10
    });
  };

  if (!isMalwareCompromised) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999]">
      {/* Teleporting File Icon - Interactive */}
      <div
        onClick={handleIconClick}
        className={`absolute flex flex-col items-center gap-1 transition-all duration-500 cursor-pointer pointer-events-auto hover:brightness-125 active:scale-90 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ left: `${filePos.x}%`, top: `${filePos.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <img
          src="/assets/Icons/txt-file.png"
          alt="txt"
          className="w-12 h-12 object-contain drop-shadow-lg"
        />
        <div className="bg-blue-600/80 text-white text-[10px] px-1 rounded shadow-sm font-sans whitespace-nowrap select-none">
          system_debug.log
        </div>
      </div>

      {/* Delayed Flashing Prompts */}
      {showPrompts && (
        <div className="absolute inset-0 overflow-hidden bg-green-500/5 animate-pulse">
          <div className="absolute top-[20%] left-[15%] text-green-500 font-mono text-sm bg-black/80 p-2 border border-green-500/50 rounded shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            &gt; STAGE_2_REPLICATION_SUCCESSFUL
          </div>
          <div className="absolute top-[45%] right-[25%] text-green-500 font-mono text-sm bg-black/80 p-2 border border-green-500/50 rounded shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            &gt; BYPASSING_KERNEL_SECURITY...
          </div>
          <div className="absolute bottom-[30%] left-[40%] text-green-500 font-mono text-sm bg-black/80 p-2 border border-green-500/50 rounded shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            ⚠ THREAT_LEVEL_CRITICAL: WORM_ACTIVE
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   COMPONENT: Desktop
   ========================================================================== */
// Represents the main Windows-style desktop environment.
const Desktop: React.FC = () => {
  const { windows, desktopIcons, emails, setAttackState, reportThreat, currentAttackType, isUnderAttack, isMalwareCompromised, setIsDashboardOpen } = useOS();

  const handleEmergencyResponse = () => {
    const success = reportThreat({
      type: 'ransomware',
      description: 'SYSTEM LOCKOUT: Automated Critical Threat Report',
      severity: 'critical',
      status: 'pending'
    });
    if (success) {
      setAttackState(true);
      setIsDashboardOpen(true);
    }
  };

  // For game loop purposes, presence of email = latent threat exists until resolved/reported
  const activeMalware = emails.some(e => e.type === 'malware');
  const activeRansomware = emails.some(e => e.type === 'ransomware');
  const activeDDoS = emails.some(e => e.type === 'ddos');

  // Network Attack State (Visuals)
  const isNetworkAttack = currentAttackType === 'network' && isUnderAttack;
  const [uploadPopups, setUploadPopups] = React.useState<{ id: string, filename: string }[]>([]);

  const removePopup = (id: string) => {
    setUploadPopups(prev => prev.filter(p => p.id !== id));
  };

  // Immediate spawn on start
  React.useEffect(() => {
    if (isNetworkAttack && uploadPopups.length === 0) {
      setUploadPopups([{ id: 'init-1', filename: 'root_access_log.txt' }]);
    }
  }, [isNetworkAttack]);

  // Spawn random upload popups during network attack
  React.useEffect(() => {
    if (isNetworkAttack) {
      const interval = setInterval(() => {
        if (Math.random() > 0.5) { // Increased frequency
          const id = Date.now().toString();
          const filenames = ['passwords.txt', 'cookies.sqlite', 'shadow_copy.bak', 'private_keys.pem', 'camera_feed.mp4', 'sys32_dump.bin', 'browser_history.log', 'vnc_credentials.dat'];
          const filename = filenames[Math.floor(Math.random() * filenames.length)];
          setUploadPopups(prev => [...prev.slice(-15), { id, filename }]); // Limit to 15 max
        }
      }, 1500); // Faster interval
      return () => clearInterval(interval);
    } else {
      setUploadPopups([]);
    }
  }, [isNetworkAttack]);

  return (
    <div
      className="w-full h-screen overflow-hidden relative bg-cover bg-center select-none"
      style={{ backgroundImage: `url(${WALLPAPER_URL})` }}
    >
      {/* --- VULNERABILITY EFFECTS OVERLAY --- */}

      {/* RANSOMWARE LOCK SCREEN */}
      {activeRansomware && (
        <div className="absolute inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
          {/* Background flashing red */}
          <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none"></div>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.5)_2px,rgba(0,0,0,0.5)_4px)] pointer-events-none opacity-50"></div>

          <ShieldAlert size={96} className="text-red-500 mb-6 animate-[bounce_1s_infinite]" />

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter shadow-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">
            SYSTEM LOCKED
          </h1>

          <div className="bg-red-950/80 border-2 border-red-600 p-8 rounded-lg max-w-2xl backdrop-blur-md shadow-2xl relative z-10">
            <p className="text-xl md:text-2xl text-red-200 font-mono font-bold mb-4">
              CRITICAL SECURITY VIOLATION
            </p>
            <p className="text-md text-red-300/80 mb-8 font-mono">
              Ransomware encryption signatures detected in local mail storage.
              <br />
              All desktop functions have been suspended to prevent data loss.
            </p>
            <button
              onClick={handleEmergencyResponse}
              className="bg-red-600 hover:bg-red-500 text-white text-lg md:text-xl font-bold py-4 px-10 rounded shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:scale-105 transition-all uppercase tracking-widest flex items-center justify-center mx-auto gap-3"
            >
              <Activity className="animate-spin" /> Initiate Emergency Response
            </button>
          </div>

          <div className="absolute bottom-10 text-red-500/50 font-mono text-xs">
            ERROR_CODE: 0xDEADBEEF // MEMORY_CORRUPTION
          </div>
        </div>
      )}

      {activeDDoS && (
        <div className="absolute top-12 right-2 z-[200] flex items-center gap-2 bg-red-500/90 text-white text-[10px] px-2 py-1 rounded shadow-lg animate-pulse font-mono border border-black/50">
          <Activity size={12} className="animate-spin" />
          NETWORK INSTABILITY DETECTED
        </div>
      )}

      {/* Desktop Icons Grid */}
      <div className="flex flex-col flex-wrap h-[calc(100%-48px)] w-fit content-start p-2 gap-2 z-10 relative">
        {desktopIcons.map(appId => (
          <DesktopIcon key={appId} appId={appId} />
        ))}
      </div>

      {/* Windows Layer */}
      {windows.map(windowState => {
        const appConfig = APPS[windowState.appId];
        return (
          <Window
            key={windowState.id}
            windowState={windowState}
            component={appConfig.component}
          />
        );
      })}

      {/* NETWORK ATTACK VISUALS */}
      {isNetworkAttack && (
        <div className="fixed inset-0 pointer-events-none z-[8000]">
          <div className="absolute top-12 right-2 pointer-events-auto flex items-center gap-2 bg-yellow-600/90 text-white text-[10px] px-2 py-1 rounded shadow-lg animate-pulse font-mono border border-black/50">
            <Activity size={12} className="animate-spin" />
            UNAUTHORIZED DATA EXFILTRATION DETECTED
          </div>
          {uploadPopups.map(p => (
            <div key={p.id} className="pointer-events-auto">
              <FileUploadPopup id={p.id} filename={p.filename} onClose={removePopup} />
            </div>
          ))}
        </div>
      )}

      {/* System UI Layers */}
      <StartMenu />
      <NotificationToast />
      <Taskbar />
    </div>
  );
};

/* ==========================================================================
   COMPONENT: MainLayout
   ========================================================================== */
// Manages the high-level layout switching between the Windows Desktop, Kali Linux (Forensics), and the Incident Response Dashboard.
const MainLayout: React.FC = () => {
  const { isUnderAttack, setAttackState, currentAttackType, gameState, isSessionActive, systemMode, endShift, isDashboardOpen, setIsDashboardOpen } = useOS();

  // Logic to determine which screen to show
  // If ransom/malware/ddos, we usually show dashboard unless user manually toggled away (but ransomware might lock it)
  const isAutomaticDashboard = isUnderAttack && (currentAttackType === 'ransomware' || currentAttackType === 'malware' || currentAttackType === 'ddos');
  const showDashboard = isAutomaticDashboard || isDashboardOpen;

  if (systemMode === 'kali') {
    return (
      <div className="relative h-screen w-screen overflow-hidden">
        <KaliDesktop />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {showDashboard ? (
        <IncidentDashboard onResolve={() => {
          setAttackState(false);
          setIsDashboardOpen(false);
        }} />
      ) : (
        <>
          <Desktop />
          <ThreatReportingSidebar />
        </>
      )}


      {/* Scene Switcher Toggle */}
      {currentAttackType !== 'ransomware' && (
        <button
          onClick={() => setIsDashboardOpen(!isDashboardOpen)}
          className="fixed top-4 right-4 z-[9999] bg-black/50 hover:bg-black/80 text-white p-2 rounded-full border border-white/20 hover:border-white/50 backdrop-blur transition-all active:scale-95 group"
          title={isDashboardOpen ? "Switch to Desktop" : "Switch to IR Command"}
        >
          {isDashboardOpen ? (
            <Monitor size={20} className="text-blue-400 group-hover:text-blue-300" />
          ) : (
            <ShieldAlert size={20} className="text-red-500 group-hover:text-red-400 animate-pulse" />
          )}
        </button>
      )}

      {/* Shift Report Overlay */}
      {!gameState.isShiftActive && isSessionActive && (
        <ShiftReport />
      )}

      {/* TOP LEVEL MALWARE VISUALS */}
      <MalwareVisuals />
    </div>
  );
};

/* ==========================================================================
   COMPONENT: Orchestrator
   ========================================================================== */
// The top-level logic controller that manages game menus, BSODs, and the overall simulation lifecycle.
const Orchestrator: React.FC = () => {
  const { isPaused, startSession, isSessionActive, startForensicSession, showWelcome, gameState } = useOS();

  if (gameState.systemCrash?.crashed) {
    return <BSOD />;
  }

  return (
    <>
      <div style={{ display: (isPaused && !showWelcome) ? 'none' : 'block', height: '100vh', width: '100vw' }}>
        <MainLayout />
      </div>

      {isPaused && !showWelcome && (
        <div className="absolute inset-0 z-[99999]">
          <GameMenu onStartGame={startSession} onStartForensic={startForensicSession} isResumable={isSessionActive} />
        </div>
      )}

      <WelcomeOverlay />
      <NetworkErrorDialog />
    </>
  );
};

/* ==========================================================================
   MAIN COMPONENT: App
   ========================================================================== */
// The root Application component providing the global OS Context.
const App: React.FC = () => {
  return (
    <OSProvider>
      <Orchestrator />
    </OSProvider>
  );
};

export default App;