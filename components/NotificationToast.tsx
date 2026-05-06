/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React from 'react';
import { useOS } from '../context/OSContext';
import { APPS } from '../constants';
import { X } from 'lucide-react';
import DynamicIcon from './DynamicIcon';

// A notification system that displays toast alerts in the bottom-right corner.
const NotificationToast: React.FC = () => {
    /* --- Hooks & Context State --- */
    const { notifications, dismissNotification, openApp } = useOS();

    /* ==========================================================================
       RENDER RETURN
       ========================================================================== */
    return (
        <div className="absolute bottom-12 right-0 flex flex-col items-end gap-2 p-4 z-[9999] pointer-events-none">
            {notifications.map(n => {
                const app = APPS[n.appId] || APPS['firewall_defender'];
                return (
                    <div
                        key={n.id}
                        className="w-80 bg-[#1f1f1f] border border-[#333] shadow-2xl rounded-sm pointer-events-auto animate-in slide-in-from-right-full duration-300 relative group cursor-pointer"
                        onClick={() => {
                            if (APPS[n.appId]) openApp(n.appId);
                            dismissNotification(n.id);
                        }}
                    >
                        <div className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <DynamicIcon icon={app.icon} size={16} className="text-[#0078d4]" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{app.title}</span>
                                <div
                                    className="ml-auto p-1 hover:bg-white/10 rounded cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dismissNotification(n.id);
                                    }}
                                >
                                    <X size={14} className="text-gray-400" />
                                </div>
                            </div>
                            <div className="font-semibold text-sm text-gray-200 mb-1">{n.title}</div>
                            <div className="text-xs text-gray-400 line-clamp-2">{n.message}</div>
                        </div>
                        {/* Progress bar visual for timeout */}
                        <div className="h-[2px] w-full bg-[#333]">
                            <div className="h-full bg-[#0078d4] animate-[width_5s_linear_forwards]" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default NotificationToast;