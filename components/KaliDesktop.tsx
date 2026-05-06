/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React from 'react';
import { useOS } from '../context/OSContext';
import DesktopIcon from './DesktopIcon';
import Window from './Window';
import { APPS } from '../constants';
import { AppID } from '../types';

// A specialized desktop environment for the Kali Linux forensics simulation.
const KaliDesktop: React.FC = () => {
    /* --- Hooks & Configuration --- */
    const { windows, openApp } = useOS();

    // Specific icons for Kali
    const kaliIcons: AppID[] = ['kali_instructions', 'kali_file_manager', 'kali_terminal'];

    /* ==========================================================================
       RENDER RETURN
       ========================================================================== */
    return (
        <div
            className="w-full h-screen overflow-hidden relative select-none font-mono"
            style={{
                backgroundImage: 'url(/assets/Wallpaper/kali_wallpaper.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#e0e0e0'
            }}
        >
            {/* Top Bar for Kali (Gnome-like or XFCE-like) */}
            <div className="w-full h-8 bg-black/80 border-b border-gray-800 flex items-center px-4 justify-between z-20 absolute top-0">
                <div className="flex items-center gap-4 text-sm font-bold text-gray-300">
                    <span>Applications</span>
                    <span>Places</span>
                </div>
                <div className="text-xs text-gray-500">
                    root@kali
                </div>
                <div className="text-sm text-gray-300">
                    {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Dragon Logo Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="text-[200px] font-black tracking-tighter text-blue-900 rotate-12 select-none">
                    KALI
                </div>
            </div>

            {/* Desktop Icons Grid */}
            <div className="flex flex-col flex-wrap h-[calc(100%-48px)] w-fit content-start p-2 gap-4 z-10 relative mt-10">
                {kaliIcons.map(appId => (
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

        </div>
    );
};

export default KaliDesktop;
