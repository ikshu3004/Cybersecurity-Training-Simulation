/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppID, OSContextType, WindowState, Email, Notification, AttackType, ReportedThreat, GameState, GameEvent, SystemMode, ForensicDay, MenuState, NetworkState, WifiNetwork, AudioSettings } from '../types';
import { APPS, INITIAL_DESKTOP_ICONS, EMAIL_TEMPLATES, generateHeaders, SHIFT_CONFIGS } from '../constants';
import { SHIFT_SCHEDULE } from '../schedule';

/* ==========================================================================
   CONTEXT DEFINITION
   ========================================================================== */
const OSContext = createContext<OSContextType | undefined>(undefined);

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};

/* ==========================================================================
   MAIN PROVIDER COMPONENT
   ========================================================================== */
export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /* --- State: Window Management --- */
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(10);

  /* --- State: Network --- */
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: false,
    ssid: null,
    isTrusted: false
  });
  const networkStateRef = useRef(networkState);

  useEffect(() => {
    networkStateRef.current = networkState;
  }, [networkState]);

  const [availableNetworks, setAvailableNetworks] = useState<WifiNetwork[]>([
    { ssid: 'CorpNet_Secure', type: 'trusted', strength: 100, isLocked: true },
    { ssid: 'CorpDR', type: 'trusted', strength: 90, isLocked: true },
    { ssid: 'Free_Coffee_Wifi', type: 'public', strength: 80, isLocked: false },
    { ssid: 'HP-Printer-Network', type: 'spoofed', strength: 60, isLocked: true },
    { ssid: 'Netgear_Guest', type: 'public', strength: 90, isLocked: false },
    { ssid: 'FBI_Surveillance_Van', type: 'spoofed', strength: 40, isLocked: true }
  ]);

  /* --- State: Mail & Notifications --- */
  const [emails, setEmails] = useState<Email[]>([]);
  const emailsRef = useRef<Email[]>([]);
  useEffect(() => {
    emailsRef.current = emails;
  }, [emails]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Bag System for Email Variety (Deck without replacement)
  const emailBags = useRef<Record<string, any[]>>({});

  // Event Queue Ref (Mutable for stability in Game Loop)
  const eventQueueRef = useRef<GameEvent[]>([]);

  const getEmailFromBag = useCallback((type: string) => {
    // Initialize or Refill if empty
    if (!emailBags.current[type] || emailBags.current[type].length === 0) {
      // Get templates from constants
      const templates = EMAIL_TEMPLATES[type] || [];
      if (templates.length === 0) return null;

      // Clone and Shuffle
      const bag = [...templates];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      emailBags.current[type] = bag;
    }

    // Pop one
    return emailBags.current[type].pop();
  }, []);

  /* --- State: Security & Threats --- */
  const [isUnderAttack, setAttackState] = useState(false);
  const [currentAttackType, setAttackType] = useState<AttackType>('none');
  const [isMalwareCompromised, setIsMalwareCompromised] = useState(false);
  const [reportedThreats, setReportedThreats] = useState<ReportedThreat[]>([]);

  /* --- State: Session Control --- */
  const [isPaused, setPaused] = useState(true);
  const [isSessionActive, setSessionActive] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  /* --- State: Audio Settings --- */
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    notifications: 0.8,
    systemTrack: 0.5,
    ransomware: 0.9,
    malware: 0.7,
    network: 0.7,
    desktopNoise: 0.3,
    kaliTrack: 0.5,
    reportTrack: 0.6
  });

  const updateAudioSetting = useCallback((key: keyof AudioSettings, value: number) => {
    setAudioSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  /* --- State: Game Progression --- */
  const [gameState, setGameState] = useState<GameState>({
    currentDay: 1,
    shiftStartTime: 0,
    elapsedTimeReal: 0,
    isShiftActive: false,
    isGameComplete: false,
    accumulatedPay: 0,
    shiftStats: {
      threatsHandled: 0,
      falsePositives: 0,
      threatsEncountered: 0,
      systemIntegrity: 100,
      budget: 50000,
      firewallDefenderScore: 0,
      firewallDefenseScore: 0,
      networkBreachOccurred: false
    },
    triggeredRansomwareEvents: [],
    eventQueue: [],
    systemCrash: null
  });

  const elapsedTimeRealRef = useRef(0);

  useEffect(() => {
    elapsedTimeRealRef.current = gameState.elapsedTimeReal;
  }, [gameState.elapsedTimeReal]);

  const [systemMode, setSystemMode] = useState<SystemMode>('windows');
  const [forensicDay, setForensicDay] = useState<ForensicDay | null>(null);

  /* --- Logic: Shift & Session Management --- */
  const startShift = useCallback((day: number) => {
    setWindows([]);
    setSystemMode('windows');
    setForensicDay(null);
    // GENERATE EVENT QUEUE BASED ON STATIC SCHEDULE
    const scheduleKey = `day_${day}`;
    const dailySchedule = SHIFT_SCHEDULE[scheduleKey] || [];
    const events: GameEvent[] = [];
    let eventIdCounter = 0;

    dailySchedule.forEach((scriptedEvent: any) => {
      let type: GameEvent['type'] = 'legit';
      const rawType = scriptedEvent.type.toLowerCase();

      if (rawType === 'phishing') type = 'phishing';
      else if (rawType === 'malware') type = 'malware';
      else if (rawType === 'ransomware') type = 'ransomware';
      else if (rawType === 'network') type = 'network';
      else if (rawType === 'legit') type = 'legit';

      events.push({
        id: `evt-${day}-${eventIdCounter++}`,
        time: scriptedEvent.time_sec,
        type
      });
    });

    // Sort by time just in case JSON isn't sorted
    events.sort((a, b) => a.time - b.time);

    // Set Ref immediately
    eventQueueRef.current = events;

    setGameState(prev => ({
      ...prev,
      currentDay: day,
      accumulatedPay: day === 1 ? 0 : prev.accumulatedPay,
      shiftStartTime: Date.now(),
      elapsedTimeReal: 0,
      isShiftActive: true,
      shiftStats: {
        threatsHandled: 0,
        falsePositives: 0,
        threatsEncountered: 0,
        systemIntegrity: 100,
        budget: 50000,
        firewallDefenderScore: 0,
        firewallDefenseScore: 0,
        networkBreachOccurred: false
      },
      triggeredRansomwareEvents: [],
      eventQueue: [],
      systemCrash: null
    }));
    elapsedTimeRealRef.current = 0;
    setPaused(false);
    setNotifications([]);
    setReportedThreats([]);
    setEmails([]); // Clear emails for new day
    setAttackState(false); // Reset attack state
    setAttackType('none');
    setIsMalwareCompromised(false);
    addNotification("Shift Started", `Day ${day} begins. Good luck.`, "corp_mail");

    // Network Reset for Day 2+ (Simulate Maintenance)
    if (day >= 2 && day <= 5) {
      setNetworkState({ isConnected: false, ssid: null, isTrusted: false });
      setShowNetworkError(true);
      setTimeout(() => {
        addNotification("IT UPDATE", "CorpNet is undergoing scheduled maintenance. Please use alternative networks if urgent.", "firewall");
      }, 2000);
    } else {
      // Auto-connect on Day 1
      setNetworkState({ isConnected: true, ssid: 'CorpNet_Secure', isTrusted: true });
    }

    if (day === 1) {
      setShowWelcome(true);
      setPaused(true);
    }
  }, []);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    setPaused(false);
  }, []);

  const dismissNetworkError = useCallback(() => {
    setShowNetworkError(false);
  }, []);

  // Forensic Mode Logic
  const startForensicSession = useCallback((day: ForensicDay) => {
    setSessionActive(true);
    setPaused(false);
    setSystemMode('kali');
    setForensicDay(day);
    setWindows([]);
  }, []);

  const endShift = useCallback(() => {
    setGameState(prev => {
      const basePay = 120;
      let minigameBonus = 0;

      if (!prev.shiftStats.networkBreachOccurred) {
        minigameBonus = (prev.shiftStats.firewallDefenderScore / 10) + (prev.shiftStats.firewallDefenseScore / 5);
      }

      // Penalty proportional to system integrity
      // 100% integrity = $0 penalty
      // 0% integrity = $100 penalty (max)
      const integrityPenalty = (100 - prev.shiftStats.systemIntegrity);

      // False positives also penalize
      const falsePositivePenalty = prev.shiftStats.falsePositives * 5;

      const shiftPay = Math.max(0, basePay + minigameBonus - integrityPenalty - falsePositivePenalty);

      return {
        ...prev,
        isShiftActive: false,
        accumulatedPay: prev.accumulatedPay + shiftPay
      };
    });
  }, []);

  const startSession = useCallback((day?: number) => {
    setSessionActive(true);
    setPaused(false);

    if (day !== undefined) {
      startShift(day);
    } else if (!gameState.isShiftActive) {
      if (gameState.elapsedTimeReal > 0 || gameState.currentDay > 1) {
        // Resume logic
      } else {
        startShift(1);
      }
    }
  }, [gameState.isShiftActive, gameState.currentDay, gameState.elapsedTimeReal, startShift]);

  /* --- State: Menu --- */
  const [menuState, setMenuState] = useState<MenuState>('SINGLE_PLAYER');

  /* --- Logic: Sound Management --- */
  // Sound Refs
  const notificationAudio = useRef<HTMLAudioElement | null>(null);
  const desktopAudio = useRef<HTMLAudioElement | null>(null);
  const irCommandAudio = useRef<HTMLAudioElement | null>(null);
  const kaliAudio = useRef<HTMLAudioElement | null>(null);
  const malwareAudio = useRef<HTMLAudioElement | null>(null);
  const networkAudio = useRef<HTMLAudioElement | null>(null);
  const ransomwareAudio = useRef<HTMLAudioElement | null>(null);
  const reportAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    desktopAudio.current = new Audio('/assets/Audio/Desktop Noise.mp3');
    irCommandAudio.current = new Audio('/assets/Audio/IR Command.mp3');
    kaliAudio.current = new Audio('/assets/Audio/Kali.mp3');
    malwareAudio.current = new Audio('/assets/Audio/Malware.mp3');
    networkAudio.current = new Audio('/assets/Audio/Network.mp3');
    ransomwareAudio.current = new Audio('/assets/Audio/Ransomware.mp3');
    reportAudio.current = new Audio('/assets/Audio/Report.mp3');

    // Set looping for background tracks
    [desktopAudio, irCommandAudio, kaliAudio, malwareAudio, networkAudio].forEach(ref => {
      if (ref.current) ref.current.loop = true;
    });
  }, []);

  const playNotificationSound = useCallback(() => {
    if (notificationAudio.current) {
      notificationAudio.current.volume = audioSettings.notifications;
      notificationAudio.current.play().catch(e => console.log('Audio play failed', e));
    }
  }, [audioSettings.notifications]);

  const playRansomwareSound = useCallback(() => {
    if (ransomwareAudio.current) {
      ransomwareAudio.current.volume = audioSettings.ransomware;
      ransomwareAudio.current.play().catch(e => { });
    }
  }, [audioSettings.ransomware]);

  const playReportSound = useCallback(() => {
    if (reportAudio.current) {
      reportAudio.current.volume = audioSettings.reportTrack;
      reportAudio.current.currentTime = 0;
      reportAudio.current.play().catch(e => { });
      setTimeout(() => {
        if (reportAudio.current) reportAudio.current.pause();
      }, 3000);
    }
  }, [audioSettings.reportTrack]);

  // Main Audio Controller
  useEffect(() => {
    // If not in a session or paused, silence all looping sounds
    if (!isSessionActive || isPaused) {
      [desktopAudio, irCommandAudio, kaliAudio, malwareAudio, networkAudio].forEach(ref => {
        if (ref.current && !ref.current.paused) {
          ref.current.pause();
        }
      });
      return;
    }

    const isIRActive = (systemMode === 'windows' && isDashboardOpen);
    const isKaliActive = (systemMode === 'kali');
    const isDesktopActive = (systemMode === 'windows' && !isDashboardOpen);
    const isMalwareActive = isMalwareCompromised;
    const isNetworkActive = isUnderAttack && currentAttackType === 'network';

    // Muting logic: IR Command/Ransomware mutes others
    const isRansomwareActive = emails.some(e => e.type === 'ransomware');
    const volumeMultiplier = (isIRActive || isRansomwareActive) ? 0 : 1;

    const tracks = [
      { ref: desktopAudio, active: isDesktopActive, setting: 'desktopNoise' as keyof AudioSettings },
      { ref: irCommandAudio, active: isIRActive, setting: 'systemTrack' as keyof AudioSettings },
      { ref: kaliAudio, active: isKaliActive, setting: 'kaliTrack' as keyof AudioSettings },
      { ref: malwareAudio, active: isMalwareActive, setting: 'malware' as keyof AudioSettings },
      { ref: networkAudio, active: isNetworkActive, setting: 'network' as keyof AudioSettings },
    ];

    tracks.forEach(({ ref, active, setting }) => {
      const audio = ref.current;
      if (!audio) return;

      if (active) {
        // If ransomware is active, only ALLOW the ransomware one-shot
        // Background tracks are muted if either IR is active or Ransomware is active
        const multiplier = (setting === 'systemTrack') ? 1 : volumeMultiplier;
        audio.volume = audioSettings[setting] * (isRansomwareActive ? 0 : multiplier);
        if (audio.paused) {
          audio.play().catch(() => { });
        }
      } else {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    });
  }, [isSessionActive, isPaused, systemMode, forensicDay, isMalwareCompromised, isUnderAttack, currentAttackType, audioSettings, isDashboardOpen, emails]);

  /* --- Handlers: Security & OS Notifications --- */
  const addNotification = useCallback((title: string, message: string, appId: AppID) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, title, message, appId }]);
    playNotificationSound();

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, [playNotificationSound]);

  const reportThreat = useCallback((threat: ReportedThreat | Omit<ReportedThreat, 'id' | 'timestamp'>) => {
    // Prevent duplicate reports for the same type if one is already pending/analyzing
    const isAlreadyReported = reportedThreats.some(t =>
      t.type === threat.type && (t.status === 'pending' || t.status === 'analyzing')
    );
    if (isAlreadyReported) return false;

    // Validation: Check if there's plausible evidence (an email of that type)
    const isValidReport = emails.some(e => e.type === threat.type);

    const newReport: ReportedThreat = {
      id: 'id' in threat ? threat.id : Date.now().toString(),
      timestamp: 'timestamp' in threat ? threat.timestamp : new Date(),
      status: isValidReport ? 'analyzing' : 'false_positive',
      ...threat
    } as ReportedThreat;

    if (isValidReport) {
      setReportedThreats(prev => [newReport, ...prev]);
      addNotification('Threat Report Logged', `Report for ${threat.type} has been confirmed.`, 'firewall');

      // Auto-resolve network attacks upon successful reporting to stop visual effects
      if (threat.type === 'network') {
        setAttackState(false);
        setAttackType('none');
      }
      if (threat.type === 'malware') {
        setIsMalwareCompromised(false);
      }
      playReportSound();
    } else {
      addNotification('FALSE POSITIVE DETECTED', `No active signature for ${threat.type}. Report flagged invalid.`, 'firewall');
      setGameState(prev => ({
        ...prev,
        shiftStats: { ...prev.shiftStats, falsePositives: prev.shiftStats.falsePositives + 1 }
      }));
    }
    playNotificationSound();
    return isValidReport;
  }, [addNotification, playNotificationSound, playReportSound, emails]);

  const resolveThreat = useCallback((id: string) => {
    // Find threat to identify type
    const threat = reportedThreats.find(t => t.id === id);
    if (threat) {
      // Clear active emails of this type to stop desktop effects
      setEmails(prev => prev.filter(e => e.type !== threat.type));
      if (threat.type === 'malware') {
        setIsMalwareCompromised(false);
      }
      // Track as handled
      setGameState(prev => ({
        ...prev,
        shiftStats: { ...prev.shiftStats, threatsHandled: prev.shiftStats.threatsHandled + 1 }
      }));
    }
    setReportedThreats(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
  }, [reportedThreats]);

  /* --- Handlers: Network Connectivity --- */
  const connectToNetwork = useCallback((ssid: string, password?: string) => {
    const net = availableNetworks.find(n => n.ssid === ssid);
    if (!net) return { success: false, message: 'Network not found' };

    if (net.type === 'trusted') {
      // Maintenance Mode for Day 2+ (Applies only to CorpNet_Secure)
      if (ssid === 'CorpNet_Secure' && gameState.currentDay >= 2) {
        return { success: false, message: 'Unavailable: Scheduled Maintenance' };
      }

      if (password === 'Corp@2026') {
        setNetworkState({ isConnected: true, ssid: net.ssid, isTrusted: true });
        return { success: true };
      } else {
        return { success: false, message: 'Incorrect Password' };
      }
    }

    // Spoofed networks accept any password (that's the trap!)
    if (net.isLocked && !password) {
      return { success: false, message: 'Password required' };
    }

    setNetworkState({ isConnected: true, ssid: net.ssid, isTrusted: false });
    return { success: true };

  }, [availableNetworks, gameState.currentDay]);

  const disconnect = useCallback(() => {
    setNetworkState({ isConnected: false, ssid: null, isTrusted: false });
  }, []);

  const persistedStatesRef = useRef<Record<AppID, any>>({} as Record<AppID, any>);

  /* --- Handlers: Window Management --- */
  const toggleStartMenu = useCallback(() => {
    setStartMenuOpen(prev => !prev);
  }, []);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, zIndex: nextZIndex + 1, isMinimized: false };
      }
      return w;
    }));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const openApp = useCallback((appId: AppID, data?: any) => {
    const appConfig = APPS[appId];
    // Check if single instance app is already open
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      setWindows(prev => prev.map(w => {
        if (w.id === existing.id) {
          return {
            ...w,
            isMinimized: false,
            zIndex: nextZIndex + 1,
            data: data !== undefined ? data : w.data
          };
        }
        return w;
      }));
      setActiveWindowId(existing.id);
      setNextZIndex(prev => prev + 1);
      setStartMenuOpen(false);
      return;
    }

    const id = `${appId} - ${Date.now()}`;
    const offset = windows.length * 30;

    // Restore persisted state if it exists
    const restoredData = data || persistedStatesRef.current[appId];

    const newWindow: WindowState = {
      id,
      appId,
      title: appConfig.title,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex + 1,
      position: { x: 100 + offset, y: 50 + offset },
      size: appConfig.defaultSize,
      data: restoredData
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(id);
    setNextZIndex(prev => prev + 1);
    setStartMenuOpen(false);
  }, [windows, nextZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const closing = prev.find(w => w.id === id);
      if (closing && closing.data) {
        persistedStatesRef.current[closing.appId] = closing.data;
      }
      return prev.filter(w => w.id !== id);
    });
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  }, [activeWindowId]);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    focusWindow(id);
  }, [focusWindow]);

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position: { x, y } } : w));
  }, []);

  const updateWindowSize = useCallback((id: string, w: number, h: number) => {
    setWindows(prev => prev.map(win => win.id === id ? { ...win, size: { w, h } } : win));
  }, []);

  const updateWindowData = useCallback((id: string, data: any) => {
    setWindows(prev => prev.map(win => win.id === id ? { ...win, data: { ...win.data, ...data } } : win));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markEmailRead = useCallback((id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  }, []);

  const deleteEmail = useCallback((id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id));
  }, []);

  /* ==========================================================================
     MAIN GAME LOOP: Event & Integrity Processing
     ========================================================================== */
  useEffect(() => {
    if (isPaused || !gameState.isShiftActive) return;

    const interval = setInterval(() => {
      // 1. Calculate next state values
      let nextElapsed = 0;
      let day = 1;

      setGameState(prev => {
        nextElapsed = prev.elapsedTimeReal + 1;
        elapsedTimeRealRef.current = nextElapsed;
        day = prev.currentDay;

        // --- SYSTEM INTEGRITY LOGIC ---
        let integrityDeduction = 0;
        let activeThreatsTypes = new Set<string>();

        emailsRef.current.forEach(e => {
          if (e.type === 'phishing') integrityDeduction += 0.5;
          if (e.type === 'network') integrityDeduction += 2.5;
          if (e.type === 'malware') integrityDeduction += 2.5;
          if (e.type === 'ransomware') integrityDeduction += 5;
          if (['phishing', 'network', 'malware', 'ransomware'].includes(e.type)) {
            activeThreatsTypes.add(e.type);
          }
        });

        const config = SHIFT_CONFIGS[day - 1];
        const durationSecs = config?.durationRealTimeSecs || 480;
        const integrityReplenishment = 100 / durationSecs;

        let newIntegrity = prev.shiftStats.systemIntegrity + integrityReplenishment - integrityDeduction;
        newIntegrity = Math.max(0, Math.min(100, newIntegrity));

        const isCrash = newIntegrity <= 0;
        let crashReason = "";
        if (isCrash && prev.shiftStats.systemIntegrity > 0) {
          if (activeThreatsTypes.has('ransomware')) {
            crashReason = 'Fatal error caused by unmitigated threat: Ransomware (Required Action: ISOLATE HOST).';
          } else if (activeThreatsTypes.has('network')) {
            crashReason = 'Fatal error caused by unmitigated threat: Network Exfiltration (Required Action: BLOCK SOURCE).';
          } else if (activeThreatsTypes.has('malware')) {
            crashReason = 'Fatal error caused by unmitigated threat: Malware Infection (Required Action: QUARANTINE).';
          } else if (activeThreatsTypes.has('phishing')) {
            crashReason = 'Fatal error caused by unmitigated threat: Phishing Breach (Required Action: RESET CREDS).';
          } else {
            crashReason = "System Integrity compromised due to unmitigated cyber threats.";
          }
        }



        return {
          ...prev,
          elapsedTimeReal: nextElapsed,
          shiftStats: { ...prev.shiftStats, systemIntegrity: newIntegrity },
          systemCrash: isCrash
            ? { crashed: true, reason: crashReason || prev.systemCrash?.reason || "System Integrity compromised due to unmitigated cyber threats." }
            : prev.systemCrash
        };
      });

      // 2. Process events using the new time
      const config = SHIFT_CONFIGS[day - 1];
      if (!config) return;

      // Event Queue handling
      const firedEvents: GameEvent[] = [];
      if (eventQueueRef.current.length > 0 && nextElapsed >= eventQueueRef.current[0].time) {
        firedEvents.push(eventQueueRef.current.shift()!);
      }

      if (firedEvents.length > 0) {
        const newEmailsBatch: Email[] = [];
        let networkTrigger = false;
        let ransomwareTrigger = false;

        firedEvents.forEach((event, index) => {
          const isDay5Override = day === 5 && (event.type === 'ransomware' || event.type === 'network' || event.type === 'malware');
          const isUntrustedNetwork = networkStateRef.current && !networkStateRef.current.isTrusted;

          if (event.type === 'network') {
            if (isUntrustedNetwork || isDay5Override) {
              networkTrigger = true;
              newEmailsBatch.push({
                id: `net - attack - ${Date.now()} - ${index}`,
                from: "SYSTEM",
                subject: "Data Exfiltration Detected",
                preview: "Unusual outbound traffic detected on port 443...",
                time: new Date(),
                read: false,
                body: "Firewall has detected large outbound data transfers to an unknown remote host.\n\nSource: Local\nDestination: 192.168.X.X (Spoofed)\n\nIMMEDIATE ACTION REQUIRED.",
                type: 'network',
                headers: "X-YARA-RULE: SUSPICIOUS_NETWORK_ORIGIN"
              });
            }
          } else if (event.type === 'ransomware') {
            if (isUntrustedNetwork || isDay5Override) {
              newEmailsBatch.push({
                id: `ransomware - ${Date.now()} - ${index}`,
                from: "SYSTEM_ROOT",
                subject: "CRITICAL: FILES ENCRYPTED",
                preview: "ALL YOUR DATA HAS BEEN LOCKED.",
                time: new Date(),
                read: false,
                body: "YOUR FILES ARE ENCRYPTED. PAY 10 BTC OR LOST DATA FOREVER.\n\nWallet: 0xDEADBEEF...",
                type: 'ransomware',
                headers: "X-RANSOM: TRUE"
              });
              ransomwareTrigger = true;
            }
          } else {
            const template = getEmailFromBag(event.type);
            // Allow phishing/malware/legit/funny etc.
            if (template && (isUntrustedNetwork || isDay5Override || event.type === 'legit' || event.type === 'funny' || event.type === 'phishing' || event.type === 'malware')) {
              newEmailsBatch.push({
                id: event.id,
                from: template.from,
                subject: template.subject,
                preview: template.body.substring(0, 50) + "...",
                time: new Date(),
                read: false,
                body: template.body,
                type: event.type as any,
                headers: generateHeaders(event.type, template.from, template.subject, new Date())
              });
            }
          }
        });

        if (newEmailsBatch.length > 0) {
          const threatCount = newEmailsBatch.filter(e => e.type !== 'legit' && e.type !== 'funny').length;
          setEmails(current => [...newEmailsBatch, ...current]);
          playNotificationSound();
          if (threatCount > 0) {
            setGameState(prev => ({
              ...prev,
              shiftStats: { ...prev.shiftStats, threatsEncountered: prev.shiftStats.threatsEncountered + threatCount }
            }));
          }
          newEmailsBatch.forEach(e => {
            if (e.type !== 'ransomware' && e.type !== 'network') {
              addNotification(e.type === 'legit' ? 'New Email' : 'Suspicious Email Detected', `From: ${e.from}`, 'corp_mail');
            }
          });
        }

        if (networkTrigger) {
          setAttackType('network');
          setAttackState(true);
          setGameState(prev => ({
            ...prev,
            shiftStats: { ...prev.shiftStats, networkBreachOccurred: true }
          }));
          addNotification("NETWORK ALERT", "Unauthorized data exfiltration detected.", "firewall");
        }

        if (ransomwareTrigger) {
          addNotification("CRITICAL ALERT", "Encryption process detected!", "firewall");
          playRansomwareSound();
        }
      }

      // Check Shift End
      const currentElapsed = elapsedTimeRealRef.current;
      if (currentElapsed >= config.durationRealTimeSecs) {
        endShift();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, gameState.isShiftActive, addNotification, playNotificationSound, getEmailFromBag, endShift]);

  const triggerNetworkAttack = useCallback(() => {
    if (isUnderAttack && currentAttackType === 'network') return;

    setAttackState(true);
    setAttackType('network');
    setGameState(prev => ({
      ...prev,
      shiftStats: { ...prev.shiftStats, networkBreachOccurred: true }
    }));

    const networkEmail: Email = {
      id: `net - attack - loss - ${Date.now()}`,
      from: "SYSTEM",
      subject: "Data Exfiltration Detected (Breach)",
      preview: "Firewall has been bypassed. Outbound traffic spike...",
      time: new Date(),
      read: false,
      body: "CRITICAL ALERT: The firewall defense has been compromised. An attacker is currently exfiltrating sensitive company data.\n\nIMMEDIATE CONTAINMENT REQUIRED.",
      type: 'network',
      headers: "X-YARA-RULE: FIREWALL_BYPASS_DETECTED"
    };

    setEmails(prev => [networkEmail, ...prev]);
    addNotification("NETWORK ALERT", "Firewall bypassed! Data exfiltration in progress.", "firewall");
    playNotificationSound();
  }, [addNotification, playNotificationSound]);

  /* ==========================================================================
     CONTEXT PROVIDER RENDER
     ========================================================================== */
  const providerValue: OSContextType = {
    windows,
    activeWindowId,
    startMenuOpen,
    toggleStartMenu,
    openApp,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    updateWindowData,
    desktopIcons: INITIAL_DESKTOP_ICONS,
    emails,
    markEmailRead,
    deleteEmail,
    notifications,
    dismissNotification,
    isUnderAttack,
    setAttackState,
    isDashboardOpen,
    setIsDashboardOpen,
    currentAttackType,
    setAttackType,
    reportedThreats,
    reportThreat,
    resolveThreat,
    isPaused,
    setPaused,
    isSessionActive,
    startSession,
    audioSettings,
    updateAudioSetting,
    gameState,
    startShift,
    endShift,
    resetSession: (hardReset = false) => {
      setWindows([]);
      persistedStatesRef.current = {} as Record<AppID, any>;
      setSessionActive(false);
      setPaused(true);
      setSystemMode('windows');
      setForensicDay(null);
      setMenuState('SINGLE_PLAYER');
      setIsMalwareCompromised(false);
      setShowNetworkError(false);

      if (hardReset) {
        setGameState(prev => ({
          ...prev,
          currentDay: 1,
          accumulatedPay: 0,
          isShiftActive: false,
          shiftStats: {
            threatsHandled: 0,
            falsePositives: 0,
            threatsEncountered: 0,
            systemIntegrity: 100,
            budget: 50000,
            firewallDefenderScore: 0,
            firewallDefenseScore: 0,
            networkBreachOccurred: false
          },
          systemCrash: null
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          isShiftActive: false,
          shiftStats: {
            ...prev.shiftStats,
            firewallDefenderScore: 0,
            firewallDefenseScore: 0,
            networkBreachOccurred: false
          },
          systemCrash: null
        }));
      }
      setShowWelcome(false);
    },
    systemMode,
    forensicDay,
    startForensicSession,
    menuState,
    setMenuState,
    networkState,
    availableNetworks,
    connectToNetwork,
    disconnect,
    triggerNetworkAttack,
    isMalwareCompromised,
    triggerMalwareAttack: () => {
      setIsMalwareCompromised(true);
      addNotification("SYSTEM ALERT", "Unauthorized execution detected.", "firewall_defender");
    },
    updateShiftStats: (stats: Partial<GameState['shiftStats']>) => {
      setGameState(prev => ({
        ...prev,
        shiftStats: { ...prev.shiftStats, ...stats }
      }));
    },
    showWelcome,
    dismissWelcome,
    showNetworkError,
    dismissNetworkError
  };

  return (
    <OSContext.Provider value={providerValue}>
      {children}
    </OSContext.Provider>
  );
};