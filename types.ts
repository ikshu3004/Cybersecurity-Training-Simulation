/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React from 'react';
import { LucideIcon } from 'lucide-react';

/* ==========================================================================
   APP & WINDOW TYPES
   ========================================================================== */
export type AppID = 'corp_mail' | 'corp_browser' | 'firewall' | 'firewall_defender' | 'kali_terminal' | 'kali_file_manager' | 'kali_instructions';

export interface AppConfig {
  id: AppID;
  title: string;
  icon: LucideIcon | string;
  color: string;
  component: React.ComponentType<any>;
  defaultSize: { w: number; h: number };
}

export interface WindowState {
  id: string;
  appId: AppID;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { w: number; h: number };
  data?: any;
}

/* ==========================================================================
   MAIL & NOTIFICATION TYPES
   ========================================================================== */
export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: Date;
  read: boolean;
  body: string;
  priority?: boolean;
  type: 'legit' | 'phishing' | 'funny' | 'ransomware' | 'malware' | 'ddos' | 'network';
  headers: string;
}

/* ==========================================================================
   AUDIO TYPES
   ========================================================================== */
export interface AudioSettings {
  notifications: number;
  systemTrack: number;
  ransomware: number;
  malware: number;
  network: number;
  desktopNoise: number;
  kaliTrack: number;
  reportTrack: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  appId: AppID;
}

export type SystemMode = 'windows' | 'kali';
export type ForensicDay = 3 | 4 | 5;

export type MenuState = 'SINGLE_PLAYER' | 'SETTINGS';

/* ==========================================================================
   CONTEXT TYPE DEFINITION
   ========================================================================== */
export interface OSContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  startMenuOpen: boolean;
  toggleStartMenu: () => void;
  openApp: (appId: AppID, data?: any) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, w: number, h: number) => void;
  updateWindowData: (id: string, data: any) => void;
  desktopIcons: AppID[];

  // Audio System
  audioSettings: AudioSettings;
  updateAudioSetting: (key: keyof AudioSettings, value: number) => void;

  // Mail & Notification System
  emails: Email[];
  markEmailRead: (id: string) => void;
  deleteEmail: (id: string) => void;
  notifications: Notification[];
  dismissNotification: (id: string) => void;

  // Security Event System
  isUnderAttack: boolean;
  setAttackState: (state: boolean) => void;
  isDashboardOpen: boolean;
  setIsDashboardOpen: (open: boolean) => void;

  // Advanced Threat Logic
  currentAttackType: AttackType;
  setAttackType: (type: AttackType) => void;
  reportedThreats: ReportedThreat[];
  reportThreat: (threat: ReportedThreat | Omit<ReportedThreat, 'id' | 'timestamp'>) => boolean;
  resolveThreat: (id: string) => void;

  // Session Management
  isPaused: boolean;
  setPaused: (paused: boolean) => void;
  isSessionActive: boolean;
  startSession: (day?: number) => void;

  // Game State
  gameState: GameState;
  startShift: (day: number) => void;
  endShift: () => void;
  resetSession: (hardReset?: boolean) => void;

  // Menu State
  menuState: MenuState;
  setMenuState: (state: MenuState) => void;

  // Forensic Mode
  systemMode: SystemMode;
  forensicDay: number | null;
  startForensicSession: (day: ForensicDay) => void;

  // Network System
  networkState: NetworkState;
  availableNetworks: WifiNetwork[];
  connectToNetwork: (ssid: string, password?: string) => { success: boolean; message?: string };
  disconnect: () => void;
  triggerNetworkAttack: () => void;
  isMalwareCompromised: boolean;
  triggerMalwareAttack: () => void;
  updateShiftStats: (stats: Partial<GameState['shiftStats']>) => void;
  showWelcome: boolean;
  dismissWelcome: () => void;
  showNetworkError: boolean;
  dismissNetworkError: () => void;
}
/* ==========================================================================
   SECURITY & THREAT TYPES
   ========================================================================== */
export type AttackType = 'none' | 'ransomware' | 'phishing' | 'malware' | 'ddos' | 'network';

export interface ReportedThreat {
  id: string;
  type: AttackType;
  description: string;
  source?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  status: 'pending' | 'analyzing' | 'resolved' | 'false_positive';
}

/* ==========================================================================
   SESSION & GAME STATE TYPES
   ========================================================================== */
export interface ShiftConfig {
  day: number;
  durationRealTimeSecs: number;
  // Quotas removed in favor of static schedule
}

export interface ScriptedEvent {
  time_sec: number;
  game_time: string;
  type: string; // "Legit" | "Phishing" etc
}

export interface GameEvent {
  id: string;
  time: number;
  type: 'legit' | 'phishing' | 'malware' | 'ransomware' | 'network' | 'funny';
  details?: any;
}

export interface GameState {
  currentDay: number;
  shiftStartTime: number; // timestamp
  elapsedTimeReal: number; // seconds
  isShiftActive: boolean;
  isGameComplete: boolean;
  accumulatedPay: number;
  shiftStats: {
    threatsHandled: number;
    falsePositives: number;
    threatsEncountered: number;
    systemIntegrity: number; // 0-100%
    budget: number;
    firewallDefenderScore: number;
    firewallDefenseScore: number;
    networkBreachOccurred: boolean;
  };
  triggeredRansomwareEvents: number[]; // Store trigger timestamps that have already fired
  eventQueue: GameEvent[];
  systemCrash: { crashed: boolean; reason: string } | null;
}

/* ==========================================================================
   NETWORK TYPES
   ========================================================================== */
export interface NetworkState {
  isConnected: boolean;
  ssid: string | null;
  isTrusted: boolean;
}

export interface WifiNetwork {
  ssid: string;
  type: 'trusted' | 'public' | 'spoofed';
  strength: number; // 0-100
  isLocked: boolean;
}
