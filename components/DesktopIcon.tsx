/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React from 'react';
import { AppID } from '../types';
import { APPS } from '../constants';
import { useOS } from '../context/OSContext';

import DynamicIcon from './DynamicIcon';

interface DesktopIconProps {
  appId: AppID;
}

/* ==========================================================================
   MAIN COMPONENT: DesktopIcon
   ========================================================================== */
// Represents a single application icon on the virtual desktop.
const DesktopIcon: React.FC<DesktopIconProps> = ({ appId }) => {
  /* --- Hooks & Context State --- */
  const { openApp, currentAttackType, isUnderAttack } = useOS();
  const app = APPS[appId];

  // Network Attack Visual Effect: Icons become blank/corrupted
  const isNetworkAttack = isUnderAttack && currentAttackType === 'network';

  /* ==========================================================================
     RENDER RETURN
     ========================================================================== */
  return (
    <div
      className="flex flex-col items-center justify-center w-24 h-24 hover:bg-white/10 border border-transparent hover:border-white/20 rounded cursor-default active:bg-white/20 group"
      onDoubleClick={() => openApp(appId)}
    >
      <div className={`w-12 h-12 ${isNetworkAttack ? 'bg-gray-700 animate-pulse' : app.color} flex items-center justify-center p-1 rounded mb-1 transition-all duration-500`}>
        {!isNetworkAttack && <DynamicIcon icon={app.icon} size={40} className="text-white" />}
      </div>
      <span className={`text-white text-[11px] font-normal text-center px-1 drop-shadow-md line-clamp-2 leading-tight ${isNetworkAttack ? 'text-transparent bg-gray-700 rounded w-16 h-3 mt-1' : ''}`} style={{ textShadow: isNetworkAttack ? 'none' : '0px 1px 2px rgba(0,0,0,0.8)' }}>
        {app.title}
      </span>
    </div>
  );
};

export default DesktopIcon;