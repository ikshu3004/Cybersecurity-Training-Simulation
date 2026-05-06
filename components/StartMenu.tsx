/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useRef, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { APPS } from '../constants';
import { User, Power, Settings, ShieldAlert, Mail, Globe, Map } from 'lucide-react';
import { AppID } from '../types';
import DynamicIcon from './DynamicIcon';

// A Windows 10 inspired Start Menu for the virtual OS.
const StartMenu: React.FC = () => {
  /* --- Hooks & Event Handlers --- */
  const { startMenuOpen, toggleStartMenu, openApp, resetSession } = useOS();
  const menuRef = useRef<HTMLDivElement>(null);

  // Click-outside logic to auto-close the menu if the user interacts with the desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && startMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('#start-button')) {
          toggleStartMenu();
        }
      }
    };

    if (startMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [startMenuOpen, toggleStartMenu]);

  /* --- Visibility Check --- */
  if (!startMenuOpen) return null;

  const appList: AppID[] = ['corp_mail', 'corp_browser', 'firewall', 'firewall_defender'];

  /* ==========================================================================
     RENDER RETURN
     ========================================================================== */
  return (
    <div
      ref={menuRef}
      className="absolute bottom-12 left-0 w-[600px] h-[500px] bg-[#1e1e1e]/95 backdrop-blur-md text-white flex shadow-2xl z-[100] border-t border-r border-gray-600 animate-in slide-in-from-bottom-10 fade-in duration-200"
    >
      {/* Sidebar Controls */}
      <div className="w-12 flex flex-col justify-end items-center pb-4 space-y-4 hover:w-48 transition-all group bg-[#191919] absolute top-0 bottom-0 left-0 z-20 overflow-hidden whitespace-nowrap">
        <div className="flex items-center px-4 w-full cursor-pointer hover:bg-white/10 p-2">
          <User size={20} className="min-w-[20px]" />
          <span className="ml-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Corp Trainee</span>
        </div>
        <div className="flex items-center px-4 w-full cursor-pointer hover:bg-white/10 p-2">
          <Settings size={20} className="min-w-[20px]" />
          <span className="ml-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Settings</span>
        </div>
        <div className="flex items-center px-4 w-full cursor-pointer hover:bg-white/10 p-2" onClick={() => resetSession()}>
          <Power size={20} className="min-w-[20px]" />
          <span className="ml-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Power</span>
        </div>
      </div>

      {/* App List */}
      <div className="w-64 ml-12 py-4 overflow-y-auto pl-4 pr-2 scrollbar-hide">
        <div className="text-xs font-semibold mb-4 px-2">Corp Apps</div>
        {appList.map(id => {
          const app = APPS[id];
          return (
            <div key={id} onClick={() => openApp(id)} className="flex items-center p-2 hover:bg-white/10 cursor-pointer rounded-sm">
              <div className={`${app.color} p-1.5 rounded mr-3`}>
                <DynamicIcon icon={app.icon} size={16} />
              </div>
              <span className="text-sm">{app.title}</span>
            </div>
          )
        })}
      </div>

      {/* Tiles Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#1e1e1e]">
        <div className="text-xs font-semibold mb-2">Productivity</div>
        <div className="grid grid-cols-2 gap-1">
          <div onClick={() => openApp('corp_mail')} className="bg-blue-600 w-full aspect-[2/1] col-span-2 p-3 flex flex-col justify-between hover:border-2 border-white/50 cursor-pointer group">
            <DynamicIcon icon={APPS.corp_mail.icon} size={32} />
            <span className="text-xs">CorpMail</span>
          </div>
          <div onClick={() => openApp('corp_browser')} className="bg-slate-700 w-full aspect-square p-3 flex flex-col justify-between hover:border-2 border-white/50 cursor-pointer group">
            <DynamicIcon icon={APPS.corp_browser.icon} size={32} />
            <span className="text-xs">Corp Browser</span>
          </div>
          <div onClick={() => openApp('firewall')} className="bg-red-600 w-full aspect-square p-3 flex flex-col justify-between hover:border-2 border-white/50 cursor-pointer group">
            <DynamicIcon icon={APPS.firewall.icon} size={32} />
            <span className="text-xs">Firewall Defense</span>
          </div>
          <div onClick={() => openApp('firewall_defender')} className="bg-emerald-600 w-full aspect-square p-3 flex flex-col justify-between hover:border-2 border-white/50 cursor-pointer group">
            <DynamicIcon icon={APPS.firewall_defender.icon} size={32} />
            <span className="text-xs">Firewall Defender</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;