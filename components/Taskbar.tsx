/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { APPS, SHIFT_CONFIGS } from '../constants';
import { ChevronUp, Wifi, Volume2, MessageSquare, Battery, WifiOff } from 'lucide-react';
import { AppID } from '../types';
import DynamicIcon from './DynamicIcon';
import NetworkPopup from './NetworkPopup';

// The persistent taskbar providing navigation, app management, and system status.
const Taskbar: React.FC = () => {
  /* --- Hooks & Context State --- */
  const {
    windows,
    activeWindowId,
    toggleStartMenu,
    startMenuOpen,
    focusWindow,
    minimizeWindow,
    openApp,
    gameState,
    networkState
  } = useOS();

  const [isNetworkPopupOpen, setIsNetworkPopupOpen] = useState(false);

  const [setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* --- Logic & App Processing --- */
  const pinnedApps: AppID[] = ['corp_mail', 'corp_browser', 'firewall', 'firewall_defender'];

  const taskbarItems = [...pinnedApps];
  windows.forEach(w => {
    if (!taskbarItems.includes(w.appId)) {
      taskbarItems.push(w.appId);
    }
  });

  /* --- Event Handlers --- */
  const handleAppClick = (appId: string) => {
    const openWindow = windows.find(w => w.appId === appId);
    if (openWindow) {
      if (activeWindowId === openWindow.id && !openWindow.isMinimized) {
        minimizeWindow(openWindow.id);
      } else {
        focusWindow(openWindow.id);
      }
    } else {
      openApp(appId as any);
    }
  };

  /* ==========================================================================
     RENDER RETURN
     ========================================================================== */
  return (
    <div className="h-12 w-full bg-[#101010]/95 backdrop-blur-md flex items-center justify-between z-[100] absolute bottom-0 select-none border-t border-white/10 text-white">
      <div className="flex items-center h-full">
        {/* Start Button */}
        <div
          id="start-button"
          className={`h-full w-12 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors ${startMenuOpen ? 'bg-white/10' : ''}`}
          onClick={toggleStartMenu}
        >
          <DynamicIcon icon="/assets/Icons/windows_icon.png" size={24} />
        </div>

        {/* Search Mock */}
        <div className="hidden sm:flex items-center bg-white h-8 w-64 ml-2 px-3 text-gray-500 text-sm hover:bg-gray-100 cursor-text">
          <span>Type here to search</span>
        </div>

        {/* Task View / Cortana placeholders */}
        <div className="w-10 h-full flex items-center justify-center hover:bg-white/10 cursor-pointer ml-1">
          <div className="w-4 h-4 border-2 border-white rounded-full"></div>
        </div>

        {/* Icons */}
        <div className="flex items-center ml-1 h-full">
          {taskbarItems.map(appId => {
            const app = APPS[appId];
            if (!app) return null;

            const isOpen = windows.some(w => w.appId === appId);
            const isActive = activeWindowId && windows.find(w => w.id === activeWindowId)?.appId === appId;

            return (
              <div
                key={appId}
                className={`h-full w-12 flex items-center justify-center hover:bg-white/10 cursor-pointer relative group ${isActive ? 'bg-white/10' : ''}`}
                onClick={() => handleAppClick(appId)}
              >
                <DynamicIcon icon={app.icon} size={22} className={isOpen ? 'opacity-100' : 'opacity-70'} />
                {isOpen && (
                  <div className={`absolute bottom-0 h-[2px] w-full transition-all ${isActive ? 'bg-blue-400 w-full' : 'bg-gray-400 w-2 group-hover:w-full'}`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* System Tray */}
      <div className="flex items-center h-full px-2 text-xs space-x-1">
        <div className="px-1 hover:bg-white/10 h-full flex items-center cursor-pointer">
          <ChevronUp size={16} />
        </div>
        <div className="px-2 hover:bg-white/10 h-full flex items-center cursor-pointer">
          <Battery size={16} />
        </div>
        <div
          className="px-2 hover:bg-white/10 h-full flex items-center cursor-pointer relative"
          onClick={() => setIsNetworkPopupOpen(!isNetworkPopupOpen)}
        >
          {networkState.isConnected ? <Wifi size={16} /> : <WifiOff size={16} className="text-gray-400" />}

          {isNetworkPopupOpen && (
            <div
              className="fixed inset-0 z-[150]"
              onClick={(e) => { e.stopPropagation(); setIsNetworkPopupOpen(false); }}
            ></div>
          )}
          {isNetworkPopupOpen && <NetworkPopup onClose={() => setIsNetworkPopupOpen(false)} />}
        </div>
        <div className="px-2 hover:bg-white/10 h-full flex items-center cursor-pointer">
          <Volume2 size={16} />
        </div>
        <div className="px-2 hover:bg-white/10 h-full flex flex-col justify-center items-end cursor-pointer min-w-[100px] text-right">
          {gameState.isShiftActive ? (
            <>
              <span className="font-mono text-green-400">Day {gameState.currentDay}</span>
              <span>
                {(() => {
                  const shiftDuration = SHIFT_CONFIGS[gameState.currentDay - 1]?.durationRealTimeSecs || 480;
                  // 8 hours (9-5) = 480 game minutes
                  // Game Minutes Per Real Second = 480 / shiftDuration
                  const gameMinutesPerRealSecond = 480 / shiftDuration;

                  const totalGameMinutesPassed = Math.floor(gameState.elapsedTimeReal * gameMinutesPerRealSecond);
                  const startMinutes = 9 * 60; // 540 minutes
                  const currentTotalMinutes = startMinutes + totalGameMinutesPassed;

                  let hours = Math.floor(currentTotalMinutes / 60);
                  const minutes = currentTotalMinutes % 60;
                  const ampm = hours >= 12 ? 'PM' : 'AM';

                  if (hours > 12) hours -= 12;

                  const minStr = minutes.toString().padStart(2, '0');
                  return `${hours}:${minStr} ${ampm}`;
                })()}
              </span>
            </>
          ) : (
            <span className="text-gray-400">OFAD</span>
          )}
        </div>
        <div className="px-3 hover:bg-white/10 h-full flex items-center cursor-pointer border-l border-gray-600 ml-1">
          <MessageSquare size={16} />
        </div>
        <div className="w-1 h-full border-l border-gray-500 ml-1 hover:bg-white/20 cursor-pointer"></div>
      </div>
    </div>
  );
};

export default Taskbar;